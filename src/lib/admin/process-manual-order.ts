import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/order-notify";
import { getCatalogItem } from "@/lib/order-catalog";
import { createManualPaidOrder, type ManualPaymentMethod } from "@/lib/orders";
import { parseParticipants } from "@/lib/admin/parse-participants";
import { findOrCreateStudent } from "@/lib/lms/find-or-create-student";
import {
  enrollStudentForOrderItems,
  type EnrollmentResult,
} from "@/lib/lms/enroll-from-order";
import { sendWelcomeEmail } from "@/lib/lms/welcome-email";

export interface ManualOrderParticipant {
  name: string;
  email: string;
}

export interface ProcessManualOrderInput {
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  ico?: string;
  courseSlug: string;
  paymentMethod: ManualPaymentMethod;
  participantsRaw?: string;
  adminNote?: string;
}

export interface ProcessManualOrderResult {
  orderNumber: string;
  seatsPurchased: number;
  enrolledStudents: number;
  emailsSent: number;
  enrollments: EnrollmentResult[];
}

function paymentMethodLabel(method: ManualPaymentMethod): string {
  return method === "INVOICE" ? "faktura" : "hotově";
}

function buildOrderItems(courseSlug: string, quantity: number) {
  const catalog = getCatalogItem(courseSlug);
  if (!catalog) {
    throw new Error(`Neznámý kurz: ${courseSlug}`);
  }

  return [
    {
      courseSlug: catalog.courseSlug,
      name: catalog.name,
      quantity,
    },
  ];
}

function buildPerStudentItems(courseSlug: string) {
  return buildOrderItems(courseSlug, 1);
}

/** Vytvoří PAID objednávku a pro každého účastníka založí účet, enrollment a uvítací e-mail. */
export async function processManualOrder(
  input: ProcessManualOrderInput
): Promise<ProcessManualOrderResult> {
  const companyName = input.companyName.trim();
  const contactName = input.contactName.trim();
  const contactEmail = input.contactEmail.trim().toLowerCase();

  if (!companyName || !contactName || !contactEmail) {
    throw new Error("Vyplňte firmu, jméno kontaktu a e-mail.");
  }

  const parsed = parseParticipants(input.participantsRaw ?? "");
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.join(" "));
  }

  const participants: ManualOrderParticipant[] =
    parsed.participants.length > 0
      ? parsed.participants
      : [{ name: contactName, email: contactEmail }];

  const seatsPurchased = participants.length;
  const orderItems = buildOrderItems(input.courseSlug, seatsPurchased);

  const { order } = await createManualPaidOrder({
    companyName,
    contactName,
    email: contactEmail,
    phone: input.phone,
    ico: input.ico,
    lines: [{ courseSlug: input.courseSlug, quantity: seatsPurchased }],
    paymentMethod: input.paymentMethod,
    adminNote: input.adminNote,
  });

  const allEnrollments: EnrollmentResult[] = [];
  let emailsSent = 0;

  for (const participant of participants) {
    const student = await findOrCreateStudent({
      email: participant.email,
      name: participant.name,
      companyName,
    });

    const enrollments = await enrollStudentForOrderItems({
      student,
      orderNumber: order.orderNumber,
      items: buildPerStudentItems(input.courseSlug),
    });

    allEnrollments.push(...enrollments);

    await sendWelcomeEmail({
      orderNumber: order.orderNumber,
      companyName,
      enrollments,
      manualActivation: true,
      paymentMethodLabel: paymentMethodLabel(input.paymentMethod),
    });
    emailsSent += 1;
  }

  await notifyOrderPaid({
    orderNumber: order.orderNumber,
    companyName,
    contactName,
    email: contactEmail,
    phone: order.phone,
    totalAmountHalere: order.totalAmountHalere,
    items: orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { enrollmentProcessedAt: new Date() },
  });

  console.info(
    `[Manual order] ${order.orderNumber}: ${participants.length} student(s), ${emailsSent} email(s)`
  );

  return {
    orderNumber: order.orderNumber,
    seatsPurchased,
    enrolledStudents: participants.length,
    emailsSent,
    enrollments: allEnrollments,
  };
}
