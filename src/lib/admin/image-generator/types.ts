export const GENERATED_IMAGE_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export type GeneratedImageStatus = (typeof GENERATED_IMAGE_STATUSES)[number];

export interface ParsedPromptLine {
  fileName: string;
  prompt: string;
}

export interface GeneratedImageRecord {
  id: string;
  fileName: string;
  prompt: string;
  imageUrl: string | null;
  status: GeneratedImageStatus;
  errorMessage: string | null;
  createdAt: string;
}
