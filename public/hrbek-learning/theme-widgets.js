/**
 * Vizuály studijních karet – per-otázka PNG ilustrace (priorita) nebo záložní tema widgety.
 */
import { QUESTION_IMAGE_IDS } from "./question-images.js";

const QUESTION_IMAGE_BASE = "images/questions";

const ICONS = {
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "graduation-cap":
    '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  "hard-hat":
    '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/>',
  "clipboard-check":
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  "wine-off":
    '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M7.5 7.5c-.5 2.5-.5 5.5 0 8"/><path d="M16.5 7.5c.5 2.5.5 5.5 0 8"/><path d="m2 2 20 20"/>',
  stethoscope:
    '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  "heart-pulse":
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  "alert-triangle":
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  plug:
    '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  scale:
    '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  cog:
    '<path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/>',
  "door-open":
    '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/>',
  "signpost":
    '<path d="M12 13v8"/><path d="M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.563l2 2a1 1 0 0 1 0 1.414l-2 2A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.563l-2-2a1 1 0 0 1 0-1.414l2-2A2 2 0 0 1 6 6z"/>',
  "fire-extinguisher":
    '<path d="M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5"/><path d="M9 18h8"/><path d="M18 3h-3"/><path d="M11 3a5 5 0 0 0-5 5v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a5 5 0 0 0-5-5Z"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  "alarm-smoke":
    '<path d="M11 21c-1.5 0-2.5-.5-3-1.5"/><path d="M18 12h.01"/><path d="M20 8a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 13.172 4H10.5a2 2 0 0 0-2 2v1"/><path d="M6 8H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0v-4a2 2 0 0 0-2-2h-2"/><path d="M6 15v2"/><path d="M18 15v2"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  eye:
    '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  "shield-check":
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  badge:
    '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>',
  "circle-gauge":
    '<path d="M15.6 2.7a10 10 0 1 0 5.7 5.7"/><circle cx="12" cy="12" r="2"/><path d="M13.4 10.6 19 5"/>',
  "triangle-alert":
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  "footprints":
    '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.52-6C9.62 2 10 6 10 6"/><path d="M10.5 4.5 11 6"/><path d="M10 16v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.52-6C6.38 2 6 6 6 6"/><path d="M6 16v-2.38c0-2.12-1.03-3.12-1-5.62.03-2.72 1.49-6 4.52-6C9.62 2 10 6 10 6"/><path d="M14 7.5c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5"/><path d="M18 11.5c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5"/>',
  package:
    '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
  "arrow-up-from-line":
    '<path d="m18 9-6-6-6 6"/><path d="M12 3v14"/><path d="M5 21h14"/>',
  hand:
    '<path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  "users-round":
    '<path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>',
  forklift:
    '<path d="M12 12H5a2 2 0 0 0-2 2v5"/><circle cx="13" cy="19" r="2"/><circle cx="5" cy="19" r="2"/><path d="M8 19h3"/><path d="m17 17-5-8H9l3 6"/><path d="M16 5V3"/><path d="M19 8V6"/><path d="M22 11V9"/>',
  warehouse:
    '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
  thermometer:
    '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  flag:
    '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  building:
    '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  cloud:
    '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  funnel:
    '<path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/>',
  fingerprint:
    '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
  "user-check":
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  "file-text":
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  euro:
    '<path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  chair:
    '<path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M6 12h12"/><path d="M6 16h12"/><path d="M6 20h12"/><path d="M6 12v8"/><path d="M18 12v8"/>',
  monitor:
    '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  keyboard:
    '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  laptop:
    '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9"/><path d="M2 17h20"/><path d="M6 20h12"/>',
  activity:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  clock:
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  sun:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  "arrow-up-down":
    '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  "layout-grid":
    '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  lock:
    '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "circle-check":
    '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
};

const BADGE_ICONS = {
  ok: '<path d="m9 12 2 2 4-4"/>',
  no: '<path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  warn: '<path d="M12 9v4"/><path d="M12 17h.01"/>',
};

