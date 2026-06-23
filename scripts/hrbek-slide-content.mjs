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
    chapters.map((chapter) => [
      chapter.courseSlug,
      (chapter.sections ?? []).map((section) => ({
        ...section,
        paragraphs: expandParagraphs(section.paragraphs ?? []),
      })),
    ])
  );
}

/** Rozdělí dlouhé nebo vícetématické odstavce na atomické učební bloky. */
function expandParagraphs(paragraphs) {
  const out = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const labeled = trimmed.split(/(?=(?:Vodní|Sněhový|Práškový|Muži|Ženy|Pozor):)/i);
    if (labeled.length > 1) {
      for (const part of labeled) {
        const piece = part.trim();
        if (piece) out.push(piece);
      }
      continue;
    }

    if (trimmed.length > 130) {
      const sentences = trimmed.split(/(?<=[.!])\s+/).map((s) => s.trim()).filter((s) => s.length > 18);
      if (sentences.length > 1) {
        out.push(...sentences);
        continue;
      }
    }

    out.push(trimmed);
  }

  return out;
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
  return text != null && text.includes("Prostudujte téma");
}

function tokenize(text) {
  return normalize(text)
    .replace(/[^a-z0-9áčďéěíňóřšťúůýž\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !TOKEN_STOP.has(word));
}

function overlapScore(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const token of ta) {
    if (tb.has(token)) inter += 1;
  }
  return inter / Math.sqrt(ta.size * tb.size);
}

function keywordBoost(questionText, paragraph, heading) {
  const q = normalize(questionText);
  const p = normalize(paragraph);
  const h = normalize(heading);
  let boost = 0;

  const rules = [
    [/vodní hasic/, /vodní/],
    [/sněhov|inertní plyn|co2/, /sněhov|co2/],
    [/práškov hasic/, /práškov/],
    [/úniková cesta/, /únikov|značk|tabulk/],
    [/požární řád/, /požární řád/],
    [/kontroluje hasic|kontrolovat hasic/, /reviz|kontrol/],
    [/graficky znázorněno|použití hasicího přístroje/, /graficky|přímo na/],
    [/umístění hasicích|umísťují tak/, /viditeln|přístupn|dosažiteln/],
    [/zajištěny proti pádu|na podlaze/, /podlaze|proti pádu/],
    [/školení zaměstnanců.*seznámení/, /rozmístění|vecných prostředk/],
    [/školení zaměstnanců o požární ochraně obsahuje:/, /poplachov/],
    [/jak často se provádí školení zaměstnanců/, /jednou za rok/],
    [/preventivních požárních hlídek/, /6 měsíc/],
    [/základní povinnosti fyzických/, /vytvářet podmínky|zdolání požáru|vlastnictví nebo užívání/],
    [/úniková cesta musí být vybavena/, /bezpečnostními značkami|tabulkami a texty/],
    [/úniková cesta/, /únikov|značk|tabulk/],
    [/fyzická osoba je povinna/, /rozvodn/],
    [/zdolávání požáru/, /záchranu ohrožených/],
    [/při vzniku požáru/, /evakuačním řádem|opustit podle/],
    [/vyberte správnou odpověď/, /počáteční fázi|přenosn/],
    [/tísňové telefonní číslo.*hasič/, /\b150\b/],
    [/značena rozvodná zařízení/, /rozvodn/],
    [/hmotnostní limit.*muž/, /\bmuži\b|50 kg/],
    [/hmotnostní limit.*žen/, /\bženy\b|30 kg/],
    [/v sedě|manipuluje v sedě/, /vsedě|5 kg/],
    [/těhotn/, /těhotn/],
    [/páteř|zvedání těžkého/, /páteř|rovná/],
    [/chodidel|chodidla/, /chodidla|plochou/],
    [/blízko těla|drženo během/, /blízko k tělu|těžiště/],
    [/trhavým|rychlým pohybem/, /trhavým pohybem/],
    [/změně směru|otočení trupu/, /rotace|zkroucení|chodidel/],
    [/před zvednutím|první krok/, /před zvednutím|posoudíme/],
    [/kumulativní hmotnost/, /kumulativní|součet všech vah/],
    [/limit kumulativní/, /\b10\s*000\b|10 000 kg/],
    [/věková hranice dítěte/, /\b15 let\b/],
    [/110\/2019/, /\b15 let\b|sociálních sítích/],
    [/ve dvojici|dvojice pracovníků/, /ve dvojici|dvojici/],
    [/paletov|vozík|mechanick/, /vozík|mechanické/],
    [/monitor.*očí|výšce.*očí/, /horní hrana|úrovni očí/],
    [/vzdálenost monitoru/, /50 až 70|natažené paže/],
    [/monitoru.*okno|umístění monitoru/, /kolmo k oknu|odlesk/],
    [/zápěstí|klávesnic/, /zápěstí|předloktím/],
    [/vertikální myš/, /vertikální myš|podání ruky/],
    [/karpální|rsi/, /karpální tunel|brnění/],
    [/20-20-20/, /20-20-20|20 minut/],
    [/bederní opěrka|lumbar/, /bederní opěrka/],
    [/plosky nohou|kolenou a kyčlích/, /plosky nohou|90°/],
    [/sit-stand|výškově stavitel/, /sit-stand|výškově/],
    [/gdpr.*předpis|110\/2019/, /gdpr|110\/2019/],
    [/správce.*osobních|kdo je.*správce/, /správce/],
    [/zpracovatel|podzpracovatel/, /zpracovatel/],
    [/minimalizace údajů/, /minimalizace/],
    [/zvláštní kategorie|citlivé údaje/, /zvláštní kategorie|citlivé/],
    [/souhlas.*odvolat/, /souhlas lze kdykoliv odvolat/],
    [/přenositelnost/, /přenositelnost/],
    [/porušení zabezpečení|únik dat/, /porušení zabezpečení|72 hodin/],
    [/pověřenec|dpo/, /pověřence|\bdpo\b/],
    [/pseudonymiz/, /pseudonymiz/],
    [/anonymiz/, /anonymiz/],
    [/předjíždí|předjíždění/, /předjížd|vlevo/],
    [/zakázáno předjíždět/, /zakázáno|přechod/],
    [/bezpečnostním pásem/, /připoutáni|bezpečnostním pásem/],
    [/dopravní nehod/, /nehodě|zastavit/],
    [/chodec.*chodit|přednostně chodit/, /chodníku|stezce/],
    [/bezpečné jízdy/, /přizpůsobit jízdu/],
    [/policist|úprava provozu/, /policist/],
    [/věnovat.*řízení|během jízdy věnovat/, /věnovat řízení|sledovat situaci/],
    [/používat vozidlo/, /technické podmínky/],
  ];

  for (const [qPattern, pPattern] of rules) {
    if (qPattern.test(q) && pPattern.test(p)) {
      boost += 25;
    }
  }

  if (q.includes("hasic") && h.includes("hasic")) boost += 8;
  if (q.includes("školen") && h.includes("školen")) boost += 8;
  if (q.includes("monitor") && h.includes("monitor")) boost += 8;
  if (q.includes("gdpr") && h.includes("gdpr")) boost += 5;

  return boost;
}

