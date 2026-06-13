/**
 * Generuje unikátní SVG ilustraci pro každou otázku v závěrečném testu.
 * Výstup: public/hrbek-learning/question-illustrations.js
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { getPremiumIllustration, hasPremiumIllustration } from "./hrbek-illustrations/index.mjs";

const ROOT = process.cwd();
const QUIZ_DIR = path.join(ROOT, "content/quizzes");
const OUT_PATH = path.join(ROOT, "public/hrbek-learning/question-illustrations.js");

const OFFICIAL_QUIZ_FILES = {
  bozp: "bozp-oficialni-zamestnanec.json",
  pozarni: "pozarni-oficialni-zamestnanec.json",
  ridici: "ridici-oficialni.json",
  bremena: "bremena-oficialni.json",
  gdpr: "gdpr-oficialni.json",
  ergonomie: "ergonomie-oficialni.json",
};

const PALETTES = [
  { bg: "#E8F5E9", accent: "#34A853", ink: "#1B5E20" },
  { bg: "#E8F0FE", accent: "#4285F4", ink: "#0D47A1" },
  { bg: "#FCE8E6", accent: "#EA4335", ink: "#B71C1C" },
  { bg: "#FEF7E0", accent: "#F9AB00", ink: "#E65100" },
  { bg: "#EDE7F6", accent: "#7C4DFF", ink: "#4527A0" },
  { bg: "#E0F7FA", accent: "#00ACC1", ink: "#006064" },
  { bg: "#FFF3E0", accent: "#FB8C00", ink: "#E65100" },
  { bg: "#F3E5F5", accent: "#AB47BC", ink: "#6A1B9A" },
];

/** Ruční přiřazení ikon pro přesné vizuální téma (priorita nad heuristikou). */
const MANUAL_ICON = {
  q184: "shield-duo",
  q94: "training",
  q95: "checklist",
  q96: "no-alcohol",
  q96b: "breath-test",
  q149: "medical-pay",
  q150: "doctor-card",
  q170: "injury",
  q171: "hazard",
  q175: "medical-exam",
  q177: "gloves",
  q181: "damage",
  q182: "unplug",
  q183: "spark",
  q185: "alert",
  q21: "fire-duty",
  q23: "exit-sign",
  q24: "fire-training",
  q26: "extinguisher",
  q27: "powder-no",
  q28: "co2",
  q30: "water-fire",
  q31: "valves",
  q32: "rescue",
  q33: "calendar-check",
  q35: "pictogram",
  q36: "alarm",
  q39: "evacuate",
  q41: "initial-fire",
  q20: "extinguisher-spot",
  q150: "phone-150",
  "q-r1": "steering-focus",
  "q-r2": "overtake-left",
  "q-r3": "crash-stop",
  "q-r4": "seatbelt",
  "q-r5": "no-speed-up",
  "q-r6": "police",
  "q-r7": "crosswalk",
  "q-r8": "car-check",
  "q-r9": "road-adapt",
  "q-r10": "sidewalk",
};

for (let i = 1; i <= 30; i++) {
  const bIcons = [
    "weight-male",
    "weight-female",
    "spine",
    "feet",
    "hold-close",
    "no-twist",
    "legs",
    "assess",
    "jerk",
    "height-carry",
    "sit-limit",
    "crane",
    "sharp",
    "team-lift",
    "sum-weight",
    "sum-10t",
    "grip",
    "wet-floor",
    "oopp-shoes",
    "shelf",
    "liquid",
    "climate",
    "push-cart",
    "cliff",
    "pregnant",
    "comfort-zone",
    "tall-load",
    "occasional",
    "suction",
    "employer-train",
  ];
  MANUAL_ICON[`off-b${i}`] = bIcons[i - 1];

  const gIcons = [
    "eu-law",
    "cz-law",
    "controller",
    "child-15",
    "sensitive",
    "contract",
    "minimize",
    "consent",
    "correct-data",
    "portable",
    "uoou",
    "dpo",
    "clock-72",
    "notify-user",
    "records",
    "fine-eu",
    "municipality",
    "privacy-design",
    "dpia",
    "processor-contract",
    "subprocessor",
    "transfer-globe",
    "info-duty",
    "limit-processing",
    "journalism",
    "no-marketing-consent",
    "individual-fine",
    "storage-limit",
    "dpo-external",
    "anonymize",
  ];
  MANUAL_ICON[`off-g${i}`] = gIcons[i - 1];

  const eIcons = [
    "chair-angle",
    "monitor-height",
    "monitor-distance",
    "rsi",
    "vertical-mouse",
    "desk-height",
    "rule-20",
    "feet-floor",
    "window-side",
    "wrist-flat",
    "lumbar",
    "carpal",
    "laptop-bad",
    "laptop-stand",
    "static-sit",
    "dynamic-chair",
    "light-diffuse",
    "break-time",
    "seat-depth",
    "contrast",
    "reach-zones",
    "chair-high",
    "climate-office",
    "sit-stand",
    "keyboard-edge",
    "turtle-neck",
    "wrist-pad",
    "sit-back",
    "dual-monitor",
    "stand-interval",
  ];
  MANUAL_ICON[`off-e${i}`] = eIcons[i - 1];
}

function hashIndex(value, modulo) {
  const hash = createHash("sha1").update(value).digest();
  return hash[0] % modulo;
}