const BADGE_STYLES = {
  ok: "border-emerald-200 bg-emerald-100 text-emerald-800",
  no: "border-red-200 bg-red-100 text-red-800",
  warn: "border-amber-200 bg-amber-100 text-amber-800",
};

const THEME_IMAGE_BASE = "images/themes";

export const THEME_WIDGETS = {
  "tema-1-1": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["shield", "users"], badges: [{ variant: "ok", text: "Společná odpovědnost" }, { variant: "warn", text: "Prevence rizik" }], image: `${THEME_IMAGE_BASE}/tema-1-1.png`, imageAlt: "Společná odpovědnost za bezpečnost na pracovišti" },
  "tema-1-2": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["graduation-cap", "clipboard-check"], badges: [{ variant: "ok", text: "Povinné školení" }, { variant: "ok", text: "Ověření znalostí" }], image: `${THEME_IMAGE_BASE}/tema-1-2.png`, imageAlt: "Povinné školení BOZP a ověření znalostí" },
  "tema-1-3": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["hard-hat", "clipboard-check"], badges: [{ variant: "ok", text: "OOPP povinné" }, { variant: "no", text: "Porušení postupu" }], image: `${THEME_IMAGE_BASE}/tema-1-3.png`, imageAlt: "Pracovní postupy a osobní ochranné pracovní prostředky" },
  "tema-1-4": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["wine-off"], badges: [{ variant: "no", text: "Zákaz látek" }, { variant: "ok", text: "Střízlivost" }], image: `${THEME_IMAGE_BASE}/tema-1-4.png`, imageAlt: "Zákaz alkoholu a návykových látek na pracovišti" },
  "tema-1-5": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["stethoscope", "heart-pulse"], badges: [{ variant: "ok", text: "Prohlídka" }, { variant: "ok", text: "Hradí zaměstnavatel" }] },
  "tema-1-6": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["alert-triangle", "shield-check"], badges: [{ variant: "ok", text: "Hlášení závad" }, { variant: "warn", text: "Neprodleně" }] },
  "tema-1-7": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["plug", "zap"], badges: [{ variant: "ok", text: "Odpojit před čištěním" }, { variant: "no", text: "Jiskření = riziko" }] },
  "tema-1-8": { bg: "bg-blue-50", border: "border-blue-100", ring: "ring-blue-100", iconColor: "text-blue-600", icons: ["scale", "building"], badges: [{ variant: "warn", text: "Náhrada škody" }, { variant: "ok", text: "Odpovědnost" }] },
  "tema-2-1": { bg: "bg-red-50", border: "border-red-100", ring: "ring-red-100", iconColor: "text-red-600", icons: ["cog", "shield-check"], badges: [{ variant: "ok", text: "Volný přístup" }, { variant: "no", text: "Neblokovat rozvody" }] },
  "tema-2-2": { bg: "bg-red-50", border: "border-red-100", ring: "ring-red-100", iconColor: "text-red-600", icons: ["door-open", "signpost"], badges: [{ variant: "ok", text: "Úniková cesta" }, { variant: "ok", text: "Značení" }] },
  "tema-2-3": { bg: "bg-red-50", border: "border-red-100", ring: "ring-red-100", iconColor: "text-red-600", icons: ["fire-extinguisher"], badges: [{ variant: "ok", text: "Viditelné umístění" }, { variant: "ok", text: "Roční kontrola" }] },
  "tema-2-4": { bg: "bg-red-50", border: "border-red-100", ring: "ring-red-100", iconColor: "text-red-600", icons: ["fire-extinguisher", "flame"], badges: [{ variant: "ok", text: "Správný typ" }, { variant: "no", text: "Špatná volba" }] },
  "tema-2-5": { bg: "bg-red-50", border: "border-red-100", ring: "ring-red-100", iconColor: "text-red-600", icons: ["graduation-cap", "alarm-smoke"], badges: [{ variant: "ok", text: "Školení PO" }, { variant: "warn", text: "Poplach" }] },
  "tema-2-6": { bg: "bg-red-50", border: "border-red-100", ring: "ring-red-100", iconColor: "text-red-600", icons: ["flame", "door-open"], badges: [{ variant: "ok", text: "Evakuace" }, { variant: "warn", text: "Hasit jen malý požár" }] },
  "tema-2-7": { bg: "bg-red-50", border: "border-red-100", ring: "ring-red-100", iconColor: "text-red-600", icons: ["phone", "flame"], badges: [{ variant: "ok", text: "Volat 150" }, { variant: "warn", text: "Tísňová linka" }] },
  "tema-3-1": { bg: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-100", iconColor: "text-amber-600", icons: ["car", "eye"], badges: [{ variant: "ok", text: "Pozornost" }, { variant: "no", text: "Bez telefonu" }] },
  "tema-3-2": { bg: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-100", iconColor: "text-amber-600", icons: ["car"], badges: [{ variant: "ok", text: "Předjíždění vlevo" }, { variant: "no", text: "Ne u přechodu" }] },
  "tema-3-3": { bg: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-100", iconColor: "text-amber-600", icons: ["badge", "car"], badges: [{ variant: "ok", text: "Policista má prioritu" }, { variant: "warn", text: "Poslušnost" }] },
  "tema-3-4": { bg: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-100", iconColor: "text-amber-600", icons: ["shield-check", "circle-gauge"], badges: [{ variant: "ok", text: "Pásy povinné" }, { variant: "ok", text: "Technický stav" }] },
  "tema-3-5": { bg: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-100", iconColor: "text-amber-600", icons: ["car", "triangle-alert"], badges: [{ variant: "ok", text: "Zastavit po nehodě" }, { variant: "warn", text: "Přizpůsobit rychlost" }] },
  "tema-3-6": { bg: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-100", iconColor: "text-amber-600", icons: ["footprints"], badges: [{ variant: "ok", text: "Chodník" }, { variant: "no", text: "Ne po silnici" }] },
  "tema-4-1": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["package", "scale"], badges: [{ variant: "warn", text: "Hmotnostní limity" }, { variant: "ok", text: "Zvláštní skupiny" }] },
  "tema-4-2": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["arrow-up-from-line", "package"], badges: [{ variant: "ok", text: "Kolonka v kolenou" }, { variant: "no", text: "Neohýbat záda" }] },
  "tema-4-3": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["eye", "triangle-alert"], badges: [{ variant: "ok", text: "Posoudit před zvednutím" }, { variant: "no", text: "Kluzký povrch" }] },
  "tema-4-4": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["hand", "shield-check"], badges: [{ variant: "ok", text: "Celá dlaň" }, { variant: "no", text: "Ostré hrany" }] },
  "tema-4-5": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["users-round", "package"], badges: [{ variant: "ok", text: "Týmové zvedání" }, { variant: "warn", text: "Kumulace zátěže" }] },
  "tema-4-6": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["forklift", "warehouse"], badges: [{ variant: "ok", text: "Mechanické pomůcky" }, { variant: "no", text: "Nestabilní stoh" }] },
  "tema-4-7": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["warehouse", "triangle-alert"], badges: [{ variant: "ok", text: "Bezpečné skladování" }, { variant: "no", text: "Hrany a propad" }] },
  "tema-4-8": { bg: "bg-teal-50", border: "border-teal-100", ring: "ring-teal-100", iconColor: "text-teal-600", icons: ["graduation-cap", "thermometer"], badges: [{ variant: "ok", text: "Školení" }, { variant: "warn", text: "Extrémní klima" }] },
  "tema-5-1": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["flag", "building"], badges: [{ variant: "ok", text: "EU GDPR" }, { variant: "ok", text: "Česká legislativa" }] },
  "tema-5-2": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["building", "cloud"], badges: [{ variant: "ok", text: "Správce" }, { variant: "ok", text: "Zpracovatel / DPO" }] },
  "tema-5-3": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["funnel", "lock"], badges: [{ variant: "ok", text: "Minimalizace" }, { variant: "ok", text: "Omezení uložení" }] },
  "tema-5-4": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["fingerprint", "file-text"], badges: [{ variant: "warn", text: "Citlivé údaje" }, { variant: "ok", text: "Právní základ" }] },
  "tema-5-5": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["user-check", "database"], badges: [{ variant: "ok", text: "Práva subjektu" }, { variant: "ok", text: "Odvolat souhlas" }] },
  "tema-5-6": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["database", "clock"], badges: [{ variant: "warn", text: "Incident" }, { variant: "ok", text: "Hlášení ÚOOÚ" }] },
  "tema-5-7": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["file-text", "shield-check"], badges: [{ variant: "ok", text: "Evidence zpracování" }, { variant: "warn", text: "DPIA" }] },
  "tema-5-8": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["euro", "scale"], badges: [{ variant: "warn", text: "Pokuty" }, { variant: "ok", text: "Soulad" }] },
  "tema-5-9": { bg: "bg-violet-50", border: "border-violet-100", ring: "ring-violet-100", iconColor: "text-violet-600", icons: ["globe", "lock"], badges: [{ variant: "ok", text: "Přenos mimo EU" }, { variant: "ok", text: "Anonymizace" }] },
  "tema-6-1": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["chair", "circle-check"], badges: [{ variant: "ok", text: "Opora zad" }, { variant: "ok", text: "Nohy na podlaze" }] },
  "tema-6-2": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["monitor", "eye"], badges: [{ variant: "ok", text: "Úroveň očí" }, { variant: "ok", text: "Délka paže" }] },
  "tema-6-3": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["keyboard", "hand"], badges: [{ variant: "ok", text: "Neutrální zápěstí" }, { variant: "no", text: "Bez ohybu" }] },
  "tema-6-4": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["laptop", "monitor"], badges: [{ variant: "no", text: "Ne na klíně" }, { variant: "ok", text: "Stojan + klávesnice" }] },
  "tema-6-5": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["activity", "alert-triangle"], badges: [{ variant: "warn", text: "RSI / karpál" }, { variant: "warn", text: "Krční páteř" }] },
  "tema-6-6": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["clock", "eye"], badges: [{ variant: "ok", text: "Pauzy" }, { variant: "ok", text: "20-20-20" }] },
  "tema-6-7": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["sun", "thermometer"], badges: [{ variant: "ok", text: "Osvětlení" }, { variant: "ok", text: "Klima" }] },
  "tema-6-8": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["arrow-up-down", "monitor"], badges: [{ variant: "ok", text: "Střídání polohy" }, { variant: "warn", text: "Sit-stand" }] },
  "tema-6-9": { bg: "bg-green-50", border: "border-green-100", ring: "ring-green-100", iconColor: "text-green-600", icons: ["layout-grid"], badges: [{ variant: "ok", text: "Zóny dosahu" }, { variant: "no", text: "Bez krčení" }] },
};

