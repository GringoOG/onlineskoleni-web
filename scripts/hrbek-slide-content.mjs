/**
 * Nadpisy a učební texty lekcí – nesmí kopírovat znění správné odpovědi v testu.
 */

/** @type {Record<string, { heading: string; paragraphs: string[] }[]>} */
let hrbekSectionsBySlug = {};

const TOKEN_STOP = new Set([
  "je",
  "se",
  "na",
  "za",
  "po",
  "do",
  "od",
  "pro",
  "při",
  "jak",
  "co",
  "kdo",
  "kde",
  "nebo",
  "aby",
  "musí",
  "jsou",
  "být",
  "tak",
  "že",
  "s",
  "v",
  "z",
  "k",
  "o",
  "u",
  "a",
  "i",
  "byly",
  "byl",
  "byla",
  "podle",
  "mezi",
  "pokud",
  "než",
  "bez",
  "před",
  "požár",
  "požáru",
  "požární",
  "obsahuje",
  "seznámení",
  "správnou",
  "správná",
  "vyberte",
]);

export function setHrbekTheoryChapters(chapters) {
  hrbekSectionsBySlug = Object.fromEntries(
    chapters.map((chapter) => [chapter.courseSlug, chapter.sections ?? []])
  );
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function sharesLongPrefix(a, b, minLen = 64) {
  const na = normalize(a);
  const nb = normalize(b);
  const len = Math.min(na.length, nb.length, minLen);
  return len >= 48 && na.slice(0, len) === nb.slice(0, len);
}

/** Spoiler = téměř doslovná správná odpověď (ne krátký tematický nadpis). */
function isSpoiler(text, correctAnswer) {
  const n = normalize(text);
  const c = normalize(correctAnswer);
  if (!c || !n) return false;
  if (n === c) return true;
  if (sharesLongPrefix(text, correctAnswer)) return true;
  if (n.length > 55 && c.includes(n)) return true;
  if (c.length > 55 && n.includes(c)) return true;
  return false;
}

function employeeDutyHeading(answer) {
  const a = normalize(answer);
  if (a.includes("školení") && a.includes("ověření")) return "Školení BOZP a ověření znalostí";
  if (
    a.includes("postupy") &&
    (a.includes("oopp") || a.includes("osobní ochranné") || a.includes("prostředky"))
  )
    return "Pracovní postupy a OOPP";
  if (a.includes("alkohol") || a.includes("návykov")) return "Alkohol a návykové látky";
  if (a.includes("úraz") && a.includes("spolupracovat")) return "Hlášení úrazů a spolupráce";
  if (a.includes("úraz") || a.includes("svědkem")) return "Hlášení pracovních úrazů";
  if (a.includes("závady") || a.includes("nedostatky")) return "Závady na pracovišti";
  if (a.includes("pracovně lékařsk")) return "Pracovnělékařské služby";
  if (a.includes("lékař") || a.includes("registrující")) return "Údaje pro lékařskou péči";
  return "Povinnosti zaměstnance";
}

function employeeDutyParagraph(answer) {
  const a = normalize(answer);
  if (a.includes("školení") && a.includes("ověření")) {
    return "Zaměstnanec musí absolvovat školení BOZP od zaměstnavatele včetně ověření znalostí.";
  }
  if (
    a.includes("postupy") &&
    (a.includes("oopp") || a.includes("osobní ochranné") || a.includes("prostředky"))
  ) {
    return "Při práci je nutné dodržovat předepsané postupy, používat přidělené prostředky a OOPP a nesmí je bez povolení měnit ani vyřazovat.";
  }
  if (a.includes("alkohol") && a.includes("nepožívat")) {
    return "Na pracovištích i v pracovní době platí zákaz alkoholu a zneužívání návykových látek.";
  }
  if (a.includes("úraz") && a.includes("svědkem")) {
    return "Úraz je třeba neprodleně oznámit nadřízenému – vlastní, kolegův i úraz svědka. Zaměstnanec spolupracuje při šetření příčin.";
  }
  if (a.includes("závady") || a.includes("nedostatky")) {
    return "Závady a nedostatky ohrožující bezpečnost je nutné hlásit nadřízenému.";
  }
  if (a.includes("pracovně lékařsk")) {
    return "Zaměstnanec se podrobí pracovnělékařským službám u oprávněného poskytovatele.";
  }
  if (a.includes("registrující")) {
    return "U lékařských úkonů sdělí zaměstnanec jméno a adresu svého registrujícího lékaře.";
  }
  return "Tato lekce shrnuje konkrétní povinnost zaměstnance. Správnou formulaci určíte v kontrolní otázce.";
}

function yesNoParagraph(question, answer) {
  const q = normalize(question);
  const isYes = normalize(answer) === "ano" || normalize(answer).startsWith("ano,");

  if (q.includes("alkohol") || q.includes("návykov")) {
    return isYes
      ? "Na pokyn vedoucího se zaměstnanec podrobí orientačnímu šetření na alkohol či jiné látky."
      : "Toto šetření na pokyn vedoucího povinné není.";
  }
  if (q.includes("nahradit") && q.includes("škodu")) {
    return isYes
      ? "Při zaviněném porušení povinností může zaměstnanec nést odpovědnost za způsobenou škodu."
      : "Odpovědnost za škodu v této situaci nevzniká automaticky.";
  }
  return isYes
    ? "Ano – popsané pravidlo v uvedené situaci platí."
    : "Ne – popsané pravidlo v uvedené situaci neplatí.";
}

export function questionHeading(question) {
  const text = question.text.trim().replace(/\s+/g, " ");
  if (/^Zaměstnanec je povinen:?$/.test(text)) {
    return employeeDutyHeading(question.options[question.correctIndex]);
  }
  if (text.endsWith("?")) {
    return text.length <= 88 ? text.replace(/\?$/, "") : `${text.slice(0, 85).replace(/\s+\S*$/, "")}…`;
  }
  if (text.endsWith(":")) {
    return text.slice(0, -1);
  }
  return text.length <= 88 ? text : `${text.slice(0, 85)}…`;
}

function softParaphrase(answer) {
  return answer
    .replace(/\bzaměstnanec\b/gi, "Pracovník")
    .replace(/\bmusí\b/gi, "má")
    .replace(/\bje povinen\b/gi, "platí pro něj povinnost")
    .replace(/\bnepožívat\b/gi, "se zdržet")
    .replace(/\bnásledujících\b/gi, "těchto")
    .replace(/\s+/g, " ")
    .trim();
}

function studyFallback(question) {
  const heading = questionHeading(question);
  return `Lekce „${heading}“. Prostudujte téma a v kontrolní otázce zvolte variantu odpovídající platným pravidlům – všímejte si rozdílů oproti záměrně nepřesným možnostem.`;
}

function isStudyFallback(text) {
  return text.includes("Prostudujte téma");
}

function tokenize(text) {
  return normalize(text)
    .replace(/[^a-z0-9áčďéěíňóřšťúůýž\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !TOKEN_STOP.has(word));
}

function scoreSection(question, section) {
  const questionTokens = tokenize(question.text);
  const corpus = normalize([section.heading, ...section.paragraphs].join(" "));
  let score = 0;

  for (const token of questionTokens) {
    if (corpus.includes(token)) {
      score += 2;
    }
  }

  for (const token of tokenize(section.heading)) {
    if (questionTokens.includes(token)) {
      score += 5;
    }
  }

  return score;
}

function pickTheoryParagraph(question, section, correctAnswer) {
  const questionTokens = tokenize(question.text);
  let bestParagraph = null;
  let bestScore = -1;

  for (const paragraph of section.paragraphs) {
    if (isSpoiler(paragraph, correctAnswer)) {
      continue;
    }

    const corpus = normalize(paragraph);
    let score = 0;
    for (const token of questionTokens) {
      if (corpus.includes(token)) {
        score += 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestParagraph = paragraph;
    }
  }

  if (bestParagraph) {
    return bestParagraph;
  }

  for (const paragraph of section.paragraphs) {
    if (!isSpoiler(paragraph, correctAnswer)) {
      return paragraph;
    }
  }

  return null;
}

function theoryFromHrbek(slug, question) {
  const sections = hrbekSectionsBySlug[slug];
  if (!sections?.length) {
    return null;
  }

  const correctAnswer = question.options[question.correctIndex];
  let bestSection = sections[0];
  let bestScore = -1;

  for (const section of sections) {
    const score = scoreSection(question, section);
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return pickTheoryParagraph(question, bestSection, correctAnswer);
}

function teachingFromAnswer(question) {
  const answer = question.options[question.correctIndex];
  const prompt = question.text.trim();
  const a = normalize(answer);

  if (/^Zaměstnanec je povinen:?$/.test(prompt)) {
    return employeeDutyParagraph(answer);
  }

  if (/^Je /.test(prompt) && (a === "ano" || a === "ne" || a.startsWith("ano,"))) {
    return yesNoParagraph(prompt, answer);
  }

  if (prompt.includes("Vstupní lékařskou prohlídku hradí")) {
    if (a.includes("uzavře") && a.includes("pracovněprávní")) {
      return "Vstupní prohlídku platí uchazeč; po přijetí do pracovního poměru ji hradí zaměstnavatel.";
    }
    if (a.includes("vždy a bez výhrad zaměstnavatel")) {
      return "Vstupní prohlídku vždy hradí zaměstnavatel.";
    }
    return "Kdo hradí vstupní prohlídku, závisí na tom, zda uchazeč nastoupí do pracovního poměru.";
  }

  if (prompt.includes("Pro ochranu rukou")) {
    return "Ruce a paže chráníte rukavicemi proti mechanickému poškození – řez, propíchnutí, vibrace.";
  }

  if (prompt.includes("Čištění elektrických spotřebičů")) {
    return "Čistit lze jen vypnutý spotřebič, nikdy za chodu.";
  }

  if (prompt.includes("nadměrně hřejí") || prompt.includes("jiskří")) {
    return "Při závadě spotřebič okamžitě odpojte a zajistěte opravu odborníkem.";
  }

  if (prompt.includes("Kdo odpovídá za bezpečnost")) {
    return "Bezpečnost práce je společnou odpovědností zaměstnavatele i zaměstnance.";
  }

  if (prompt.includes("nebezpečné situace") || prompt.includes("Co musí zaměstnanec udělat při zjištění")) {
    return "Nebezpečnou situaci je nutné bez odkladu nahlásit nadřízenému.";
  }

  const paraphrased = softParaphrase(answer);
  if (!isSpoiler(paraphrased, answer)) {
    return paraphrased;
  }

  const clauses = answer.split(/(?<=[.;])\s+/).filter(Boolean);
  if (clauses.length > 1) {
    const short = `${softParaphrase(clauses[0])} ${softParaphrase(clauses[1])}`.trim();
    if (!isSpoiler(short, answer)) return short;
  }

  return studyFallback(question);
}

export function buildSlideCopy(slug, question) {
  const heading = questionHeading(question);
  let paragraph = teachingFromAnswer(question);

  if (isStudyFallback(paragraph)) {
    paragraph = theoryFromHrbek(slug, question) ?? paragraph;
  }

  const correct = question.options[question.correctIndex];

  if (isSpoiler(heading, correct)) {
    throw new Error(
      `[${slug}:${question.id}] Nadpis prozrazuje odpověď: "${heading.slice(0, 60)}…"`
    );
  }
  if (isSpoiler(paragraph, correct)) {
    throw new Error(`[${slug}:${question.id}] Učební text prozrazuje odpověď`);
  }

  return {
    heading,
    paragraphs: [paragraph],
  };
}
