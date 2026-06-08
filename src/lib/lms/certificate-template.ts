import templatesData from "../../../content/certificate-templates.json";

export interface CourseCertificateTemplate {
  codePrefix: string;
  trainingTitle: string;
  legalBasis: string;
}

interface CertificateTemplatesFile {
  trainer: string;
  trainerCredential?: string;
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

export function getCertificateTrainerCredential(): string | null {
  return templates.trainerCredential?.trim() || null;
}

export function getCertificateLogoImagePath(): string | null {
  return templates.logoImage?.trim() || null;
}

export function getCertificateStampImagePath(): string | null {
  return templates.stampImage?.trim() || null;
}

export function getCertificateValidityLabel(): string {
  return templates.validityLabel;
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