const COURSE_DEFAULT_THEME = {
  bozp: "tema-1-2",
  pozarni: "tema-2-3",
  ridici: "tema-3-1",
  bremena: "tema-4-2",
  gdpr: "tema-5-3",
  ergonomie: "tema-6-1",
};

export const PLACEHOLDER_TO_THEME = buildPlaceholderMap();

function buildPlaceholderMap() {
  const map = {};
  const entries = [
    ["bozp", "tema-1-1", ["q184", "q185"]],
    ["bozp", "tema-1-2", ["q94"]],
    ["bozp", "tema-1-3", ["q95", "q177"]],
    ["bozp", "tema-1-4", ["q96", "q96b"]],
    ["bozp", "tema-1-5", ["q149", "q150", "q175"]],
    ["bozp", "tema-1-6", ["q170", "q171"]],
    ["bozp", "tema-1-7", ["q182", "q183"]],
    ["bozp", "tema-1-8", ["q181"]],
    ["pozarni", "tema-2-1", ["q21", "q31"]],
    ["pozarni", "tema-2-2", ["q23"]],
    ["pozarni", "tema-2-3", ["q20", "q33", "q35"]],
    ["pozarni", "tema-2-4", ["q27", "q28", "q30"]],
    ["pozarni", "tema-2-5", ["q24", "q36"]],
    ["pozarni", "tema-2-6", ["q32", "q39", "q41"]],
    ["pozarni", "tema-2-7", ["q150"]],
    ["ridici", "tema-3-1", ["q-r1"]],
    ["ridici", "tema-3-2", ["q-r2", "q-r5", "q-r7"]],
    ["ridici", "tema-3-3", ["q-r6"]],
    ["ridici", "tema-3-4", ["q-r4", "q-r8"]],
    ["ridici", "tema-3-5", ["q-r3", "q-r9"]],
    ["ridici", "tema-3-6", ["q-r10"]],
    ["bremena", "tema-4-1", ["off-b1", "off-b2", "off-b11", "off-b25", "off-b28"]],
    ["bremena", "tema-4-2", ["off-b3", "off-b4", "off-b5", "off-b6", "off-b7", "off-b9", "off-b10", "off-b26"]],
    ["bremena", "tema-4-3", ["off-b8", "off-b18", "off-b21"]],
    ["bremena", "tema-4-4", ["off-b13", "off-b17", "off-b19"]],
    ["bremena", "tema-4-5", ["off-b14", "off-b15", "off-b16"]],
    ["bremena", "tema-4-6", ["off-b12", "off-b23", "off-b27", "off-b29"]],
    ["bremena", "tema-4-7", ["off-b20", "off-b24"]],
    ["bremena", "tema-4-8", ["off-b22", "off-b30"]],
    ["gdpr", "tema-5-1", ["off-g1", "off-g2"]],
    ["gdpr", "tema-5-2", ["off-g3", "off-g12", "off-g20", "off-g21", "off-g29"]],
    ["gdpr", "tema-5-3", ["off-g7", "off-g18", "off-g28"]],
    ["gdpr", "tema-5-4", ["off-g4", "off-g5", "off-g6"]],
    ["gdpr", "tema-5-5", ["off-g8", "off-g9", "off-g10", "off-g24", "off-g26"]],
    ["gdpr", "tema-5-6", ["off-g11", "off-g13", "off-g14"]],
    ["gdpr", "tema-5-7", ["off-g15", "off-g19", "off-g23"]],
    ["gdpr", "tema-5-8", ["off-g16", "off-g17", "off-g25", "off-g27"]],
    ["gdpr", "tema-5-9", ["off-g22", "off-g30"]],
    ["ergonomie", "tema-6-1", ["off-e1", "off-e8", "off-e11", "off-e16", "off-e19", "off-e22", "off-e28"]],
    ["ergonomie", "tema-6-2", ["off-e2", "off-e3", "off-e9", "off-e20", "off-e29"]],
    ["ergonomie", "tema-6-3", ["off-e5", "off-e6", "off-e10", "off-e25", "off-e27"]],
    ["ergonomie", "tema-6-4", ["off-e13", "off-e14"]],
    ["ergonomie", "tema-6-5", ["off-e4", "off-e12", "off-e15", "off-e26"]],
    ["ergonomie", "tema-6-6", ["off-e7", "off-e18"]],
    ["ergonomie", "tema-6-7", ["off-e17", "off-e23"]],
    ["ergonomie", "tema-6-8", ["off-e24", "off-e30"]],
    ["ergonomie", "tema-6-9", ["off-e21"]],
  ];
  for (const [course, themeId, questionIds] of entries) {
    for (const questionId of questionIds) {
      map[`${course}:${questionId}`] = themeId;
    }
  }
  return map;
}

