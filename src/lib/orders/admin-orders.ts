import { prisma } from "@/lib/prisma";
import {
  processPaidOrder,
  toPaidOrderForEnrollment,
} from "@/lib/lms/process-paid-order";
import { parseParticipantsJson } from "@/lib/order-participants";
import { getOrderChannel, type OrderChannel } from "@/lib/orders/order-channel";

export type AdminPaymentStatus = "PAID" | "PENDING";

export interface AdminOrderAccessRecipient {
  name: string;
  email: string;
  courseNames: string[];
}

export interface AdminOrderListItem {
  orderNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  status: string;
  paymentStatus: AdminPaymentStatus;
  channel: OrderChannel;
  totalAmountHalere: number;
  createdAt: string;
  paidStatusChangedAt: string | null;
  /** Počet LMS účastníků z checkoutu (null = legacy jedna kontaktní osoba). */
  participantCount: number | null;
  /**
   * E-maily, na které jdou / šly přístupy do LMS (uvítací e-mail).
   * U starších objednávek bez participantsJson = kontaktní e-mail.
   */
  accessRecipients: AdminOrderAccessRecipient[];
  /** True = processPaidOrder už proběhl (přístupy měly být odeslány). */
  accessEmailsSent: boolean;
}

export interface ListAdminOrdersInput {
  query?: string;
  date?: string;
}

function parseDateFilter(date: string): { gte: Date; lt: Date } | null {
  const trimmed = date.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const start = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { gte: start, lt: end };
  }

  const czMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (czMatch) {
    const [, d, m, y] = czMatch;
    const start = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { gte: start, lt: end };
  }

  return null;
}

function toPaymentStatus(status: string): AdminPaymentStatus {
  return status === "PAID" ? "PAID" : "PENDING";
}

export async function listAdminOrders(
  input: ListAdminOrdersInput = {}
): Promise<AdminOrderListItem[]> {
  const query = input.query?.trim();
  const dateRange = input.date ? parseDateFilter(input.date) : null;

  const orders = await prisma.order.findMany({
    where: {
      ...(dateRange
        ? {
            createdAt: {
              gte: dateRange.gte,
              lt: dateRange.lt,
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { companyName: { contains: query, mode: "insensitive" } },
              { contactName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { payment: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return orders.map((order) => {
    const participants = parseParticipantsJson(order.participantsJson);
    const courseNameBySlug = new Map(
      order.items.map((item) => [item.courseSlug, item.name] as const)
    );
    const allCourseNames = order.items.map((item) => item.name);

    const accessRecipients: AdminOrderAccessRecipient[] = participants
      ? participants.map((participant) => ({
          name: participant.name,
          email: participant.email,
          courseNames: participant.courseSlugs.map(
            (slug) => courseNameBySlug.get(slug) ?? slug
          ),
        }))
      : [
          {
            name: order.contactName,
            email: order.email,
            courseNames: allCourseNames,
          },
        ];

    return {
      orderNumber: order.orderNumber,
      companyName: order.companyName,
      contactName: order.contactName,
      email: order.email,
      status: order.status,
      paymentStatus: toPaymentStatus(order.status),
      channel: getOrderChannel(order),
      totalAmountHalere: order.totalAmountHalere,
      createdAt: order.createdAt.toISOString(),
      paidStatusChangedAt: order.paidStatusChangedAt?.toISOString() ?? null,
      participantCount: participants ? participants.length : null,
      accessRecipients,
      accessEmailsSent: Boolean(order.enrollmentProcessedAt),
    };
  });
}

export async function setAdminOrderPaymentStatus(
  orderNumber: string,
  paymentStatus: AdminPaymentStatus
) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true },
  });

  if (!order) {
    return { ok: false as const, error: "Objednávka nenalezena." };
  }

  const now = new Date();
  const nextStatus = paymentStatus === "PAID" ? "PAID" : "PENDING";

  if (order.status === nextStatus) {
    return {
      ok: true as const,
      order: {
        orderNumber: order.orderNumber,
        paymentStatus: toPaymentStatus(order.status),
        paidStatusChangedAt: order.paidStatusChangedAt?.toISOString() ?? null,
      },
      unchanged: true,
    };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      paidStatusChangedAt: now,
      ...(nextStatus === "PENDING" && order.payment
        ? {
            payment: {
              update: {
                state:
                  order.payment.state === "MANUAL"
                    ? "MANUAL"
                    : order.payment.gopayPaymentId
                      ? "CREATED"
                      : "AWAITING_TRANSFER",
              },
            },
          }
        : {}),
      ...(nextStatus === "PAID" && order.payment && order.payment.state !== "MANUAL"
        ? {
            payment: {
              update: {
                state: order.payment.gopayPaymentId ? "PAID" : "TRANSFER_RECEIVED",
              },
            },
          }
        : {}),
    },
  });

  if (nextStatus === "PAID") {
    const refreshed = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    if (refreshed) {
      try {
        await processPaidOrder(toPaidOrderForEnrollment(refreshed));
      } catch (error) {
        console.error("[setAdminOrderPaymentStatus] processPaidOrder:", error);
      }
    }
  }

  return {
    ok: true as const,
    order: {
      orderNumber: order.orderNumber,
      paymentStatus: paymentStatus,
      paidStatusChangedAt: now.toISOString(),
    },
    unchanged: false,
  };
}