function shortenLabel(text, max = 28) {
  const clean = text
    .replace(/\s+/g, " ")
    .replace(/[?:]+$/g, "")
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function pickIcon(question) {
  if (MANUAL_ICON[question.id]) return MANUAL_ICON[question.id];
  const haystack = `${question.id} ${question.text}`.toLowerCase();
  const rules = [
    [/alkohol|návykov/, "no-alcohol"],
    [/lékař|prohlíd/, "medical-exam"],
    [/úraz|zraněn/, "injury"],
    [/požár|hasic/, "extinguisher"],
    [/gdpr|údaj|souhlas/, "lock-data"],
    [/židl|sed|páteř|ergonom/, "chair-angle"],
    [/monitor|obrazov/, "monitor-height"],
    [/hmotnost|břemen|zved/, "weight-male"],
    [/řidič|vozidl|jízda/, "steering-focus"],
    [/pokut|sankc/, "fine-eu"],
  ];
  for (const [pattern, icon] of rules) {
    if (pattern.test(haystack)) return icon;
  }
  return "topic-card";
}

function wrapSvg(body, label) {
  const safe = label.replace(/"/g, "'");
  return `<svg viewBox="0 0 320 240" class="h-full w-full max-h-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${safe}">${body}</svg>`;
}

function labelBar(label, accent, ink) {
  const words = label.length > 24 ? label.slice(0, 23) + "…" : label;
  return `
    <rect x="16" y="196" width="288" height="32" rx="10" fill="${accent}" opacity="0.12"/>
    <text x="160" y="217" text-anchor="middle" fill="${ink}" font-size="11" font-family="Inter, system-ui, sans-serif" font-weight="700">${words}</text>
  `;
}

/** Vykreslí ikonu podle typu – každý typ je vizuálně odlišný. */
function iconBody(type, accent, ink, variant) {
  const v = variant;
  const icons = {
    "shield-duo": `
      <path d="M110 50 L160 32 L210 50 V100 C210 132 190 156 160 168 C130 156 110 132 110 100 Z" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="92" cy="88" r="16" fill="${accent}" opacity="0.2"/><circle cx="228" cy="88" r="16" fill="${accent}" opacity="0.2"/>
      <circle cx="92" cy="88" r="8" fill="${accent}"/><circle cx="228" cy="88" r="8" fill="${accent}"/>
      <path d="M144 108 L156 120 L180 96" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`,
    training: `
      <rect x="88" y="56" width="144" height="96" rx="12" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="104" y="72" width="112" height="12" rx="4" fill="${accent}" opacity="0.25"/>
      <rect x="104" y="92" width="88" height="8" rx="3" fill="${accent}" opacity="0.2"/>
      <circle cx="160" cy="128" r="14" fill="${accent}"/><text x="160" y="133" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">BOZP</text>`,
    checklist: `
      <rect x="100" y="48" width="120" height="140" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M116 80 L124 88 L140 72 M116 108 L124 116 L140 100 M116 136 L124 144 L140 128" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
      <rect x="148" y="74" width="56" height="8" rx="3" fill="${accent}" opacity="0.2"/>
      <rect x="148" y="102" width="48" height="8" rx="3" fill="${accent}" opacity="0.2"/>`,
    "no-alcohol": `
      <rect x="130" y="60" width="36" height="100" rx="8" fill="${accent}" opacity="0.85"/>
      <rect x="138" y="52" width="20" height="16" rx="4" fill="${accent}"/>
      <path d="M108 88 L212 152" stroke="#EA4335" stroke-width="8" stroke-linecap="round"/>
      <circle cx="212" cy="152" r="18" fill="#FCE8E6" stroke="#EA4335" stroke-width="3"/>
      <path d="M204 152 L220 152 M212 144 V160" stroke="#EA4335" stroke-width="3" stroke-linecap="round"/>`,
    "breath-test": `
      <rect x="96" y="88" width="128" height="56" rx="12" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="112" y="104" width="48" height="24" rx="6" fill="${accent}" opacity="0.2"/>
      <path d="M176 116 H220" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="228" cy="116" r="8" fill="${accent}"/>`,
    "medical-pay": `
      <rect x="88" y="72" width="144" height="88" rx="12" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M152 104 V136 M136 120 H168" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="208" cy="88" r="20" fill="${accent}"/><text x="208" y="93" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Kč</text>`,
    "doctor-card": `
      <rect x="104" y="56" width="112" height="128" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="160" cy="92" r="20" fill="${accent}" opacity="0.2"/>
      <path d="M152 120 H168 M160 112 V128" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`,
    injury: `
      <circle cx="160" cy="88" r="24" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M160 112 V156 M144 132 H176" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <rect x="136" y="156" width="48" height="10" rx="4" fill="${accent}" opacity="0.3"/>`,
    hazard: `
      <path d="M160 44 L248 184 H72 Z" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="152" y="108" width="16" height="36" rx="4" fill="${accent}"/><circle cx="160" cy="156" r="7" fill="${accent}"/>`,
    "medical-exam": `
      <rect x="88" y="72" width="144" height="88" rx="12" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M120 116 H200" stroke="${accent}" stroke-width="3"/><circle cx="136" cy="100" r="12" fill="${accent}" opacity="0.25"/>`,
    gloves: `
      <path d="M120 140 C120 108 136 92 152 92 C160 92 168 100 168 112 V140" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M168 112 C168 92 184 80 200 80 C216 80 224 96 224 112 V140" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M128 140 V156 M152 140 V160 M176 140 V156 M208 140 V160" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    damage: `
      <circle cx="160" cy="100" r="40" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="108" text-anchor="middle" fill="${accent}" font-size="22" font-weight="700">Kč</text>
      <path d="M120 148 H200" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`,
    unplug: `
      <rect x="120" y="108" width="80" height="48" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M144 88 V108 M176 88 V108" stroke="${accent}" stroke-width="4"/><path d="M200 132 H248" stroke="#EA4335" stroke-width="5" stroke-linecap="round"/>`,
    spark: `
      <rect x="120" y="108" width="80" height="48" rx="8" fill="#fff" stroke="#EA4335" stroke-width="3"/>
      <path d="M160 72 L168 96 L192 96 L174 112 L182 136 L160 120 L138 136 L146 112 L128 96 L152 96 Z" fill="#F9AB00"/>`,
    alert: `
      <circle cx="160" cy="108" r="52" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="118" text-anchor="middle" fill="${accent}" font-size="36" font-weight="700">!</text>`,
    extinguisher: `
      <rect x="138" y="88" width="44" height="72" rx="10" fill="${accent}"/>
      <rect x="146" y="72" width="28" height="18" rx="5" fill="${ink}"/>
      <path d="M182 104 H214" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`,
    "extinguisher-spot": `
      <rect x="40" y="160" width="240" height="8" rx="4" fill="${ink}" opacity="0.15"/>
      <rect x="140" y="92" width="40" height="68" rx="10" fill="${accent}"/>
      <path d="M56 72 H104" stroke="${accent}" stroke-width="3" stroke-dasharray="6 5"/><text x="80" y="64" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">VIDIT</text>`,
    "exit-sign": `
      <rect x="72" y="64" width="176" height="88" rx="10" fill="${accent}"/>
      <text x="160" y="92" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">ÚNIKOVÁ CESTA</text>
      <path d="M132 128 L188 104 L188 120 L228 120 L228 152 L188 152 L188 128 Z" fill="#fff"/>`,
    "fire-training": `
      <rect x="88" y="72" width="144" height="88" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="138" y="96" width="44" height="56" rx="8" fill="${accent}" opacity="0.8"/>
      <circle cx="112" cy="96" r="10" fill="${accent}"/><text x="112" y="100" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">PO</text>`,
    "powder-no": `
      <rect x="138" y="88" width="44" height="72" rx="10" fill="${accent}"/>
      <path d="M108 88 L212 152" stroke="#EA4335" stroke-width="7" stroke-linecap="round"/>
      <circle cx="96" cy="80" r="14" fill="#FCE8E6" stroke="#EA4335" stroke-width="2"/><text x="96" y="84" text-anchor="middle" fill="#EA4335" font-size="10" font-weight="700">!</text>`,
    co2: `
      <rect x="138" y="88" width="44" height="72" rx="10" fill="${accent}"/>
      <text x="160" y="128" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">CO₂</text>
      <rect x="196" y="104" width="40" height="28" rx="4" fill="#fff" stroke="${ink}" stroke-width="2"/>
      <path d="M204 118 H228" stroke="#F9AB00" stroke-width="3"/>`,
    "water-fire": `
      <rect x="138" y="88" width="44" height="72" rx="10" fill="#4285F4"/>
      <text x="160" y="124" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">H₂O</text>
      <path d="M200 140 C200 120 220 108 232 96" stroke="#F9AB00" stroke-width="4" fill="none"/>`,
    valves: `
      <circle cx="120" cy="116" r="22" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="200" cy="116" r="22" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M120 104 V128 M108 116 H132 M200 104 V128 M188 116 H212" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`,
    rescue: `
      <circle cx="128" cy="108" r="18" fill="${accent}" opacity="0.25"/><circle cx="192" cy="108" r="18" fill="${accent}" opacity="0.25"/>
      <path d="M128 126 V156 M192 126 V156 M128 108 H192" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    "calendar-check": `
      <rect x="96" y="64" width="128" height="104" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="96" y="64" width="128" height="24" rx="10" fill="${accent}"/>
      <path d="M128 120 L140 132 L176 96" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    pictogram: `
      <rect x="138" y="88" width="44" height="72" rx="10" fill="${accent}"/>
      <rect x="148" y="100" width="24" height="20" rx="3" fill="#fff" opacity="0.9"/>
      <path d="M152 112 L160 120 L168 104" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`,
    alarm: `
      <path d="M160 56 C196 56 220 80 220 112 H100 C100 80 124 56 160 56 Z" fill="${accent}"/>
      <rect x="148" y="112" width="24" height="16" rx="4" fill="${ink}"/>
      <path d="M136 136 C136 148 184 148 184 136" stroke="${accent}" stroke-width="3"/>`,
    evacuate: `
      <rect x="72" y="80" width="176" height="72" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M96 140 L160 100 L224 140" stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    "initial-fire": `
      <rect x="138" y="100" width="44" height="60" rx="8" fill="${accent}"/>
      <path d="M196 120 C208 108 220 108 228 120 C220 140 204 148 196 132" fill="#F9AB00"/>`,
    "fire-duty": `
      <path d="M160 48 C184 72 196 96 196 124 C196 152 180 168 160 176 C140 168 124 152 124 124 C124 96 136 72 160 48 Z" fill="${accent}" opacity="0.85"/>
      <path d="M160 72 C172 88 176 104 176 120 C176 136 168 148 160 152 C152 148 144 136 144 120 C144 104 148 88 160 72 Z" fill="#F9AB00"/>`,
    "phone-150": `
      <rect x="108" y="64" width="104" height="128" rx="16" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="120" text-anchor="middle" fill="${accent}" font-size="28" font-weight="700">150</text>
      <circle cx="160" cy="156" r="10" fill="${accent}"/>`,
    "steering-focus": `
      <circle cx="160" cy="116" r="36" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="160" cy="116" r="20" fill="${accent}" opacity="0.15"/>
      <path d="M160 92 V104 M160 128 V140 M136 116 H148 M172 116 H184" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`,
    "overtake-left": `
      <rect x="80" y="120" width="72" height="32" rx="8" fill="${accent}" opacity="0.7"/>
      <rect x="168" y="104" width="72" height="32" rx="8" fill="${ink}" opacity="0.35"/>
      <path d="M152 120 L188 96 L188 112 L220 112 L220 136 L188 136 L188 120 Z" fill="${accent}"/>`,
    "crash-stop": `
      <rect x="88" y="112" width="144" height="40" rx="10" fill="${accent}" opacity="0.8"/>
      <path d="M104 152 H216" stroke="#EA4335" stroke-width="6" stroke-linecap="round"/>
      <text x="160" y="100" text-anchor="middle" fill="#EA4335" font-size="12" font-weight="700">STOP</text>`,
    seatbelt: `
      <circle cx="160" cy="92" r="20" fill="${accent}" opacity="0.2"/>
      <path d="M132 120 C132 104 188 104 188 120 V156 H132 Z" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M144 132 H176" stroke="${accent}" stroke-width="4"/>`,
    "no-speed-up": `
      <rect x="88" y="112" width="64" height="32" rx="8" fill="${ink}" opacity="0.3"/>
      <rect x="168" y="96" width="64" height="32" rx="8" fill="${accent}" opacity="0.8"/>
      <path d="M120 128 H120" stroke="#EA4335" stroke-width="4"/><text x="120" y="108" text-anchor="middle" fill="#EA4335" font-size="10" font-weight="700">max</text>`,
    police: `
      <circle cx="160" cy="88" r="24" fill="${accent}"/>
      <rect x="136" y="112" width="48" height="56" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="148" y="72" width="24" height="10" rx="3" fill="#fff"/>`,
    crosswalk: `
      <rect x="72" y="140" width="176" height="32" rx="4" fill="${accent}" opacity="0.2"/>
      <path d="M88 148 H104 M120 148 H136 M152 148 H168 M184 148 H200 M216 148 H232" stroke="#fff" stroke-width="8"/>
      <rect x="140" y="88" width="40" height="24" rx="6" fill="${accent}" opacity="0.7"/>`,
    "car-check": `
      <rect x="88" y="112" width="144" height="48" rx="12" fill="${accent}" opacity="0.75"/>
      <circle cx="112" cy="168" r="12" fill="${ink}"/><circle cx="208" cy="168" r="12" fill="${ink}"/>
      <path d="M128 100 L192 100" stroke="#fff" stroke-width="3"/>`,
    "road-adapt": `
      <path d="M48 168 Q160 120 272 168" stroke="${ink}" stroke-width="10" stroke-linecap="round" opacity="0.2"/>
      <path d="M120 148 L160 124 L200 148" stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    sidewalk: `
      <rect x="56" y="120" width="88" height="40" rx="6" fill="${accent}" opacity="0.25"/>
      <circle cx="200" cy="108" r="16" fill="${accent}" opacity="0.2"/>
      <path d="M200 124 V156" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    "weight-male": `
      <rect x="132" y="108" width="56" height="40" rx="6" fill="${accent}"/>
      <text x="160" y="134" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">50 kg</text>`,
    "weight-female": `
      <rect x="132" y="108" width="56" height="40" rx="6" fill="${accent}"/>
      <text x="160" y="134" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">30 kg</text>`,
    spine: `
      <path d="M160 56 V168" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
      <path d="M144 80 H176 M144 108 H176 M144 136 H176" stroke="${accent}" stroke-width="3" opacity="0.5"/>`,
    feet: `
      <ellipse cx="128" cy="148" rx="24" ry="10" fill="${accent}" opacity="0.3"/>
      <ellipse cx="192" cy="148" rx="24" ry="10" fill="${accent}" opacity="0.3"/>
      <path d="M128 120 V148 M192 120 V148" stroke="${accent}" stroke-width="4"/>`,
    "hold-close": `
      <circle cx="160" cy="96" r="20" fill="${accent}" opacity="0.2"/>
      <rect x="148" y="116" width="24" height="32" rx="4" fill="${accent}"/>
      <path d="M148 116 C140 116 132 124 132 132" stroke="${accent}" stroke-width="3" fill="none"/>`,
    "no-twist": `
      <circle cx="160" cy="88" r="18" fill="${accent}" opacity="0.2"/>
      <path d="M160 106 V140" stroke="${accent}" stroke-width="5"/>
      <path d="M132 124 C160 108 188 140 188 140" stroke="#EA4335" stroke-width="3" fill="none" stroke-dasharray="5 4"/>`,
    legs: `
      <path d="M144 88 V140 M176 88 V140 M144 140 L132 168 M176 140 L188 168" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`,
    assess: `
      <rect x="136" y="108" width="48" height="40" rx="6" fill="${accent}" opacity="0.3"/>
      <circle cx="208" cy="88" r="16" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M202 88 L208 94 L216 82" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>`,
    jerk: `
      <rect x="136" y="108" width="48" height="40" rx="6" fill="${accent}"/>
      <path d="M120 88 L200 152" stroke="#EA4335" stroke-width="4" stroke-dasharray="4 4"/>`,
    "height-carry": `
      <rect x="148" y="96" width="24" height="48" rx="4" fill="${accent}"/>
      <path d="M120 72 H200" stroke="${ink}" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="160" y="68" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">pas–hrudník</text>`,
    "sit-limit": `
      <rect x="104" y="120" width="112" height="20" rx="6" fill="${accent}" opacity="0.3"/>
      <rect x="136" y="108" width="48" height="24" rx="4" fill="${accent}"/>
      <text x="160" y="124" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">5 kg</text>`,
    crane: `
      <path d="M96 168 H224" stroke="${ink}" stroke-width="4"/>
      <path d="M120 168 V96 H200 V120" stroke="${accent}" stroke-width="5"/>
      <rect x="188" y="120" width="24" height="20" rx="3" fill="${accent}"/>`,
    sharp: `
      <polygon points="160,64 200,152 120,152" fill="#fff" stroke="#EA4335" stroke-width="3"/>
      <path d="M148 120 H172" stroke="#EA4335" stroke-width="3"/>`,
    "team-lift": `
      <circle cx="120" cy="96" r="14" fill="${accent}" opacity="0.25"/><circle cx="200" cy="96" r="14" fill="${accent}" opacity="0.25"/>
      <rect x="104" y="128" width="112" height="16" rx="4" fill="${accent}"/>`,
    "sum-weight": `
      <text x="160" y="108" text-anchor="middle" fill="${accent}" font-size="22" font-weight="700">Σ</text>
      <path d="M112 132 H208" stroke="${ink}" stroke-width="2"/>
      <text x="160" y="152" text-anchor="middle" fill="${ink}" font-size="10" font-weight="600">za směnu</text>`,
    "sum-10t": `
      <text x="160" y="120" text-anchor="middle" fill="${accent}" font-size="18" font-weight="700">10 000 kg</text>
      <text x="160" y="140" text-anchor="middle" fill="${ink}" font-size="10" font-weight="600">/ směna</text>`,
    grip: `
      <rect x="132" y="108" width="56" height="36" rx="6" fill="${accent}" opacity="0.35"/>
      <path d="M128 124 C128 108 144 100 160 100 C176 100 192 108 192 124" stroke="${accent}" stroke-width="4" fill="none"/>`,
    "wet-floor": `
      <rect x="72" y="140" width="176" height="24" rx="6" fill="${accent}" opacity="0.2"/>
      <path d="M88 152 Q104 144 120 152 T152 152 T184 152 T216 152" stroke="#4285F4" stroke-width="3" fill="none"/>`,
    "oopp-shoes": `
      <path d="M128 140 C128 124 144 116 160 116 C176 116 192 124 192 140 V152 H128 Z" fill="${accent}" opacity="0.35"/>
      <rect x="136" y="132" width="48" height="8" rx="2" fill="${ink}" opacity="0.4"/>`,
    shelf: `
      <rect x="88" y="104" width="144" height="8" fill="${ink}" opacity="0.25"/>
      <rect x="148" y="80" width="24" height="24" rx="4" fill="${accent}"/>
      <path d="M148 104 V112" stroke="${accent}" stroke-width="3"/>`,
    liquid: `
      <rect x="140" y="88" width="40" height="64" rx="6" fill="${accent}" opacity="0.5"/>
      <path d="M148 108 C160 116 172 100 172 120" stroke="#fff" stroke-width="3" fill="none"/>`,
    climate: `
      <circle cx="128" cy="108" r="24" fill="#E3F2FD" stroke="#4285F4" stroke-width="2"/>
      <text x="128" y="112" text-anchor="middle" fill="#4285F4" font-size="12" font-weight="700">°C</text>
      <circle cx="200" cy="108" r="24" fill="#FFF3E0" stroke="#F9AB00" stroke-width="2"/>
      <text x="200" y="112" text-anchor="middle" fill="#F9AB00" font-size="12" font-weight="700">°C</text>`,
    "push-cart": `
      <rect x="120" y="108" width="80" height="36" rx="6" fill="${accent}" opacity="0.35"/>
      <circle cx="136" cy="152" r="8" fill="${ink}"/><circle cx="184" cy="152" r="8" fill="${ink}"/>
      <path d="M200 128 H232" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    cliff: `
      <path d="M72 168 H248 V120 L200 88 H120 Z" fill="${accent}" opacity="0.2"/>
      <path d="M120 120 H200 V168" stroke="#EA4335" stroke-width="3"/>
      <rect x="148" y="104" width="24" height="24" rx="4" fill="${accent}"/>`,
    pregnant: `
      <circle cx="160" cy="88" r="18" fill="${accent}" opacity="0.2"/>
      <path d="M144 106 C144 130 176 130 176 106 V156 H144 Z" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="160" cy="128" r="12" fill="${accent}" opacity="0.25"/>`,
    "comfort-zone": `
      <rect x="120" y="96" width="80" height="64" rx="8" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="6 4"/>
      <rect x="148" y="112" width="24" height="32" rx="4" fill="${accent}" opacity="0.5"/>`,
    "tall-load": `
      <rect x="128" y="72" width="64" height="88" rx="4" fill="${accent}" opacity="0.35"/>
      <path d="M112 72 H208" stroke="${ink}" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="160" cy="64" r="6" fill="#EA4335"/>`,
    occasional: `
      <circle cx="160" cy="108" r="40" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M160 88 V108 L172 120" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
      <text x="160" y="152" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">≤ 30 min</text>`,
    suction: `
      <rect x="136" y="96" width="48" height="56" rx="4" fill="${accent}" opacity="0.25"/>
      <circle cx="152" cy="124" r="10" fill="${accent}"/><circle cx="168" cy="124" r="10" fill="${accent}"/>`,
    "employer-train": `
      <rect x="88" y="72" width="144" height="88" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="128" cy="108" r="14" fill="${accent}" opacity="0.25"/><circle cx="192" cy="108" r="14" fill="${accent}" opacity="0.25"/>
      <path d="M120 132 H200" stroke="${accent}" stroke-width="3"/>`,
    "eu-law": `
      <circle cx="128" cy="108" r="28" fill="#003399"/><text x="128" y="114" text-anchor="middle" fill="#FFCC00" font-size="11" font-weight="700">EU</text>
      <rect x="168" y="84" width="64" height="48" rx="6" fill="#fff" stroke="${accent}" stroke-width="2"/>`,
    "cz-law": `
      <rect x="104" y="72" width="48" height="32" rx="4" fill="#fff" stroke="${accent}" stroke-width="2"/>
      <rect x="168" y="72" width="48" height="32" rx="4" fill="${accent}" opacity="0.2"/>
      <path d="M128 120 H192" stroke="${accent}" stroke-width="3"/>`,
    controller: `
      <rect x="104" y="72" width="112" height="80" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="160" cy="104" r="16" fill="${accent}" opacity="0.25"/>
      <path d="M128 132 H192" stroke="${accent}" stroke-width="3"/>`,
    "child-15": `
      <circle cx="160" cy="92" r="20" fill="${accent}" opacity="0.2"/>
      <text x="160" y="132" text-anchor="middle" fill="${accent}" font-size="22" font-weight="700">15+</text>`,
    sensitive: `
      <rect x="104" y="80" width="112" height="72" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M128 104 H192 M128 120 H176" stroke="${accent}" stroke-width="3" opacity="0.35"/>
      <circle cx="160" cy="136" r="10" fill="#EA4335"/>`,
    contract: `
      <rect x="96" y="72" width="128" height="96" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M120 104 H200 M120 124 H184" stroke="${accent}" stroke-width="3" opacity="0.35"/>
      <path d="M128 144 L140 156 L168 128" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`,
    minimize: `
      <rect x="120" y="88" width="80" height="64" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M160 88 V72 M144 80 H176" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="124" text-anchor="middle" fill="${accent}" font-size="12" font-weight="700">min</text>`,
    consent: `
      <rect x="104" y="80" width="112" height="72" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M128 128 L140 140 L176 104" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <path d="M184 104 L200 88" stroke="#EA4335" stroke-width="3" stroke-linecap="round"/>`,
    "correct-data": `
      <rect x="104" y="80" width="112" height="72" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M128 116 H184 M128 132 H168" stroke="${accent}" stroke-width="3" opacity="0.3"/>
      <path d="M176 104 L188 116 L212 92" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`,
    portable: `
      <rect x="112" y="88" width="96" height="64" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M128 112 H192 M128 128 H176" stroke="${accent}" stroke-width="3" opacity="0.3"/>
      <path d="M200 108 L220 108 L220 132 L200 132 Z" stroke="${accent}" stroke-width="2"/>`,
    uoou: `
      <rect x="88" y="72" width="144" height="88" rx="10" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="120" text-anchor="middle" fill="${accent}" font-size="16" font-weight="700">ÚOOÚ</text>`,
    dpo: `
      <circle cx="160" cy="92" r="22" fill="${accent}" opacity="0.2"/>
      <rect x="128" y="116" width="64" height="40" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="142" text-anchor="middle" fill="${accent}" font-size="11" font-weight="700">DPO</text>`,
    "clock-72": `
      <circle cx="160" cy="108" r="44" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M160 88 V108 L176 120" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
      <text x="160" y="152" text-anchor="middle" fill="${ink}" font-size="11" font-weight="700">72 h</text>`,
    "notify-user": `
      <circle cx="128" cy="108" r="20" fill="${accent}" opacity="0.2"/>
      <rect x="168" y="88" width="64" height="48" rx="6" fill="#fff" stroke="${accent}" stroke-width="2"/>
      <path d="M148 108 H168" stroke="${accent}" stroke-width="3"/>`,
    records: `
      <rect x="96" y="72" width="128" height="96" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="112" y="88" width="96" height="10" rx="3" fill="${accent}" opacity="0.2"/>
      <rect x="112" y="106" width="80" height="8" rx="3" fill="${accent}" opacity="0.15"/>
      <rect x="112" y="122" width="88" height="8" rx="3" fill="${accent}" opacity="0.15"/>`,
    "fine-eu": `
      <text x="160" y="108" text-anchor="middle" fill="${accent}" font-size="20" font-weight="700">€</text>
      <text x="160" y="132" text-anchor="middle" fill="${ink}" font-size="10" font-weight="600">až 4 % obratu</text>`,
    municipality: `
      <path d="M120 152 H200 V96 L160 72 Z" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="148" y="120" width="24" height="32" fill="${accent}" opacity="0.25"/>`,
    "privacy-design": `
      <rect x="104" y="80" width="112" height="72" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="160" cy="108" r="16" fill="${accent}" opacity="0.2"/>
      <path d="M152 108 H168 M160 100 V116" stroke="${accent}" stroke-width="3"/>`,
    dpia: `
      <rect x="96" y="72" width="128" height="96" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="120" text-anchor="middle" fill="${accent}" font-size="14" font-weight="700">DPIA</text>`,
    "processor-contract": `
      <rect x="88" y="96" width="56" height="48" rx="6" fill="${accent}" opacity="0.25"/>
      <rect x="176" y="96" width="56" height="48" rx="6" fill="${accent}" opacity="0.25"/>
      <path d="M144 120 H176" stroke="${accent}" stroke-width="3"/>`,
    subprocessor: `
      <rect x="72" y="104" width="48" height="40" rx="6" fill="${accent}" opacity="0.2"/>
      <rect x="136" y="96" width="48" height="40" rx="6" fill="${accent}" opacity="0.35"/>
      <rect x="200" y="104" width="48" height="40" rx="6" fill="${accent}" opacity="0.2"/>
      <path d="M120 124 H136 M184 124 H200" stroke="${accent}" stroke-width="3"/>`,
    "transfer-globe": `
      <circle cx="160" cy="108" r="40" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M120 108 H200 M160 68 V148" stroke="${accent}" stroke-width="2" opacity="0.4"/>`,
    "info-duty": `
      <circle cx="128" cy="108" r="18" fill="${accent}" opacity="0.2"/>
      <rect x="160" y="88" width="72" height="56" rx="6" fill="#fff" stroke="${accent}" stroke-width="2"/>
      <text x="196" y="120" text-anchor="middle" fill="${accent}" font-size="10" font-weight="700">info</text>`,
    "limit-processing": `
      <rect x="104" y="80" width="112" height="72" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <rect x="120" y="96" width="80" height="40" rx="4" fill="${accent}" opacity="0.15"/>
      <path d="M120 116 H200" stroke="#EA4335" stroke-width="4"/>`,
    journalism: `
      <rect x="96" y="72" width="128" height="96" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="108" text-anchor="middle" fill="${accent}" font-size="11" font-weight="700">tisk / média</text>`,
    "no-marketing-consent": `
      <rect x="104" y="88" width="112" height="56" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M128 116 H192" stroke="${accent}" stroke-width="3"/>
      <path d="M136 104 L184 136" stroke="#EA4335" stroke-width="3"/>`,
    "individual-fine": `
      <circle cx="160" cy="96" r="22" fill="${accent}" opacity="0.2"/>
      <text x="160" y="132" text-anchor="middle" fill="${accent}" font-size="14" font-weight="700">1–5 mil. Kč</text>`,
    "storage-limit": `
      <rect x="112" y="88" width="96" height="64" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M128 112 H192 M128 128 H176" stroke="${accent}" stroke-width="3" opacity="0.3"/>
      <path d="M184 104 L200 120 L184 136" stroke="${accent}" stroke-width="2" fill="none"/>`,
    "dpo-external": `
      <circle cx="128" cy="104" r="16" fill="${accent}" opacity="0.25"/>
      <rect x="168" y="88" width="64" height="48" rx="6" fill="#fff" stroke="${accent}" stroke-width="2"/>
      <path d="M144 104 H168" stroke="${accent}" stroke-width="3"/>`,
    anonymize: `
      <rect x="104" y="88" width="52" height="56" rx="6" fill="#fff" stroke="${accent}" stroke-width="2"/>
      <rect x="164" y="88" width="52" height="56" rx="6" fill="${accent}" opacity="0.15"/>
      <text x="130" y="120" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">ID</text>
      <text x="190" y="120" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">###</text>`,
    "chair-angle": `
      <rect x="104" y="128" width="112" height="16" rx="4" fill="${accent}" opacity="0.25"/>
      <circle cx="160" cy="96" r="16" fill="${accent}" opacity="0.2"/>
      <path d="M144 112 L160 128 L176 112" stroke="${accent}" stroke-width="3" fill="none"/>
      <text x="188" y="120" fill="${accent}" font-size="10" font-weight="700">90°</text>`,
    "monitor-height": `
      <rect x="196" y="72" width="56" height="40" rx="4" fill="${accent}" opacity="0.2"/>
      <circle cx="128" cy="104" r="12" fill="${accent}" opacity="0.2"/>
      <path d="M128 104 L196 92" stroke="${accent}" stroke-width="2" stroke-dasharray="4 3"/>`,
    "monitor-distance": `
      <rect x="200" y="80" width="48" height="36" rx="4" fill="${accent}" opacity="0.2"/>
      <circle cx="120" cy="96" r="10" fill="${accent}"/>
      <path d="M130 96 H200" stroke="${accent}" stroke-width="2" stroke-dasharray="5 4"/>
      <text x="165" y="88" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">50–70 cm</text>`,
    rsi: `
      <path d="M128 88 V140 M192 88 V140" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <path d="M128 112 C144 96 176 96 192 112" stroke="#EA4335" stroke-width="3" fill="none"/>`,
    "vertical-mouse": `
      <rect x="148" y="88" width="24" height="56" rx="10" fill="${accent}" opacity="0.35"/>
      <rect x="184" y="108" width="40" height="24" rx="10" fill="${ink}" opacity="0.15"/>`,
    "desk-height": `
      <rect x="72" y="124" width="176" height="12" rx="3" fill="${ink}" opacity="0.2"/>
      <path d="M128 104 H192" stroke="${accent}" stroke-width="3"/>
      <text x="160" y="100" text-anchor="middle" fill="${accent}" font-size="10" font-weight="700">lokty 90°</text>`,
    "rule-20": `
      <text x="160" y="108" text-anchor="middle" fill="${accent}" font-size="24" font-weight="700">20-20-20</text>
      <circle cx="220" cy="88" r="12" fill="${accent}" opacity="0.2"/>`,
    "feet-floor": `
      <rect x="104" y="140" width="112" height="12" rx="4" fill="${accent}" opacity="0.2"/>
      <ellipse cx="136" cy="132" rx="16" ry="6" fill="${accent}"/><ellipse cx="184" cy="132" rx="16" ry="6" fill="${accent}"/>`,
    "window-side": `
      <rect x="56" y="72" width="32" height="96" rx="4" fill="#E3F2FD" stroke="#4285F4" stroke-width="2"/>
      <rect x="200" y="88" width="48" height="36" rx="4" fill="${accent}" opacity="0.2"/>`,
    "wrist-flat": `
      <path d="M112 120 H208" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <rect x="148" y="108" width="24" height="12" rx="4" fill="${accent}" opacity="0.35"/>`,
    lumbar: `
      <path d="M160 72 V168" stroke="${accent}" stroke-width="5"/>
      <path d="M144 120 C160 108 176 120 176 120" stroke="${accent}" stroke-width="4" fill="none"/>`,
    carpal: `
      <path d="M128 104 H192" stroke="${accent}" stroke-width="4"/>
      <path d="M144 104 C144 88 176 88 176 104" stroke="#EA4335" stroke-width="3" fill="none"/>
      <text x="160" y="140" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">brnění</text>`,
    "laptop-bad": `
      <rect x="120" y="120" width="80" height="48" rx="6" fill="${accent}" opacity="0.2"/>
      <path d="M160 88 C172 104 172 120 160 120" stroke="#EA4335" stroke-width="3" fill="none"/>`,
    "laptop-stand": `
      <rect x="184" y="80" width="56" height="36" rx="4" fill="${accent}" opacity="0.2"/>
      <rect x="112" y="128" width="96" height="12" rx="3" fill="${ink}" opacity="0.2"/>
      <rect x="120" y="140" width="80" height="8" rx="2" fill="${accent}"/>`,
    "static-sit": `
      <rect x="120" y="128" width="80" height="16" rx="6" fill="${accent}" opacity="0.25"/>
      <circle cx="160" cy="96" r="16" fill="${accent}" opacity="0.2"/>
      <path d="M144 140 H176" stroke="#EA4335" stroke-width="3"/>`,
    "dynamic-chair": `
      <rect x="120" y="128" width="80" height="16" rx="6" fill="${accent}" opacity="0.25"/>
      <path d="M136 104 Q160 88 184 104" stroke="${accent}" stroke-width="3" fill="none"/>`,
    "light-diffuse": `
      <circle cx="96" cy="88" r="20" fill="#FFF9C4" stroke="#F9AB00" stroke-width="2"/>
      <rect x="200" y="88" width="48" height="36" rx="4" fill="${accent}" opacity="0.15"/>`,
    "break-time": `
      <circle cx="160" cy="108" r="40" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <path d="M160 88 V108 L176 120" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
      <text x="160" y="152" text-anchor="middle" fill="${ink}" font-size="9" font-weight="600">45–60 min</text>`,
    "seat-depth": `
      <rect x="104" y="120" width="112" height="20" rx="6" fill="${accent}" opacity="0.25"/>
      <path d="M104 132 H160" stroke="#EA4335" stroke-width="3"/>
      <circle cx="160" cy="96" r="14" fill="${accent}" opacity="0.2"/>`,
    contrast: `
      <rect x="104" y="88" width="112" height="56" rx="6" fill="#fff" stroke="${ink}" stroke-width="3"/>
      <text x="160" y="120" text-anchor="middle" fill="${ink}" font-size="12" font-weight="700">Aa</text>`,
    "reach-zones": `
      <circle cx="160" cy="116" r="48" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/>
      <circle cx="160" cy="116" r="28" fill="${accent}" opacity="0.15"/>
      <rect x="148" y="108" width="24" height="16" rx="3" fill="${accent}"/>`,
    "chair-high": `
      <rect x="120" y="100" width="80" height="16" rx="6" fill="${accent}" opacity="0.25"/>
      <path d="M136 132 V152 M184 132 V152" stroke="${accent}" stroke-width="3" stroke-dasharray="4 3"/>`,
    "climate-office": `
      <text x="128" y="112" text-anchor="middle" fill="#4285F4" font-size="12" font-weight="700">20–24°C</text>
      <text x="200" y="112" text-anchor="middle" fill="${accent}" font-size="12" font-weight="700">40–60 %</text>`,
    "sit-stand": `
      <rect x="104" y="132" width="112" height="10" rx="3" fill="${ink}" opacity="0.2"/>
      <path d="M128 104 V132 M192 88 V132" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    "keyboard-edge": `
      <rect x="72" y="124" width="176" height="12" rx="3" fill="${ink}" opacity="0.15"/>
      <rect x="128" y="108" width="64" height="16" rx="4" fill="${accent}" opacity="0.35"/>
      <path d="M104 116 H128" stroke="${accent}" stroke-width="2" stroke-dasharray="3 3"/>`,
    "turtle-neck": `
      <circle cx="160" cy="80" r="14" fill="${accent}" opacity="0.2"/>
      <path d="M160 94 C172 108 172 120 160 128" stroke="#EA4335" stroke-width="4" fill="none"/>
      <rect x="196" y="88" width="48" height="32" rx="4" fill="${accent}" opacity="0.2"/>`,
    "wrist-pad": `
      <rect x="112" y="120" width="96" height="12" rx="6" fill="${accent}" opacity="0.35"/>
      <rect x="128" y="104" width="64" height="16" rx="4" fill="${ink}" opacity="0.12"/>`,
    "sit-back": `
      <rect x="104" y="120" width="112" height="20" rx="6" fill="${accent}" opacity="0.25"/>
      <circle cx="128" cy="104" r="12" fill="${accent}" opacity="0.2"/>`,
    "dual-monitor": `
      <rect x="120" y="88" width="36" height="28" rx="3" fill="${accent}" opacity="0.2"/>
      <rect x="164" y="88" width="36" height="28" rx="3" fill="${accent}" opacity="0.35"/>
      <path d="M160 80 C148 72 136 88 136 88" stroke="#EA4335" stroke-width="2" fill="none"/>`,
    "stand-interval": `
      <text x="160" y="112" text-anchor="middle" fill="${accent}" font-size="16" font-weight="700">30–60 min</text>
      <path d="M128 132 V148 M192 120 V148" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    "lock-data": `
      <rect x="104" y="80" width="112" height="72" rx="8" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="160" cy="108" r="14" fill="${accent}"/>
      <rect x="154" y="112" width="12" height="10" rx="2" fill="#fff"/>`,
    "topic-card": `
      <rect x="88" y="72" width="144" height="96" rx="12" fill="#fff" stroke="${accent}" stroke-width="3"/>
      <circle cx="160" cy="108" r="20" fill="${accent}" opacity="0.2"/>
      <path d="M148 108 H172" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>`,
  };

  const body = icons[type] ?? icons["topic-card"];
  const deco =
    v % 3 === 0
      ? `<circle cx="48" cy="48" r="10" fill="${accent}" opacity="0.15"/>`
      : v % 3 === 1
        ? `<rect x="252" y="44" width="20" height="20" rx="4" fill="${accent}" opacity="0.12"/>`
        : `<path d="M40 180 H80" stroke="${accent}" stroke-width="3" opacity="0.2" stroke-linecap="round"/>`;

  return `${deco}${body}`;
}

function buildIllustration(question) {
  const icon = pickIcon(question);
  const palette = PALETTES[hashIndex(question.id, PALETTES.length)];
  const variant = hashIndex(`${question.id}-${icon}`, 3);
  const label = shortenLabel(question.text);
  const body = `
    <rect width="320" height="240" rx="20" fill="${palette.bg}"/>
    ${iconBody(icon, palette.accent, palette.ink, variant)}
    ${labelBar(label, palette.accent, palette.ink)}
  `;
  return wrapSvg(body, label);
}

async function main() {
  const illustrations = {};
  let premiumCount = 0;
  let legacyCount = 0;

  for (const [slug, fileName] of Object.entries(OFFICIAL_QUIZ_FILES)) {
    const quiz = JSON.parse(await readFile(path.join(QUIZ_DIR, fileName), "utf8"));
    let coursePremium = 0;

    for (const question of quiz.questions) {
      const illustrationKey = `${slug}:${question.id}`;
      if (hasPremiumIllustration(illustrationKey)) {
        illustrations[illustrationKey] = getPremiumIllustration(illustrationKey);
        premiumCount += 1;
        coursePremium += 1;
      } else {
        illustrations[illustrationKey] = buildIllustration(question);
        legacyCount += 1;
      }
    }

    console.log(`${slug}: ${quiz.questions.length} ilustrací (${coursePremium} prémiových)`);
  }

  const output = `/** Automaticky generováno – node scripts/build-hrbek-illustrations.mjs */\nexport const QUESTION_ILLUSTRATION_SVG = ${JSON.stringify(illustrations, null, 2)};\n`;
  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, output, "utf8");
  console.log(
    `Uloženo: ${OUT_PATH} (${Object.keys(illustrations).length} otázek, ${premiumCount} prémiových, ${legacyCount} legacy)`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