function lucideIcon(name, className) {
  const body = ICONS[name] ?? ICONS.shield;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true">${body}</svg>`;
}

function renderBadge(badge) {
  const iconPath = BADGE_ICONS[badge.variant] ?? BADGE_ICONS.ok;
  const style = BADGE_STYLES[badge.variant] ?? BADGE_STYLES.ok;
  return `<span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm ${style}">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 shrink-0" aria-hidden="true">${iconPath}</svg>
    ${badge.text}
  </span>`;
}

export function renderThemeWidget(themeId) {
  const config = THEME_WIDGETS[themeId] ?? THEME_WIDGETS["tema-1-2"];

  if (config.image) {
    return `<div class="theme-widget flex h-full min-h-[220px] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm" role="img" aria-label="${config.imageAlt ?? `Vizuální téma ${themeId}`}">
      <img src="${config.image}" alt="${config.imageAlt ?? ""}" class="h-full max-h-[280px] w-full object-contain" loading="lazy" decoding="async" />
    </div>`;
  }

  const [primaryIcon, secondaryIcon] = config.icons;
  const primary = lucideIcon(primaryIcon, `h-14 w-14 ${config.iconColor}`);
  const secondary = secondaryIcon
    ? `<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-sm ring-1 ${config.ring}">${lucideIcon(secondaryIcon, `h-7 w-7 ${config.iconColor}`)}</div>`
    : "";
  const badges = config.badges.map(renderBadge).join("");
  return `<div class="theme-widget relative flex h-full min-h-[220px] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-2xl border p-6 shadow-sm ${config.bg} ${config.border}" role="img" aria-label="Vizuální téma ${themeId}">
    <div class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/50"></div>
    <div class="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-white/30"></div>
    <div class="relative flex items-center justify-center gap-3">
      <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ${config.ring}">${primary}</div>
      ${secondary}
    </div>
    <div class="relative mt-5 flex max-w-[240px] flex-wrap justify-center gap-2">${badges}</div>
  </div>`;
}

