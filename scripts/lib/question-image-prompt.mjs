/**
 * Generování AI promptů k ilustracím – jeden prompt na otázku v učebním textu.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSlideCopy } from "../hrbek-slide-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../..");

export const STYLE_PREFIX =
  "A premium, modern 2D vector illustration for a corporate microlearning app.";

export const STYLE_SUFFIX =
  "Clean flat design, corporate color palette (soft blues, grays, accents of green and orange), isolated on a solid light gray background. Extremely professional, high detail, no text inside the image. Green checkmark badges for correct practices; red X badges for incorrect alternatives. Soft layered shadows, subtle gradients.";

export const ASPECT_RATIO = "--ar 4:3";

const COURSE_TITLES = {
  bozp: "BOZP — Bezpečnost a ochrana zdraví při práci",
  pozarni: "Požární ochrana — PO",
  ridici: "Referenti řidičů",
  bremena: "Manipulace s břemeny",
  gdpr: "GDPR — Ochrana osobních údajů",
  ergonomie: "Ergonomie práce",
};

/** @type {Map<string, string>} */
let legacyPromptByQuestion = null;

function loadLegacyPromptMap() {
  if (legacyPromptByQuestion) return legacyPromptByQuestion;

  legacyPromptByQuestion = new Map();
  const data = JSON.parse(
    readFileSync(path.join(ROOT, "content/theory/ai-image-prompts-legacy-themes.json"), "utf8")
  );

  for (const course of data.courses) {
    for (const theme of course.themes) {
      const scene = stripStyle(theme.prompt);
      for (const id of expandLessonIds(theme.lessons, course.id)) {
        if (!legacyPromptByQuestion.has(id)) {
          legacyPromptByQuestion.set(id, scene);
        }
      }
    }
  }

  return legacyPromptByQuestion;
}

