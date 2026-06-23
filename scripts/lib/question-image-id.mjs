/** Otázky se stejným ID ve více kurzech mají vlastní soubor {kurz}-{id}.png */
export const COLLISION_QUESTION_IDS = new Set(["q147", "q150"]);

export function resolveQuestionImageId(courseSlug, questionId) {
  if (!questionId) return null;
  if (COLLISION_QUESTION_IDS.has(questionId)) {
    return `${courseSlug}-${questionId}`;
  }
  return questionId;
}

export function pickInstalledImageId(courseSlug, questionId, installedIds) {
  const preferred = resolveQuestionImageId(courseSlug, questionId);
  if (installedIds.has(preferred)) return preferred;
  if (installedIds.has(questionId)) return questionId;
  return preferred;
}
