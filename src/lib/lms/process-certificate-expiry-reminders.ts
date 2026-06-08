import { and, eq, isNull, lte } from "drizzle-orm";
import { certificates, courses, db, users } from "@/db";
import { sendCertificateExpiryReminderEmail } from "@/lib/lms/certificate-expiry-reminder-email";

/** Kolik dní před koncem platnosti (nebo po něm) poslat první připomenutí. */
export const CERTIFICATE_EXPIRY_REMINDER_WINDOW_DAYS = 14;

export interface ProcessCertificateExpiryRemindersResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

export async function processCertificateExpiryReminders(): Promise<ProcessCertificateExpiryRemindersResult> {
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + CERTIFICATE_EXPIRY_REMINDER_WINDOW_DAYS);
  windowEnd.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      certificateId: certificates.id,
      certificateCode: certificates.certificateCode,
      expiresAt: certificates.expiresAt,
      studentName: users.name,
      studentEmail: users.email,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(
      and(
        isNull(certificates.expiryReminderSentAt),
        lte(certificates.expiresAt, windowEnd)
      )
    );

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    const result = await sendCertificateExpiryReminderEmail({
      studentName: row.studentName,
      studentEmail: row.studentEmail,
      courseTitle: row.courseTitle,
      courseSlug: row.courseSlug,
      certificateCode: row.certificateCode,
      expiresAt: row.expiresAt,
    });

    if (result.sent) {
      await db
        .update(certificates)
        .set({ expiryReminderSentAt: new Date() })
        .where(eq(certificates.id, row.certificateId));
      sent++;
    } else if (result.skipped) {
      skipped++;
    } else {
      failed++;
    }
  }

  return {
    processed: rows.length,
    sent,
    failed,
    skipped,
  };
}
