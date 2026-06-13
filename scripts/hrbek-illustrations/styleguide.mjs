/**
 * HRBEK Illustration Styleguide – Flat Design 2.0
 * viewBox 400×300, bez textu v grafice, jednotná paleta.
 */

export const THEME = {
  bg: { from: "#F4F7FC", to: "#E8EEF8" },
  card: "#FFFFFF",
  ink: "#1A2332",
  inkSoft: "#5A6B7D",
  blue: { from: "#4A7FD4", to: "#2E5FA8", light: "#D6E6FA" },
  green: { from: "#3CB878", to: "#1F9D55", light: "#DDF5E8" },
  red: { from: "#E85D4C", to: "#C62828", light: "#FDE8E6" },
  orange: { from: "#F5A623", to: "#E65100", light: "#FFF3DC" },
  skin: "#F2C9A0",
  skinShadow: "#D9A67E",
  hair: "#3D4F5F",
  metal: { from: "#B8C4D0", to: "#7A8B9A" },
};

export function wrapIllustration(body, ariaLabel = "Ilustrace školení") {
  const safe = ariaLabel.replace(/"/g, "'");
  return `<svg viewBox="0 0 400 300" class="h-full w-full max-h-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${safe}">${defs()}${body}</svg>`;
}

export function defs() {
  return `
  <defs>
    <linearGradient id="hrbek-bg" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${THEME.bg.from}"/>
      <stop offset="100%" stop-color="${THEME.bg.to}"/>
    </linearGradient>
    <linearGradient id="hrbek-blue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${THEME.blue.from}"/><stop offset="100%" stop-color="${THEME.blue.to}"/>
    </linearGradient>
    <linearGradient id="hrbek-green" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${THEME.green.from}"/><stop offset="100%" stop-color="${THEME.green.to}"/>
    </linearGradient>
    <linearGradient id="hrbek-red" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${THEME.red.from}"/><stop offset="100%" stop-color="${THEME.red.to}"/>
    </linearGradient>
    <linearGradient id="hrbek-orange" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${THEME.orange.from}"/><stop offset="100%" stop-color="${THEME.orange.to}"/>
    </linearGradient>
    <linearGradient id="hrbek-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${THEME.metal.from}"/><stop offset="100%" stop-color="${THEME.metal.to}"/>
    </linearGradient>
    <filter id="hrbek-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1A2332" flood-opacity="0.12"/>
    </filter>
    <filter id="hrbek-shadow-sm" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1A2332" flood-opacity="0.1"/>
    </filter>
  </defs>`;
}

export function sceneFrame() {
  return `
    <rect width="400" height="300" fill="url(#hrbek-bg)"/>
    <rect x="24" y="20" width="352" height="260" rx="20" fill="${THEME.card}" filter="url(#hrbek-shadow)"/>
  `;
}

/** Zelený schvalovací badge – správný postup */
export function badgeOk(x, y, r = 22) {
  return `
    <g filter="url(#hrbek-shadow-sm)">
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#hrbek-green)"/>
      <path d="M${x - r * 0.35} ${y} L${x - r * 0.05} ${y + r * 0.32} L${x + r * 0.42} ${y - r * 0.28}"
        stroke="#fff" stroke-width="${Math.max(3, r * 0.14)}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

/** Červený varovný badge – zákaz / riziko */
export function badgeNo(x, y, r = 22) {
  return `
    <g filter="url(#hrbek-shadow-sm)">
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#hrbek-red)"/>
      <path d="M${x - r * 0.28} ${y - r * 0.28} L${x + r * 0.28} ${y + r * 0.28} M${x + r * 0.28} ${y - r * 0.28} L${x - r * 0.28} ${y + r * 0.28}"
        stroke="#fff" stroke-width="${Math.max(3, r * 0.14)}" stroke-linecap="round"/>
    </g>`;
}

/** Oranžový výstražný badge – blesk / nebezpečí */
export function badgeWarn(x, y, r = 22) {
  return `
    <g filter="url(#hrbek-shadow-sm)">
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#hrbek-orange)"/>
      <path d="M${x + 2} ${y - r * 0.42} L${x - r * 0.22} ${y + r * 0.08} H${x + r * 0.05} L${x - 4} ${y + r * 0.42} L${x + r * 0.28} ${y - r * 0.05} H${x - r * 0.02} Z"
        fill="#fff"/>
    </g>`;
}

/** Postava – proporce, klouby, volitelná pozice zad */
export function person({
  cx = 200,
  cy = 200,
  scale = 1,
  straightBack = true,
  helmet = false,
  armUp = false,
  facing = 1,
}) {
  const s = scale;
  const dir = facing;
  const headY = cy - 58 * s;
  const shoulderY = cy - 38 * s;
  const hipY = cy - 4 * s;
  const spinePath = straightBack
    ? `M${cx} ${headY + 14 * s} V${hipY}`
    : `M${cx} ${headY + 14 * s} Q${cx + 18 * s * dir} ${shoulderY + 10 * s} ${cx} ${hipY}`;

  return `
    <g filter="url(#hrbek-shadow-sm)">
      ${helmet ? `<ellipse cx="${cx}" cy="${headY - 2 * s}" rx="${16 * s}" ry="${10 * s}" fill="url(#hrbek-orange)"/><rect x="${cx - 14 * s}" y="${headY - 8 * s}" width="${28 * s}" height="${8 * s}" rx="${3 * s}" fill="url(#hrbek-orange)"/>` : ""}
      <circle cx="${cx}" cy="${headY}" r="${13 * s}" fill="${THEME.skin}"/>
      <path d="M${cx - 10 * s} ${headY - 4 * s} Q${cx} ${headY - 14 * s} ${cx + 10 * s} ${headY - 4 * s}" fill="${THEME.hair}"/>
      <path d="${spinePath}" stroke="${THEME.ink}" stroke-width="${5 * s}" stroke-linecap="round"/>
      <path d="M${cx} ${shoulderY} L${cx - 22 * s * dir} ${cy - 18 * s}" stroke="${THEME.ink}" stroke-width="${4.5 * s}" stroke-linecap="round"/>
      <path d="M${cx} ${shoulderY} L${cx + (armUp ? -8 : 20) * s * dir} ${cy - (armUp ? 42 : 18) * s}" stroke="${THEME.ink}" stroke-width="${4.5 * s}" stroke-linecap="round"/>
      <circle cx="${cx - 22 * s * dir}" cy="${cy - 18 * s}" r="${4 * s}" fill="${THEME.skin}"/>
      <circle cx="${cx + (armUp ? -8 : 20) * s * dir}" cy="${cy - (armUp ? 42 : 18) * s}" r="${4 * s}" fill="${THEME.skin}"/>
      <path d="M${cx} ${hipY} L${cx - 14 * s} ${cy + 32 * s}" stroke="${THEME.ink}" stroke-width="${4.5 * s}" stroke-linecap="round"/>
      <path d="M${cx} ${hipY} L${cx + 14 * s} ${cy + 32 * s}" stroke="${THEME.ink}" stroke-width="${4.5 * s}" stroke-linecap="round"/>
      <ellipse cx="${cx - 14 * s}" cy="${cy + 34 * s}" rx="${10 * s}" ry="${4 * s}" fill="${THEME.inkSoft}"/>
      <ellipse cx="${cx + 14 * s}" cy="${cy + 34 * s}" rx="${10 * s}" ry="${4 * s}" fill="${THEME.inkSoft}"/>
      <rect x="${cx - 16 * s}" y="${shoulderY - 2 * s}" width="${32 * s}" height="${38 * s}" rx="${8 * s}" fill="url(#hrbek-blue)" opacity="0.9"/>
    </g>`;
}

export function shield(cx, cy, scale = 1) {
  const s = scale;
  return `
    <g filter="url(#hrbek-shadow)">
      <path d="M${cx} ${cy - 40 * s} L${cx + 34 * s} ${cy - 24 * s} V${cy + 18 * s} C${cx + 34 * s} ${cy + 44 * s} ${cx + 16 * s} ${cy + 56 * s} ${cx} ${cy + 62 * s} C${cx - 16 * s} ${cy + 56 * s} ${cx - 34 * s} ${cy + 44 * s} ${cx - 34 * s} ${cy + 18 * s} V${cy - 24 * s} Z"
        fill="url(#hrbek-green)"/>
      <path d="M${cx} ${cy - 28 * s} L${cx + 22 * s} ${cy - 16 * s} V${cy + 14 * s} C${cx + 22 * s} ${cy + 32 * s} ${cx + 10 * s} ${cy + 40 * s} ${cx} ${cy + 44 * s} C${cx - 10 * s} ${cy + 40 * s} ${cx - 22 * s} ${cy + 32 * s} ${cx - 22 * s} ${cy + 14 * s} V${cy - 16 * s} Z"
        fill="#fff" opacity="0.22"/>
    </g>`;
}
