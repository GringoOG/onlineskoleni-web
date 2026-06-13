/**
 * Flat SVG ilustrace pro studijní karty HRBEK.
 * Vkládání podle `svg_placeholder` (ID otázky) z data.json.
 */
import { QUESTION_ILLUSTRATION_SVG } from "./question-illustrations.js";

const COLORS = {
  green: "#34A853",
  greenLight: "#E8F5E9",
  greenMid: "#81C995",
  red: "#EA4335",
  redLight: "#FCE8E6",
  orange: "#F9AB00",
  orangeLight: "#FEF7E0",
  slate: "#5F6368",
  slateLight: "#F1F3F4",
  blue: "#4285F4",
  blueLight: "#E8F0FE",
  violet: "#7C4DFF",
  violetLight: "#EDE7F6",
  white: "#FFFFFF",
  ink: "#202124",
};

function wrapSvg(body, label = "Ilustrace") {
  return `<svg viewBox="0 0 400 300" class="h-full w-full max-h-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${body}</svg>`;
}

/** Štít s fajfkou – bezpečí / BOZP */
function bozpShield() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.greenLight}"/>
    <path d="M160 36 L220 58 V112 C220 156 196 186 160 200 C124 186 100 156 100 112 V58 Z" fill="${COLORS.white}" stroke="${COLORS.green}" stroke-width="3"/>
    <path d="M160 52 L206 70 V110 C206 146 186 170 160 182 C134 170 114 146 114 110 V70 Z" fill="${COLORS.greenLight}"/>
    <path d="M136 118 L152 136 L188 96" stroke="${COLORS.green}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="248" cy="52" r="18" fill="${COLORS.green}"/>
    <path d="M240 52 L246 58 L258 44" stroke="${COLORS.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    "Štít bezpečí"
  );
}

/** Lékárnička – první pomoc */
function bozpFirstAid() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.redLight}"/>
    <rect x="88" y="62" width="144" height="116" rx="14" fill="${COLORS.white}" stroke="${COLORS.red}" stroke-width="3"/>
    <rect x="88" y="62" width="144" height="34" rx="14" fill="${COLORS.red}"/>
    <rect x="148" y="48" width="24" height="18" rx="6" fill="${COLORS.red}"/>
    <path d="M160 104 V152 M136 128 H184" stroke="${COLORS.red}" stroke-width="10" stroke-linecap="round"/>
    <rect x="108" y="170" width="104" height="8" rx="4" fill="${COLORS.slateLight}"/>
    <circle cx="56" cy="176" r="16" fill="${COLORS.greenLight}" stroke="${COLORS.green}" stroke-width="2"/>
    <path d="M50 176 L54 180 L62 170" stroke="${COLORS.green}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  `,
    "Lékárnička první pomoci"
  );
}

/** Varování – riziko / zákaz */
function bozpWarning() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.orangeLight}"/>
    <path d="M160 44 L262 196 H58 Z" fill="${COLORS.white}" stroke="${COLORS.orange}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M160 72 L236 184 H84 Z" fill="${COLORS.orangeLight}"/>
    <rect x="152" y="108" width="16" height="44" rx="4" fill="${COLORS.orange}"/>
    <circle cx="160" cy="168" r="8" fill="${COLORS.orange}"/>
    <path d="M44 188 H276" stroke="${COLORS.slateLight}" stroke-width="4" stroke-linecap="round"/>
  `,
    "Varování"
  );
}

/** Hasicí přístroj */
function pozarniExtinguisher() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.redLight}"/>
    <rect x="126" y="150" width="68" height="12" rx="4" fill="${COLORS.slate}"/>
    <rect x="138" y="88" width="44" height="64" rx="10" fill="${COLORS.red}"/>
    <rect x="146" y="72" width="28" height="20" rx="6" fill="${COLORS.red}"/>
    <rect x="152" y="56" width="16" height="20" rx="4" fill="${COLORS.slate}"/>
    <path d="M184 96 H214 C224 96 228 100 228 108 V118" stroke="${COLORS.slate}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="228" cy="118" r="8" fill="${COLORS.slate}"/>
    <rect x="146" y="104" width="28" height="20" rx="4" fill="${COLORS.white}" opacity="0.35"/>
    <text x="160" y="118" text-anchor="middle" fill="${COLORS.white}" font-size="10" font-family="Inter, sans-serif" font-weight="700">H2O</text>
  `,
    "Hasicí přístroj"
  );
}