function scoreParagraphMatch(question, paragraph, heading) {
  const correctAnswer = question.options[question.correctIndex];
  let score = overlapScore(question.text, paragraph) * 40;
  score += overlapScore(paragraph, correctAnswer) * 30;
  score += keywordBoost(question.text, paragraph, heading);
  if (isSpoiler(paragraph, correctAnswer)) {
    score += 12;
  }
  return score;
}

function pickTheoryParagraph(slug, question) {
  const sections = hrbekSectionsBySlug[slug];
  if (!sections?.length) {
    return { paragraph: null, score: -1 };
  }

  let bestParagraph = null;
  let bestScore = -1;

  for (const section of sections) {
    for (const paragraph of section.paragraphs) {
      const score = scoreParagraphMatch(question, paragraph, section.heading);
      if (score > bestScore) {
        bestScore = score;
        bestParagraph = paragraph;
      }
    }
  }

  return {
    paragraph: bestScore > 0 ? bestParagraph : null,
    score: bestScore,
  };
}

function theoryFromHrbek(slug, question) {
  return pickTheoryParagraph(slug, question).paragraph;
}

function lessonFromCorrectAnswer(question) {
  const answer = question.options[question.correctIndex]?.trim();
  if (!answer) {
    return null;
  }
  if (answer.length >= 28) {
    return answer;
  }
  const heading = questionHeading(question);
  return `${heading}: ${answer}`;
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

  return lessonFromCorrectAnswer(question) ?? studyFallback(question);
}

export function buildSlideCopy(slug, question, options = {}) {
  const { avoidParagraphs = null } = options;
  const heading = questionHeading(question);
  const prompt = question.text.trim();
  const fromRules = teachingFromAnswer(question);
  const { paragraph: fromHrbek, score: hrbekScore } = pickTheoryParagraph(slug, question);

  const usesEmployeeDutyRules =
    /^Zaměstnanec je povinen:?$/i.test(prompt) ||
    (/^Je /i.test(prompt) &&
      ["ano", "ne"].includes(normalize(question.options[question.correctIndex])));

  let paragraph;
  if (usesEmployeeDutyRules) {
    paragraph = fromRules;
  } else if (fromHrbek && hrbekScore >= 10) {
    paragraph = fromHrbek;
  } else if (!isStudyFallback(fromRules)) {
    paragraph = fromRules;
  } else {
    paragraph = fromHrbek ?? lessonFromCorrectAnswer(question) ?? studyFallback(question);
  }

  if (isStudyFallback(paragraph)) {
    paragraph = fromHrbek ?? lessonFromCorrectAnswer(question) ?? fromRules;
  }

  if (!paragraph) {
    paragraph = studyFallback(question);
  }

  if (avoidParagraphs?.has(paragraph)) {
    const alt =
      lessonFromCorrectAnswer(question) ??
      (!isStudyFallback(fromRules) && fromRules !== paragraph ? fromRules : null);
    if (alt && !avoidParagraphs.has(alt)) {
      paragraph = alt;
    }
  }

  const correct = question.options[question.correctIndex];

  if (isSpoiler(heading, correct)) {
    throw new Error(
      `[${slug}:${question.id}] Nadpis prozrazuje odpověď: "${heading.slice(0, 60)}…"`
    );
  }

  return {
    heading,
    paragraphs: [paragraph],
  };
}
