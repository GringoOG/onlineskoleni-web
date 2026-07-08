import path from "node:path";

export const STUDY_MATERIAL_DIR = path.join(process.cwd(), "content/study-materials");

export function getStudyMaterialFileName(courseSlug: string): string {
  return `studijni-material-${courseSlug}.pdf`;
}

export function getStudyMaterialFilePath(courseSlug: string): string {
  return path.join(STUDY_MATERIAL_DIR, getStudyMaterialFileName(courseSlug));
}

/** URL pro stažení PDF (vyžaduje přihlášení a enrollment). */
export function getStudyMaterialDownloadUrl(courseSlug: string): string {
  return `/api/lms/study-material/${courseSlug}`;
}
