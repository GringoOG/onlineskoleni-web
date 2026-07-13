import templatesData from "../../../content/certificate-templates.json";

export interface CourseCertificateTemplate {
  codePrefix: string;
  trainingTitle: string;
  legalBasis: string;
  trainerCredential?: string;
}

interface CertificateTemplatesFile {
  trainer: string;
  logoImage?: string;
  stampImage?: string;
  validityLabel: string;
  successText: string;
  instructionsTitle: string;
  instructions: string[];
  courses: Record<string, CourseCertificateTemplate>;
}

const templates = templatesData as CertificateTemplatesFile;

const DEFAULT_COURSE: CourseCertificateTemplate = {
  codePrefix: "KURZ",
  trainingTitle: "Online školení",
  legalBasis: "O absolvování online školení zaměstnanců.",
};

export function getCertificateTemplate(
  courseSlug: string
): CourseCertificateTemplate {
  return templates.courses[courseSlug] ?? DEFAULT_COURSE;
}

export function getCertificateCodePrefix(courseSlug: string): string {
  return getCertificateTemplate(courseSlug).codePrefix;
}

export function getCertificateTrainer(): string {
  return templates.trainer;
}

export function getCertificateTrainerCredential(courseSlug: string): string | null {
  const credential = getCertificateTemplate(courseSlug).trainerCredential?.trim();
  return credential || null;
}

export function getCertificateLogoImagePath(): string | null {
  return templates.logoImage?.trim() || null;
}

export function getCertificateStampImagePath(): string | null {
  return templates.stampImage?.trim() || null;
}

export function getCertificateValidityLabel(years?: number): string {
  if (years === undefined) {
    return templates.validityLabel;
  }
  if (years === 1) return "Platnost certifikátu 1 rok.";
  if (years >= 2 && years <= 4) return `Platnost certifikátu ${years} roky.`;
  return `Platnost certifikátu ${years} let.`;
}

export function getCertificateSuccessText(): string {
  return templates.successText;
}

export function getCertificateInstructions(): {
  title: string;
  items: string[];
} {
  return {
    title: templates.instructionsTitle,
    items: templates.instructions,
  };
}