export function resolveThemeId(placeholder, courseSlug) {
  if (placeholder && PLACEHOLDER_TO_THEME[placeholder]) {
    return PLACEHOLDER_TO_THEME[placeholder];
  }
  if (courseSlug && COURSE_DEFAULT_THEME[courseSlug]) {
    return COURSE_DEFAULT_THEME[courseSlug];
  }
  return "tema-1-2";
}

function questionIdFromPlaceholder(placeholder) {
  if (!placeholder || !placeholder.includes(":")) {
    return null;
  }
  return placeholder.slice(placeholder.indexOf(":") + 1);
}

function renderQuestionImage(questionId) {
  const src = `${QUESTION_IMAGE_BASE}/${encodeURIComponent(questionId)}.png`;
  return `<div class="theme-widget flex h-full min-h-[220px] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm" role="img" aria-label="Ilustrace k lekci">
      <img src="${src}" alt="" class="h-full max-h-[280px] w-full object-contain" loading="lazy" decoding="async" />
    </div>`;
}

/** Prázdný prostor pro otázky bez ilustrace (záměrně bez záložního widgetu). */
function renderEmptyQuestionImage() {
  return `<div class="flex h-full min-h-[220px] w-full max-w-md items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40" aria-hidden="true"></div>`;
}

export function getThemeWidgetForSlide(placeholder, courseSlug) {
  const questionId = questionIdFromPlaceholder(placeholder);
  if (questionId && QUESTION_IMAGE_IDS.has(questionId)) {
    return renderQuestionImage(questionId);
  }
  if (questionId) {
    return renderEmptyQuestionImage();
  }
  return renderThemeWidget(resolveThemeId(placeholder, courseSlug));
}
