import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/order-notify";
import {
  enrollContactForOrderItems,
  enrollStudentForOrderItems,
  type EnrollmentResult,
} from "@/lib/lms/enroll-from-order";
import { findOrCreateStudent } from "@/lib/lms/find-or-create-student";
import { sendWelcomeEmail } from "@/lib/lms/welcome-email";
import { sendOrderThankYouEmail } from "@/lib/email/order-thank-you-email";
import {
  parseParticipantsJson,
  type OrderParticipantInput,
} from "@/lib/order-participants";

export interface PaidOrderForEnrollment {
  id: string;
  orderNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  paymentMethod?: string | null;
  totalAmountHalere: number;
  enrollmentProcessedAt: Date | null;
  participantsJson?: unknown;
  items: {
    courseSlug: string;
    name: string;
    quantity: number;
  }[];
}

function isManualPaymentMethod(method: string | null | undefined): boolean {
  return method === "INVOICE" || method === "CASH";
}

function paymentMethodLabelForEmails(method: string | null | undefined): string {
  if (method === "INVOICE") return "faktura";
  if (method === "CASH") return "hotově";
  if (method === "BANK_TRANSFER") return "po přijetí platby";
  if (method === "GOPAY") return "online platba";
  return "po přijetí platby";
}

export interface ProcessPaidOrderResult {
  alreadyProcessed: boolean;
  enrollments: EnrollmentResult[];
}

function itemsForParticipant(
  order: PaidOrderForEnrollment,
  participant: OrderParticipantInput
) {
  return participant.courseSlugs.map((courseSlug) => {
    const item = order.items.find((row) => row.courseSlug === courseSlug);
    return {
      courseSlug,
      name: item?.name ?? courseSlug,
      quantity: 1,
    };
  });
}

async function enrollParticipants(
  order: PaidOrderForEnrollment,
  participants: OrderParticipantInput[]
): Promise<EnrollmentResult[]> {
  const allEnrollments: EnrollmentResult[] = [];
  const manual = isManualPaymentMethod(order.paymentMethod);

  for (const participant of participants) {
    const student = await findOrCreateStudent({
      email: participant.email,
      name: participant.name,
      companyName: order.companyName,
      issueNewPassword: manual ? true : undefined,
    });

    const enrollments = await enrollStudentForOrderItems({
      student,
      orderNumber: order.orderNumber,
      items: itemsForParticipant(order, participant),
    });

    allEnrollments.push(...enrollments);

    const emailResult = await sendWelcomeEmail({
      orderNumber: order.orderNumber,
      companyName: order.companyName,
      enrollments,
      recipientName: participant.name,
      manualActivation: manual,
      paymentMethodLabel: paymentMethodLabelForEmails(order.paymentMethod),
    });

    if (!emailResult.sent) {
      console.error(
        `[LMS enrollment] Welcome e-mail NOT sent to ${participant.email}: ${emailResult.error ?? "unknown"}`
      );
    }
  }

  return allEnrollments;
}

/** Po zaplacení: enrollment do LMS, uvítací e-mail, notifikace provozovateli. Idempotentní. */
export async function processPaidOrder(
  order: PaidOrderForEnrollment
): Promise<ProcessPaidOrderResult> {
  if (order.enrollmentProcessedAt) {
    return { alreadyProcessed: true, enrollments: [] };
  }

  const participants = parseParticipantsJson(order.participantsJson);
  let enrollments: EnrollmentResult[];

  if (participants) {
    enrollments = await enrollParticipants(order, participants);

    const thankYouResult = await sendOrderThankYouEmail({
      orderNumber: order.orderNumber,
      companyName: order.companyName,
      contactName: order.contactName,
      contactEmail: order.email,
      paymentMethodLabel: paymentMethodLabelForEmails(order.paymentMethod),
      participants: participants.map((participant) => ({
        name: participant.name,
        email: participant.email,
        courseNames: participant.courseSlugs.map(
          (slug) =>
            order.items.find((item) => item.courseSlug === slug)?.name ?? slug
        ),
      })),
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    });

    if (!thankYouResult.sent) {
      console.error(
        `[LMS enrollment] Thank-you e-mail NOT sent to ${order.email}: ${thankYouResult.error ?? "unknown"}`
      );
    }
  } else {
    enrollments = await enrollContactForOrderItems({
      email: order.email,
      name: order.contactName,
      companyName: order.companyName,
      orderNumber: order.orderNumber,
      items: order.items,
    });

    const emailResult = await sendWelcomeEmail({
      orderNumber: order.orderNumber,
      companyName: order.companyName,
      enrollments,
      recipientName: order.contactName,
    });

    if (!emailResult.sent) {
      console.error(
        `[LMS enrollment] Welcome e-mail NOT sent to ${order.email}: ${emailResult.error ?? "unknown"}`
      );
    }
  }

  await notifyOrderPaid({
    orderNumber: order.orderNumber,
    companyName: order.companyName,
    contactName: order.contactName,
    email: order.email,
    phone: order.phone,
    totalAmountHalere: order.totalAmountHalere,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { enrollmentProcessedAt: new Date() },
  });

  const uniqueEmails = new Set(enrollments.map((row) => row.studentEmail));
  console.info(
    `[LMS enrollment] Order ${order.orderNumber}: ${enrollments.length} course assignment(s) for ${uniqueEmails.size} student(s)`
  );

  return { alreadyProcessed: false, enrollments };
}

/** Mapuje Prisma objednávku na vstup pro processPaidOrder. */
export function toPaidOrderForEnrollment(order: {
  id: string;
  orderNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  paymentMethod?: string | null;
  totalAmountHalere: number;
  enrollmentProcessedAt: Date | null;
  participantsJson?: unknown;
  items: { courseSlug: string; name: string; quantity: number }[];
}): PaidOrderForEnrollment {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    companyName: order.companyName,
    contactName: order.contactName,
    email: order.email,
    phone: order.phone,
    paymentMethod: order.paymentMethod ?? null,
    totalAmountHalere: order.totalAmountHalere,
    enrollmentProcessedAt: order.enrollmentProcessedAt,
    participantsJson: order.participantsJson,
    items: order.items.map((item) => ({
      courseSlug: item.courseSlug,
      name: item.name,
      quantity: item.quantity,
    })),
  };
}