function stripStyle(prompt) {
  return prompt
    .replace(new RegExp(`\\s*${escapeRegExp(STYLE_PREFIX)}\\s*`, "i"), "")
    .replace(/\s*Clean flat design[\s\S]*$/i, "")
    .replace(/\s*--ar 4:3\s*$/i, "")
    .trim()
    .replace(/\.$/, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Rozbalí zápis lekcí z původního souboru (q94, off-b3–b7, demo-b1 …). */
export function expandLessonIds(lessons, courseId) {
  const ids = new Set();
  const prefixes = ["", "demo-", "off-"];

  for (const rawPart of lessons.split(",")) {
    const part = rawPart.trim();
    if (!part) continue;

    const range = part.match(/^([a-zA-Z-]*?)(\d+)[–-]([a-zA-Z-]*?)(\d+)$/);
    if (range) {
      const [, p1, startStr, p2, endStr] = range;
      const start = Number(startStr);
      const end = Number(endStr);
      for (let n = start; n <= end; n += 1) {
        addLessonVariants(ids, `${p1}${n}`, courseId);
        if (p2) addLessonVariants(ids, `${p2}${n}`, courseId);
      }
      continue;
    }

    addLessonVariants(ids, part, courseId);
  }

  return [...ids];
}

function addLessonVariants(set, token, courseId) {
  set.add(token);

  if (token.startsWith("q") || token.startsWith("demo") || token.startsWith("off-")) {
    set.add(token);
    return;
  }

  const numeric = token.match(/^([a-z-]*?)(\d+)$/i);
  if (!numeric) return;

  const [, letters, num] = numeric;
  const suffix = letters ? `${letters}${num}` : num;

  if (courseId === "bremena") {
    set.add(`demo-b${num}`);
    set.add(`off-b${num}`);
  } else if (courseId === "ergonomie") {
    set.add(`demo-e${num}`);
    set.add(`off-e${num}`);
  } else if (courseId === "gdpr") {
    set.add(`demo-g${num}`);
    set.add(`off-g${num}`);
  } else if (courseId === "ridici") {
    set.add(`demo-r${num}`);
    set.add(`q-r${num}`);
  } else if (courseId === "pozarni") {
    set.add(`demo${num}`);
  } else if (courseId === "bozp") {
    set.add(`q${num}`);
  }

  set.add(suffix);
  set.add(`off-${suffix}`);
  set.add(`demo-${suffix}`);
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Krátký anglický vizuální doplněk podle znění otázky – odliší sdílená témata. */
function questionVisualDetail(ctx) {
  const t = ctx.combined;

  const rules = [
    [/hasicí|hasič|požár|evakuac|požární|požárník|hasičsk/, "Red extinguisher, exit sign, evacuation arrows, and calm fire-safety training group icons"],
    [/hmotnostní limit|15 kg|10 kg|nosnost/, "Weight limit icons with male and female worker silhouettes and differently sized box symbols"],
    [/páteř|straight spine|bent knees|ohnutých kolen/, "Detailed spine alignment guide with bent knees versus rounded back comparison"],
    [/chodidel|nohou|flat on floor/, "Foot placement diagram showing flat soles versus unstable stance"],
    [/blízko těla|close to body/, "Load held close to torso with green proximity arc"],
    [/trhavým|rychlým pohybem/, "Motion blur warning on jerky lift versus smooth controlled movement"],
    [/výšce nad podlahou|ergonomická zóna/, "Vertical reach zone arc between knee and shoulder height"],
    [/kumulativní/, "Stacked boxes with cumulative load symbol over an eight-hour clock"],
    [/těhotenstv/, "Pregnant worker silhouette with reduced load limit badge"],
    [/mechanick|vozík|palet/, "Pallet jack and mechanical lifting aid in warehouse aisle"],
    [/monitor|očí|vzdálenost/, "Monitor at arm-length distance with eye-level alignment guide"],
    [/20-20-20|pauz|unaveným očím/, "Worker looking toward distant window during eye-relief break"],
    [/klávesnic|zápěst|myš/, "Neutral wrist posture at keyboard with ergonomic mouse"],
    [/bederní opěrka|lumbar/, "Ergonomic chair lumbar support highlighted in side view"],
    [/karpáln|rsi|krk|želví/, "Stylized hand and neck strain diagram with orange tension markers"],
    [/sit-stand|výškově stavitel/, "Height-adjustable desk in sitting and standing positions"],
    [/gdpr|úooú|správce|zpracovatel/, "Corporate data flow diagram with shield locks and role icons"],
    [/souhlas|právo subjektu|přenositelnost/, "User silhouette reclaiming personal data folder from server"],
    [/porušení zabezpečení|72 hodin/, "Database leak icon with urgent notification arrows"],
    [/předjížd|řidič|pás|vozid/, "Car interior or top-down road scene with traffic symbols"],
    [/oopp|rukavic|přilb|vest/, "Worker in full PPE with checklist clipboard and toolbox"],
    [/alkohol|breathalyzer|návykov/, "Prohibited bottle icon with breathalyzer device"],
    [/lékař|prohlídk/, "Medical examination scene with stethoscope and chart icons"],
    [/úraz|závad|hlásit/, "Employee reporting hazard to supervisor with alert icons"],
    [/elektrick|spotřebič|jiskř/, "Appliance unplugged safely versus sparking faulty device"],
    [/první pomoc|záchrance/, "First-aid responder prioritizing own safety with green shield"],
    [/pořádek|úklid/, "Tidy organized workplace versus cluttered hazard zone"],
    [/bezpečnostní značk/, "Safety signage wall with training group and green check badges"],
  ];

  for (const [pattern, detail] of rules) {
    if (pattern.test(t)) return detail;
  }

  return null;
}

function compositionVariant(ctx) {
  const variants = [
    "Balanced centered composition with the main subject in the foreground.",
    "Split-panel left-right comparison layout highlighting correct versus incorrect behavior.",
    "Isometric workplace vignette with soft depth layers and clear icon hierarchy.",
    "Horizontal three-step instructional sequence using icons only, no text labels.",
    "Diagonal visual flow guiding the eye from hazard symbol to safe action.",
    "Bento-style grid of related safety icons around a central worker figure.",
  ];
  let hash = 0;
  for (const ch of ctx.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return variants[hash % variants.length];
}

function uniqueAccent(ctx) {
  const accents = [
    "Orange warning triangle accent placed on the left third of the frame.",
    "Green checkmark badge accent placed on the upper right corner.",
    "Red X badge accent placed on the lower left corner.",
    "Soft blue circular highlight behind the main icon cluster.",
    "Warm orange rim light on the primary worker silhouette.",
    "Secondary small toolbox prop in the lower right foreground.",
    "Subtle clipboard icon prop in the upper left foreground.",
    "Directional arrow icons flowing from left to right across the scene.",
    "Small hard-hat icon badge near the top edge of the composition.",
    "Floor marking stripes subtly visible beneath the main scene.",
    "Single safety cone prop in the background for depth.",
    "Muted factory window grid in the far background.",
  ];
  let hash = 0;
  for (let i = 0; i < ctx.id.length; i += 1) {
    hash = (hash * 31 + ctx.id.charCodeAt(i) * (i + 1)) >>> 0;
  }
  const mod = (value, length) => ((value % length) + length) % length;
  const a = accents[mod(hash, accents.length)];
  const b = accents[mod(hash >>> 4, accents.length)];
  if (a === b) {
    return `${a} Slight camera tilt variation for a distinct crop.`;
  }
  return `${a} ${b}`;
}

function focalDetail(ctx) {
  const matched = questionVisualDetail(ctx);
  if (matched) return matched;

  if (ctx.course === "pozarni") {
    return "Fire protection training icons: alarm pull station, extinguisher, evacuation route arrows, and calm safe behavior during fire drill";
  }

  const courseLabels = {
    bozp: "occupational health and safety",
    pozarni: "fire protection",
    ridici: "company driver safety",
    bremena: "manual handling of loads",
    gdpr: "personal data protection",
    ergonomie: "office ergonomics",
  };

  return `Instructional ${courseLabels[ctx.course] ?? "workplace training"} scene tailored to lesson ${ctx.id}`;
}

function buildSceneFromRules(ctx) {
  const t = ctx.combined;
  const course = ctx.course;

  if (course === "bozp") {
    if (/kdo je podle zákona.*zajišťovat bezpečnost/.test(t)) {
      return "Employer and employee figures flanking a large shared safety shield on a factory floor, symbolizing joint legal responsibility for workplace health and safety";
    }
    if (/první prioritou.*první pomoc/.test(t)) {
      return "First-aid scene where rescuer checks own safety first with green shield badge before approaching injured colleague, red X on reckless rush";
    }
    if (/účel osobních ochranných|oopp/.test(t)) {
      return "Worker wearing hard hat, safety goggles, hi-vis vest, gloves and boots beside damaged-glove comparison with green check on proper PPE";
    }
    if (/poprvé nastoup/.test(t)) {
      return "New employee orientation at safety briefing desk with training materials and employer handshake before first shift";
    }
    if (/hlásí pracovní úraz/.test(t)) {
      return "Employee with bandaged arm immediately reporting to supervisor, incident form clipboard and alert icon, green check on prompt reporting";
    }
    if (/evakuace.*požár/.test(t)) {
      return "Calm evacuation through marked exit toward outdoor assembly point icon, green running-man sign, no panic gestures";
    }
    if (/přidělené oopp/.test(t)) {
      return "Supervisor handing PPE to worker at job station, green check when equipment is worn, red X on skipped protection";
    }
    if (/prevenci rizik/.test(t)) {
      return "Workplace hazard identification board with risk icons, barriers, and prevention checklist, green check on controlled risks";
    }
    if (/pokynům k bezpečnosti/.test(t)) {
      return "Attentive worker following supervisor safety instructions at machine panel, green check on compliance attitude";
    }
    if (/pořádek na pracovišti/.test(t)) {
      return "Split scene: tidy organized workstation reducing trip hazards versus cluttered floor with red slip warning";
    }
    if (/bezpečnostní značk/.test(t)) {
      return "Workplace safety signs and signals on walls with employees trained to understand them, green check on visible signage program";
    }
    if (/organizovat práci.*postupy/.test(t)) {
      return "Manager at planning board defining safe work procedures while workers follow standardized steps at stations";
    }
    if (/zvýšeným rizikem.*osamoceně/.test(t)) {
      return "High-risk area with buddy-system workers in pairs, red X on lone worker icon in hazardous zone";
    }
    if (/ochranné prostředky/.test(t)) {
      return "Employer providing collective and personal protective equipment icons: guard rails, shields, gloves, helmets arranged professionally";
    }
    if (/dveře.*únikov/.test(t)) {
      return "Fire exit door opening in evacuation direction with panic hardware and clear corridor, green check on unobstructed swing path";
    }
    if (/první pomoci.*umístěny/.test(t)) {
      return "Clearly marked first-aid kit and AED cabinet at accessible workplace location with green visibility badge";
    }
    if (/převést.*jinou práci/.test(t)) {
      return "Employer reassignment scene with pregnant worker and medical restriction icons, balanced HR and safety symbols";
    }
    if (/nahradit.*škodu/.test(t)) {
      return "Worker offering symbolic compensation coins toward company building after damaged equipment on desk, scales of responsibility";
    }
  }

  if (course === "pozarni") {
    if (/rozvodná zařízení|vypínače/.test(t)) {
      return "Industrial corridor with labeled utility shutoffs, electrical main switch and gas valve kept accessible, green clearance markings";
    }
    if (/kontroluje hasicí/.test(t)) {
      return "Authorized inspector checking fire extinguisher gauge and seal with inspection tag calendar icon";
    }
    if (/graficky znázorněno/.test(t)) {
      return "Fire extinguisher pictogram instructions on wall showing PASS steps as abstract icons without text";
    }
    if (/jak často.*školení/.test(t)) {
      return "Recurring training calendar icon with instructor and employees at fire safety briefing";
    }
    if (/odborná příprava.*prevenc/.test(t)) {
      return "Fire prevention officer training specialized staff at equipment map with role badges";
    }
    if (/požární řád.*zveřejň/.test(t)) {
      return "Fire safety rules posted on visible bulletin board at workplace entrance, green accessibility check";
    }
    if (/vyberte správnou/.test(t)) {
      return "Educational comparison panel of fire safety choices with green check on correct action and red X on dangerous option";
    }
  }

  if (course === "ridici") {
    const legacyScene = loadLegacyPromptMap().get(ctx.id);
    if (legacyScene) return legacyScene;
  }

  if (course === "bremena" || course === "ergonomie" || course === "gdpr") {
    const legacy = loadLegacyPromptMap().get(ctx.id);
    if (legacy) return legacy;
  }

  return `${COURSE_TITLES[course] ?? course} training illustration summarizing the lesson topic with central worker figure, instructional icons, and correct versus incorrect comparison layout`;
}

export function finalizePrompt(scene) {
  const clean = stripStyle(scene);
  return `${STYLE_PREFIX} ${clean}. ${STYLE_SUFFIX} ${ASPECT_RATIO}`;
}

function sentenceJoin(...parts) {
  return `${parts
    .filter(Boolean)
    .map((part) => part.trim().replace(/\.$/, ""))
    .join(". ")}.`;
}

export function buildPromptForQuestion(ctx) {
  const legacy = loadLegacyPromptMap().get(ctx.id);
  const scene = legacy ?? buildSceneFromRules(ctx);

  const body = sentenceJoin(
    scene,
    focalDetail(ctx),
    compositionVariant(ctx),
    uniqueAccent(ctx)
  );

  let prompt = finalizePrompt(body);
  const seen = buildPromptForQuestion._seen ?? (buildPromptForQuestion._seen = new Set());
  if (seen.has(prompt)) {
    prompt = finalizePrompt(sentenceJoin(body, `Distinct lesson identifier ${ctx.id} in composition only`));
  }
  seen.add(prompt);
  return prompt;
}

export function getCourseTitle(slug) {
  return COURSE_TITLES[slug] ?? slug;
}

export async function collectQuestionPrompts() {
  loadLegacyPromptMap();
  buildPromptForQuestion._seen = new Set();

  const { readFile, readdirSync } = await import("node:fs/promises");
  const { readdirSync: readdirSyncSync } = await import("node:fs");
  const quizDir = path.join(ROOT, "content/quizzes");
  const data = JSON.parse(
    await readFile(path.join(ROOT, "public/hrbek-learning/data.json"), "utf8")
  );

  const theoryMap = new Map();
  for (const cat of data.categories) {
    for (const slide of cat.slides) {
      for (const q of slide.checkQuestions ?? []) {
        theoryMap.set(q.id, {
          heading: slide.heading,
          paragraphs: slide.paragraphs,
          theoryText: slide.paragraphs?.join(" ") ?? "",
        });
      }
    }
  }

  const allQ = new Map();
  for (const file of readdirSyncSync(quizDir).filter((f) => f.endsWith(".json"))) {
    const quiz = JSON.parse(await readFile(path.join(quizDir, file), "utf8"));
    for (const q of quiz.questions ?? []) {
      if (!allQ.has(q.id)) {
        allQ.set(q.id, { ...q, course: quiz.courseSlug });
      }
    }
  }

  const courseOrder = ["bozp", "pozarni", "ridici", "bremena", "gdpr", "ergonomie"];
  const courses = [];

  for (const courseId of courseOrder) {
    const questions = [...allQ.values()]
      .filter((q) => q.course === courseId)
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

    const items = questions.map((q) => {
      const theory = theoryMap.get(q.id);
      let heading = theory?.heading;
      let theoryText = theory?.theoryText;

      if (!heading) {
        try {
          const copy = buildSlideCopy(courseId, q);
          heading = copy.heading;
          theoryText = copy.paragraphs.join(" ");
        } catch {
          heading = q.text.slice(0, 88);
          theoryText = q.options[q.correctIndex] ?? "";
        }
      }

      const ctx = {
        id: q.id,
        course: courseId,
        heading,
        theoryText,
        questionText: q.text,
        correctAnswer: q.options[q.correctIndex] ?? "",
        combined: normalize(
          [heading, theoryText, q.text, q.options[q.correctIndex]].join(" ")
        ),
      };

      return {
        id: q.id,
        heading,
        theory: theoryText,
        questionText: q.text,
        prompt: buildPromptForQuestion(ctx),
      };
    });

    courses.push({
      id: courseId,
      title: getCourseTitle(courseId),
      questionCount: items.length,
      questions: items,
    });
  }

  const totalQuestions = courses.reduce((sum, c) => sum + c.questionCount, 0);

  return {
    title: "AI image prompts – učební otázky",
    subtitle: `OnlineŠkolení.cz · ${totalQuestions} unikátních otázek (207 v testových sadách) · 6 kurzů · Ideogram / Midjourney`,
    styleSuffix: `${STYLE_SUFFIX} ${ASPECT_RATIO}`,
    tips: [
      "Ke všem promptům je na konci přidán poměr stran --ar 4:3.",
      "Pro konzistenci v rámci kurzu použijte stejný --sref nebo seed po vygenerování prvního referenčního obrázku (doporučeno začít kurzem BOZP).",
      "V obrázku nesmí být žádný text – význam jen ikony a kompozice.",
      "Referenční styl: flat 2D vektor, modro-šedá paleta, zelené fajfky a červené křížky u správného/nesprávného chování.",
    ],
    generatedAt: new Date().toISOString(),
    totalQuestions,
    courses,
  };
}
