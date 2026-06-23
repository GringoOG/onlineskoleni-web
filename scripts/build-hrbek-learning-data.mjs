import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildSlideCopy, setHrbekTheoryChapters } from "./hrbek-slide-content.mjs";

const ROOT = process.cwd();
const THEORY_PATH = path.join(ROOT, "content/theory/hrbek.json");
const SLIDE_OVERRIDES_PATH = path.join(ROOT, "content/theory/hrbek-slide-overrides.json");
const CATALOG_PATH = path.join(ROOT, "content/order-catalog.json");
const COURSES_PATH = path.join(ROOT, "content/courses.json");
const QUIZ_DIR = path.join(ROOT, "content/quizzes");
const OUT_DIR = path.join(ROOT, "public/hrbek-learning");
const OUT_PATH = path.join(OUT_DIR, "data.json");

const OFFICIAL_QUIZ_FILES = {
  bozp: "bozp-oficialni-zamestnanec.json",
  pozarni: "pozarni-oficialni-zamestnanec.json",
  ridici: "ridici-oficialni.json",
  bremena: "bremena-oficialni.json",
  gdpr: "gdpr-oficialni.json",
  ergonomie: "ergonomie-oficialni.json",
};

const FINAL_TEST_CONFIG = {
  bremena: { questionCount: 10, passPercent: 80 },
  default: { questionCount: 15, passPercent: 80 },
};

function stripQuestion(question) {
  return {
    id: question.id,
    text: question.text,
    options: question.options,
    correctIndex: question.correctIndex,
  };
}

function buildSlide(question, index, slug, overrides) {
  const key = `${slug}:${question.id}`;
  const override = overrides[key] ?? overrides[question.id];
  const copy = buildSlideCopy(slug, question);

  return {
    id: `${slug}-slide-${index + 1}`,
    heading: override?.heading ?? copy.heading,
    paragraphs: override?.paragraphs ?? copy.paragraphs,
    svg_placeholder: override?.svg_placeholder ?? key,
    checkQuestions: [stripQuestion(question)],
  };
}

async function loadQuiz(fileName) {
  return JSON.parse(await readFile(path.join(QUIZ_DIR, fileName), "utf8"));
}

async function loadSlideOverrides() {
  try {
    const raw = await readFile(SLIDE_OVERRIDES_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function main() {
  const [theory, catalog, courses, slideOverrides] = await Promise.all([
    readFile(THEORY_PATH, "utf8").then(JSON.parse),
    readFile(CATALOG_PATH, "utf8").then(JSON.parse),
    readFile(COURSES_PATH, "utf8").then(JSON.parse),
    loadSlideOverrides(),
  ]);

  setHrbekTheoryChapters(theory.chapters);

  const courseMeta = Object.fromEntries(courses.map((course) => [course.slug, course]));
  const prices = Object.fromEntries(
    catalog
      .filter((item) => !item.bundleCourses)
      .map((item) => [item.courseSlug, item.pricePerPersonHalere / 100])
  );

  const categories = [];

  for (const chapter of theory.chapters) {
    const slug = chapter.courseSlug;
    const quiz = await loadQuiz(OFFICIAL_QUIZ_FILES[slug]);
    const testConfig = FINAL_TEST_CONFIG[slug] ?? FINAL_TEST_CONFIG.default;
    const meta = courseMeta[slug];
    const overrides = slideOverrides[slug] ?? {};

    const slides = quiz.questions.map((question, index) =>
      buildSlide(question, index, slug, overrides)
    );

    categories.push({
      slug,
      title: chapter.title,
      shortTitle: meta?.shortTitle ?? slug.toUpperCase(),
      color: meta?.color ?? "slate",
      priceCzk: prices[slug] ?? 149,
      slides,
      finalTest: {
        title: quiz.title,
        subtitle: quiz.subtitle ?? "",
        questionCount: Math.min(testConfig.questionCount, quiz.questions.length),
        passPercent: testConfig.passPercent,
        minCorrect: Math.ceil(
          (Math.min(testConfig.questionCount, quiz.questions.length) *
            testConfig.passPercent) /
            100
        ),
        pool: quiz.questions.map(stripQuestion),
      },
    });

    console.log(
      `${slug}: ${slides.length} lekcí (zásobník testu ${quiz.questions.length} otázek)`
    );
  }

  const payload = {
    appTitle: theory.title,
    generatedAt: new Date().toISOString(),
    categories,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Uloženo: ${OUT_PATH} (${categories.length} kategorií)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
