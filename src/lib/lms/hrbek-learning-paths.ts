/** Cesta do microlearning aplikace HRBEK (statická SPA v public/). */
export function getHrbekLearningPath(
  courseSlug?: string,
  options?: { demo?: boolean }
): string {
  const params = new URLSearchParams();
  if (options?.demo) {
    params.set("demo", "1");
  }
  if (courseSlug) {
    params.set("course", courseSlug);
  }
  const query = params.toString();
  return query ? `/hrbek-learning/?${query}` : "/hrbek-learning/";
}
