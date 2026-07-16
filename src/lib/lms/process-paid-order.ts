import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/order-notify";
import {
  enrollContactForOrderItems,
  enrollStudentForOrderItems,
  type EnrollmentResult,
} from "@/lib/lms/enroll-from-order";
import { findOrCreateStudent } from "@/lib/lms/find-or-create-student";
import { sendWelcomeEmail } from "@/lib/lms/welcome-email";
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
  totalAmountHalere: number;
  enrollmentProcessedAt: Date | null;
  participantsJson?: unknown;
  items: {
    courseSlug: string;
    name: string;
    quantity: number;
  }[];
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

  for (const participant of participants) {
    const student = await findOrCreateStudent({
      email: participant.email,
      name: participant.name,
      companyName: order.companyName,
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