/** Úniková cesta – zelená šipka */
function pozarniExit() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.greenLight}"/>
    <rect x="40" y="48" width="240" height="144" rx="16" fill="${COLORS.white}" stroke="${COLORS.green}" stroke-width="3"/>
    <rect x="40" y="48" width="240" height="36" rx="16" fill="${COLORS.green}"/>
    <text x="160" y="72" text-anchor="middle" fill="${COLORS.white}" font-size="14" font-family="Inter, sans-serif" font-weight="700">ÚNIKOVÁ CESTA</text>
    <circle cx="108" cy="132" r="18" fill="${COLORS.greenLight}" stroke="${COLORS.green}" stroke-width="2"/>
    <path d="M108 124 V148 M100 136 H116" stroke="${COLORS.green}" stroke-width="3" stroke-linecap="round"/>
    <path d="M148 148 L208 108 L208 128 L248 128 L248 168 L208 168 L208 148 Z" fill="${COLORS.green}"/>
    <path d="M168 148 H228" stroke="${COLORS.greenMid}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 14"/>
  `,
    "Úniková cesta"
  );
}

/** Manipulace s břemeny – správně vs. špatně */
function bremenaLifting() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.slateLight}"/>
    <rect x="16" y="16" width="136" height="208" rx="14" fill="${COLORS.greenLight}"/>
    <rect x="168" y="16" width="136" height="208" rx="14" fill="${COLORS.redLight}"/>
    <text x="84" y="40" text-anchor="middle" fill="${COLORS.green}" font-size="11" font-family="Inter, sans-serif" font-weight="700">SPRÁVNĚ</text>
    <text x="236" y="40" text-anchor="middle" fill="${COLORS.red}" font-size="11" font-family="Inter, sans-serif" font-weight="700">ŠPATNĚ</text>
    <rect x="16" y="188" width="136" height="8" fill="${COLORS.slate}" opacity="0.15"/>
    <rect x="168" y="188" width="136" height="8" fill="${COLORS.slate}" opacity="0.15"/>
    <!-- správně: dřep, rovná záda -->
    <circle cx="84" cy="78" r="14" fill="${COLORS.ink}"/>
    <path d="M84 92 L84 118" stroke="${COLORS.ink}" stroke-width="5" stroke-linecap="round"/>
    <path d="M84 102 L68 120 M84 102 L100 120" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M84 118 L70 150 M84 118 L98 150" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
    <rect x="58" y="132" width="52" height="28" rx="4" fill="${COLORS.orange}" stroke="${COLORS.orange}" stroke-width="2"/>
    <path d="M58 78 Q84 72 110 78" stroke="${COLORS.green}" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
    <!-- špatně: kulatá záda -->
    <circle cx="236" cy="86" r="14" fill="${COLORS.ink}"/>
    <path d="M236 100 Q252 118 236 132" stroke="${COLORS.ink}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M236 108 L220 124 M236 108 L252 124" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M236 132 L222 158 M236 132 L250 158" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
    <rect x="210" y="142" width="52" height="28" rx="4" fill="${COLORS.orange}" stroke="${COLORS.orange}" stroke-width="2"/>
    <path d="M220 100 Q236 88 252 100" stroke="${COLORS.red}" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
  `,
    "Správné a špatné zvedání břemene"
  );
}

/** Ergonomie – sezení u stolu, úhly 90° */
function ergonomieDesk() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.blueLight}"/>
    <rect x="48" y="156" width="224" height="10" rx="3" fill="${COLORS.slate}" opacity="0.25"/>
    <rect x="72" y="124" width="176" height="32" rx="6" fill="${COLORS.white}" stroke="${COLORS.blue}" stroke-width="2"/>
    <rect x="196" y="72" width="52" height="40" rx="4" fill="${COLORS.slateLight}" stroke="${COLORS.slate}" stroke-width="2"/>
    <rect x="202" y="78" width="40" height="24" rx="2" fill="${COLORS.blueLight}"/>
    <rect x="88" y="136" width="56" height="20" rx="8" fill="${COLORS.greenMid}"/>
    <circle cx="116" cy="108" r="14" fill="${COLORS.ink}"/>
    <path d="M116 122 L116 138" stroke="${COLORS.ink}" stroke-width="5" stroke-linecap="round"/>
    <path d="M116 128 L96 136 M116 128 L136 136" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M116 138 L100 156 M116 138 L132 156" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M100 156 L92 168 M132 156 L140 168" stroke="${COLORS.ink}" stroke-width="4" stroke-linecap="round"/>
    <!-- úhel koleno -->
    <path d="M100 156 L116 138 L132 156" stroke="none"/>
    <path d="M108 152 A12 12 0 0 1 124 152" stroke="${COLORS.green}" stroke-width="2" fill="none"/>
    <text x="116" y="150" text-anchor="middle" fill="${COLORS.green}" font-size="10" font-family="Inter, sans-serif" font-weight="700">90°</text>
    <!-- úhel loket -->
    <path d="M96 136 L116 128 L136 136" stroke="none"/>
    <path d="M104 132 A10 10 0 0 1 128 132" stroke="${COLORS.green}" stroke-width="2" fill="none"/>
    <text x="116" y="126" text-anchor="middle" fill="${COLORS.green}" font-size="9" font-family="Inter, sans-serif" font-weight="700">90°</text>
    <!-- vzdálenost monitor -->
    <path d="M128 100 L196 92" stroke="${COLORS.blue}" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="162" y="86" text-anchor="middle" fill="${COLORS.blue}" font-size="9" font-family="Inter, sans-serif" font-weight="600">50–70 cm</text>
  `,
    "Ergonomické sezení u počítače"
  );
}

/** GDPR – zámek chránící složku s daty */
function gdprLock() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.violetLight}"/>
    <path d="M88 88 H232 V188 H88 Z" fill="${COLORS.white}" stroke="${COLORS.violet}" stroke-width="3"/>
    <path d="M88 108 H232 V88 C232 72 220 60 160 60 C100 60 88 72 88 88 Z" fill="${COLORS.violet}" opacity="0.15"/>
    <path d="M88 108 H232 V88 C232 72 220 60 160 60 C100 60 88 72 88 88 Z" stroke="${COLORS.violet}" stroke-width="3"/>
    <rect x="112" y="124" width="96" height="10" rx="3" fill="${COLORS.violetLight}"/>
    <rect x="112" y="144" width="72" height="8" rx="3" fill="${COLORS.violetLight}"/>
    <rect x="112" y="160" width="84" height="8" rx="3" fill="${COLORS.violetLight}"/>
    <circle cx="160" cy="96" r="22" fill="${COLORS.white}" stroke="${COLORS.violet}" stroke-width="3"/>
    <rect x="148" y="104" width="24" height="20" rx="4" fill="${COLORS.violet}"/>
    <path d="M152 104 V96 C152 86 160 80 160 80 C160 80 168 86 168 96 V104" stroke="${COLORS.violet}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="160" cy="114" r="3" fill="${COLORS.white}"/>
    <rect x="158" y="116" width="4" height="8" rx="1" fill="${COLORS.white}"/>
  `,
    "Ochrana osobních údajů"
  );
}

