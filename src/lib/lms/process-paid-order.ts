import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/order-notify";
import { enrollContactForOrderItems } from "@/lib/lms/enroll-from-order";
import { sendWelcomeEmail } from "@/lib/lms/welcome-email";

export interface PaidOrderForEnrollment {
  id: string;
  orderNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  totalAmountHalere: number;
  enrollmentProcessedAt: Date | null;
  items: {
    courseSlug: string;
    name: string;
    quantity: number;
  }[];
}

export interface ProcessPaidOrderResult {
  alreadyProcessed: boolean;
  enrollments: Awaited<ReturnType<typeof enrollContactForOrderItems>>;
}

/** Po zaplacení: enrollment do LMS, uvítací e-mail, notifikace provozovateli. Idempotentní. */
export async function processPaidOrder(
  order: PaidOrderForEnrollment
): Promise<ProcessPaidOrderResult> {
  if (order.enrollmentProcessedAt) {
    return { alreadyProcessed: true, enrollments: [] };
  }

  const enrollments = await enrollContactForOrderItems({
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

  console.info(
    `[LMS enrollment] Order ${order.orderNumber}: ${enrollments.length} course(s) for ${order.email}`
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
  totalAmountHalere: number;
  enrollmentProcessedAt: Date | null;
  items: { courseSlug: string; name: string; quantity: number }[];
}): PaidOrderForEnrollment {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    companyName: order.companyName,
    contactName: order.contactName,
    email: order.email,
    phone: order.phone,
    totalAmountHalere: order.totalAmountHalere,
    enrollmentProcessedAt: order.enrollmentProcessedAt,
    items: order.items.map((item) => ({
      courseSlug: item.courseSlug,
      name: item.name,
      quantity: item.quantity,
    })),
  };
}
