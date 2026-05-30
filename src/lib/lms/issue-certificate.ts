import { and, eq } from "drizzle-orm";
import { certificates, courses, db, users } from "@/db";
import { createCertificateCode } from "@/lib/lms/certificate-code";
import {
  CERTIFICATE_VALIDITY_YEARS,
  getCertificateDownloadPath,
} from "@/lib/lms/certificate-config";

type DbExecutor = Pick<typeof db, "select" | "insert" | "update">;

export interface IssuedCertificate {
  certificateId: string;
  certificateCode: string;
  downloadUrl: string;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

async function findExistingCertificate(
  client: DbExecutor,
  userId: string,
  courseId: string
): Promise<IssuedCertificate | null> {
  const [existing] = await client
    .select({
      id: certificates.id,
      certificateCode: certificates.certificateCode,
    })
    .from(certificates)
    .where(
      and(eq(certificates.userId, userId), eq(certificates.courseId, courseId))
    )
    .limit(1);

  if (!existing) {
    return null;
  }

  return {
    certificateId: existing.id,
    certificateCode: existing.certificateCode,
    downloadUrl: getCertificateDownloadPath(existing.id),
  };
}

async function insertCertificate(
  client: DbExecutor,
  input: {
    userId: string;
    courseId: string;
    issuedAt: Date;
    expiresAt: Date;
  }
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const certificateCode = createCertificateCode();

    try {
      const [created] = await client
        .insert(certificates)
        .values({
          userId: input.userId,
          courseId: input.courseId,
          certificateCode,
          pdfUrl: "/",
          issuedAt: input.issuedAt,
          expiresAt: input.expiresAt,
        })
        .returning();

      const downloadUrl = getCertificateDownloadPath(created.id);

      await client
        .update(certificates)
        .set({ pdfUrl: downloadUrl })
        .where(eq(certificates.id, created.id));

      return { ...created, pdfUrl: downloadUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("unique") || message.includes("duplicate")) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Nepodařilo se vygenerovat unikátní kód certifikátu.");
}

/** Vydá certifikát po úspěšném testu; existující certifikát pro kurz se znovu nevytváří. */
export async function issueCertificate(
  userId: string,
  courseId: string,
  tx?: DbExecutor
): Promise<IssuedCertificate> {
  const client = tx ?? db;

  const existing = await findExistingCertificate(client, userId, courseId);
  if (existing) {
    return existing;
  }

  const [[user], [course]] = await Promise.all([
    client
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    client
      .select({ title: courses.title })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1),
  ]);

  if (!user || !course) {
    throw new Error("Uživatel nebo kurz pro certifikát nebyl nalezen.");
  }

  const issuedAt = new Date();
  const expiresAt = addYears(issuedAt, CERTIFICATE_VALIDITY_YEARS);

  const created = await insertCertificate(client, {
    userId,
    courseId,
    issuedAt,
    expiresAt,
  });

  return {
    certificateId: created.id,
    certificateCode: created.certificateCode,
    downloadUrl: getCertificateDownloadPath(created.id),
  };
}

export interface CertificateDownloadData {
  studentName: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: Date;
  expiresAt: Date;
}

/** Načte data certifikátu pro generování PDF (s ověřením vlastnictví). */
export async function getCertificateForDownload(
  certificateId: string,
  userId: string
): Promise<CertificateDownloadData | null> {
  const [row] = await db
    .select({
      certificateCode: certificates.certificateCode,
      issuedAt: certificates.issuedAt,
      expiresAt: certificates.expiresAt,
      studentName: users.name,
      courseTitle: courses.title,
      ownerId: certificates.userId,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.id, certificateId))
    .limit(1);

  if (!row || row.ownerId !== userId) {
    return null;
  }

  return {
    studentName: row.studentName,
    courseTitle: row.courseTitle,
    certificateCode: row.certificateCode,
    issuedAt: row.issuedAt,
    expiresAt: row.expiresAt,
  };
}