/** Řidiči – volant a silnice */
function ridiciDriving() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.orangeLight}"/>
    <path d="M32 168 Q160 120 288 168" stroke="${COLORS.slate}" stroke-width="14" stroke-linecap="round"/>
    <path d="M32 168 Q160 120 288 168" stroke="${COLORS.white}" stroke-width="3" stroke-dasharray="12 16" stroke-linecap="round"/>
    <rect x="96" y="108" width="128" height="56" rx="14" fill="${COLORS.white}" stroke="${COLORS.orange}" stroke-width="3"/>
    <circle cx="160" cy="136" r="28" fill="${COLORS.slateLight}" stroke="${COLORS.slate}" stroke-width="3"/>
    <circle cx="160" cy="136" r="18" fill="${COLORS.white}" stroke="${COLORS.slate}" stroke-width="2"/>
    <rect x="156" y="124" width="8" height="24" rx="2" fill="${COLORS.slate}"/>
    <circle cx="116" cy="176" r="12" fill="${COLORS.ink}"/>
    <circle cx="204" cy="176" r="12" fill="${COLORS.ink}"/>
    <path d="M248 92 L268 108 L248 124" fill="${COLORS.green}"/>
    <text x="258" y="140" text-anchor="middle" fill="${COLORS.green}" font-size="9" font-family="Inter, sans-serif" font-weight="700">BEZPEČNĚ</text>
  `,
    "Bezpečná jízda"
  );
}

function defaultIllustration() {
  return wrapSvg(
    `
    <rect width="320" height="240" rx="20" fill="${COLORS.slateLight}"/>
    <rect x="72" y="56" width="176" height="128" rx="16" fill="${COLORS.white}" stroke="${COLORS.slate}" stroke-width="2"/>
    <circle cx="160" cy="108" r="28" fill="${COLORS.blueLight}"/>
    <path d="M144 108 L156 120 L180 96" stroke="${COLORS.blue}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="104" y="148" width="112" height="10" rx="4" fill="${COLORS.slateLight}"/>
  `,
    "Studijní karta"
  );
}

/** Registr všech ilustrací podle `svg_placeholder`. */
export const ILLUSTRATIONS = {
  "bozp-shield": bozpShield,
  "bozp-first-aid": bozpFirstAid,
  "bozp-warning": bozpWarning,
  "pozarni-extinguisher": pozarniExtinguisher,
  "pozarni-exit": pozarniExit,
  "bremena-lifting": bremenaLifting,
  "ergonomie-desk": ergonomieDesk,
  "gdpr-lock": gdprLock,
  "ridici-driving": ridiciDriving,
  default: defaultIllustration,
};

/** Výchozí placeholder podle kurzu, pokud slide nemá vlastní. */
export const COURSE_DEFAULT_PLACEHOLDER = {
  bozp: "bozp-shield",
  pozarni: "pozarni-extinguisher",
  ridici: "ridici-driving",
  bremena: "bremena-lifting",
  gdpr: "gdpr-lock",
  ergonomie: "ergonomie-desk",
};

/**
 * Vrátí SVG HTML pro studijní kartu.
 * @param {string | undefined} placeholder – hodnota svg_placeholder z JSONu
 * @param {string} [courseSlug] – záložní mapování podle kurzu
 */
export function getIllustration(placeholder, courseSlug) {
  if (placeholder && QUESTION_ILLUSTRATION_SVG[placeholder]) {
    return QUESTION_ILLUSTRATION_SVG[placeholder];
  }

  const key =
    placeholder ||
    (courseSlug ? COURSE_DEFAULT_PLACEHOLDER[courseSlug] : undefined) ||
    "default";

  const factory = ILLUSTRATIONS[key] ?? ILLUSTRATIONS.default;
  return factory();
}
