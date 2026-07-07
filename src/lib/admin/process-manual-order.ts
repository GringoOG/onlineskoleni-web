import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/order-notify";
import { getCatalogItem, getBulkDiscountPercent } from "@/lib/order-catalog";
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
  salutation?: "pan" | "pani";
}

export type DiscountMode = "auto" | "0" | "10" | "15";

export interface ProcessManualOrderInput {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactSalutation?: "pan" | "pani";
  phone?: string;
  ico?: string;
  courseSlugs: string[];
  paymentMethod: ManualPaymentMethod;
  participantsRaw?: string;
  adminNote?: string;
  discountMode?: DiscountMode;
}

export interface ProcessManualOrderResult {
  orderNumber: string;
  seatsPurchased: number;
  courseCount: number;
  appliedDiscountPercent: number;
  enrolledStudents: number;
  emailsSent: number;
  emailFailures: { email: string; error: string }[];
  enrollments: EnrollmentResult[];
}

function paymentMethodLabel(method: ManualPaymentMethod): string {
  return method === "INVOICE" ? "faktura" : "hotově";
}

function resolveDiscountPercent(seatCount: number, mode: DiscountMode = "auto"): number {
  if (mode === "0") return 0;
  if (mode === "10") return 10;
  if (mode === "15") return 15;

  const auto = getBulkDiscountPercent(seatCount);
  if (auto === "contact") {
    throw new Error(
      "Pro 100 a více osob nás prosím kontaktujte pro individuální nabídku a slevu."
    );
  }
  return auto;
}

function validateCourseSlugs(courseSlugs: string[]): string[] {
  const unique = [...new Set(courseSlugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0) {
    throw new Error("Vyberte alespoň jeden kurz.");
  }
  for (const slug of unique) {
    if (!getCatalogItem(slug)) {
      throw new Error(`Neznámý kurz: ${slug}`);
    }
  }
  return unique;
}

function buildPerStudentItems(courseSlugs: string[]) {
  return courseSlugs.map((courseSlug) => {
    const catalog = getCatalogItem(courseSlug);
    if (!catalog) {
      throw new Error(`Neznámý kurz: ${courseSlug}`);
    }
    return {
      courseSlug: catalog.courseSlug,
      name: catalog.name,
      quantity: 1,
    };
  });
}

/** Vytvoří PAID objednávku a pro každého účastníka založí účet, enrollment a uvítací e-mail. */
export async function processManualOrder(
  input: ProcessManualOrderInput
): Promise<ProcessManualOrderResult> {
  const companyName = input.companyName.trim();
  const contactName = input.contactName.trim();
  const contactEmail = input.contactEmail.trim().toLowerCase();
  const courseSlugs = validateCourseSlugs(input.courseSlugs);

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
      : [
          {
            name: contactName,
            email: contactEmail,
            salutation: input.contactSalutation,
          },
        ];

  const seatsPurchased = participants.length;
  const discountMode = input.discountMode ?? "auto";
  const appliedDiscountPercent = resolveDiscountPercent(seatsPurchased, discountMode);
  const discountPercentOverride = discountMode === "auto" ? undefined : appliedDiscountPercent;

  const lines = courseSlugs.map((courseSlug) => ({
    courseSlug,
    quantity: seatsPurchased,
  }));

  const { order, cart } = await createManualPaidOrder({
    companyName,
    contactName,
    email: contactEmail,
    phone: input.phone,
    ico: input.ico,
    lines,
    paymentMethod: input.paymentMethod,
    adminNote: input.adminNote,
    discountPercentOverride,
  });

  const allEnrollments: EnrollmentResult[] = [];
  let emailsSent = 0;
  const emailFailures: { email: string; error: string }[] = [];
  const perStudentItems = buildPerStudentItems(courseSlugs);

  for (const participant of participants) {
    const student = await findOrCreateStudent({
      email: participant.email,
      name: participant.name,
      companyName,
      issueNewPassword: true,
    });

    const enrollments = await enrollStudentForOrderItems({
      student,
      orderNumber: order.orderNumber,
      items: perStudentItems,
    });

    allEnrollments.push(...enrollments);

    const emailResult = await sendWelcomeEmail({
      orderNumber: order.orderNumber,
      companyName,
      enrollments,
      recipientName: participant.name,
      recipientSalutation: participant.salutation,
      manualActivation: true,
      paymentMethodLabel: paymentMethodLabel(input.paymentMethod),
    });

    if (emailResult.sent) {
      emailsSent += 1;
    } else {
      emailFailures.push({
        email: participant.email,
        error: emailResult.error ?? (emailResult.skipped ? "resend_not_configured" : "send_failed"),
      });
      console.error(
        `[Manual order] Welcome e-mail NOT sent to ${participant.email}: ${emailResult.error ?? "unknown"}`
      );
    }
  }

  await notifyOrderPaid({
    orderNumber: order.orderNumber,
    companyName,
    contactName,
    email: contactEmail,
    phone: order.phone,
    totalAmountHalere: order.totalAmountHalere,
    items: cart.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { enrollmentProcessedAt: new Date() },
  });

  console.info(
    `[Manual order] ${order.orderNumber}: ${participants.length} student(s), ${courseSlugs.length} course(s), discount ${appliedDiscountPercent}%`
  );

  return {
    orderNumber: order.orderNumber,
    seatsPurchased,
    courseCount: courseSlugs.length,
    appliedDiscountPercent,
    enrolledStudents: participants.length,
    emailsSent,
    emailFailures,
    enrollments: allEnrollments,
  };
}
