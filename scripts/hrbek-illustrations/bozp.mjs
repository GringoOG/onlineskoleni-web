/**
 * Prémiové BOZP ilustrace – 15 otázek závěrečného testu.
 */
import {
  wrapIllustration,
  sceneFrame,
  badgeOk,
  badgeNo,
  badgeWarn,
  person,
  shield,
  THEME,
} from "./styleguide.mjs";

function coin(cx, cy, r = 18) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#hrbek-orange)" filter="url(#hrbek-shadow-sm)"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 9}" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.35"/>`;
}

/** q184 – Odpovědnost zaměstnavatele i zaměstnance */
function q184() {
  return wrapIllustration(
    `${sceneFrame()}
    ${shield(130, 118, 1.1)}
    ${shield(270, 118, 1.1)}
    ${person({ cx: 130, cy: 210, scale: 0.85, helmet: true, facing: 1 })}
    ${person({ cx: 270, cy: 210, scale: 0.85, facing: -1 })}
    <path d="M168 130 H232" stroke="${THEME.blue.from}" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>
    <circle cx="200" cy="130" r="14" fill="url(#hrbek-blue)" filter="url(#hrbek-shadow-sm)"/>
    <path d="M194 130 H206 M200 124 V136" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    ${badgeOk(348, 48)}`,
    "Společná odpovědnost za bezpečnost práce"
  );
}

/** q94 – Školení BOZP včetně ověření znalostí */
function q94() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="52" y="58" width="180" height="120" rx="12" fill="url(#hrbek-blue)"/>
      <rect x="62" y="68" width="160" height="88" rx="8" fill="#fff" opacity="0.95"/>
      <rect x="78" y="82" width="90" height="8" rx="4" fill="${THEME.blue.light}"/>
      <rect x="78" y="98" width="120" height="6" rx="3" fill="${THEME.blue.light}" opacity="0.7"/>
      <rect x="78" y="112" width="100" height="6" rx="3" fill="${THEME.blue.light}" opacity="0.5"/>
      <circle cx="118" cy="132" r="16" fill="url(#hrbek-green)"/>
      <path d="M110 132 L116 138 L128 124" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    ${person({ cx: 300, cy: 215, scale: 0.9, facing: -1 })}
    <ellipse cx="300" cy="148" rx="28" ry="8" fill="${THEME.inkSoft}" opacity="0.15"/>
    <rect x="268" y="88" width="64" height="44" rx="6" fill="${THEME.card}" stroke="${THEME.blue.from}" stroke-width="2" filter="url(#hrbek-shadow-sm)"/>
    <rect x="276" y="98" width="48" height="6" rx="3" fill="${THEME.blue.light}"/>
    <rect x="276" y="110" width="36" height="6" rx="3" fill="${THEME.blue.light}" opacity="0.6"/>
    ${badgeOk(348, 48)}
    ${badgeNo(52, 48, 18)}`,
    "Povinné školení BOZP s ověřením znalostí"
  );
}

/** q95 – Postupy, prostředky a OOPP */
function q95() {
  return wrapIllustration(
    `${sceneFrame()}
    ${person({ cx: 200, cy: 218, scale: 1, helmet: true, straightBack: true })}
    <g filter="url(#hrbek-shadow-sm)">
      <rect x="88" y="72" width="72" height="88" rx="10" fill="${THEME.card}" stroke="${THEME.blue.from}" stroke-width="2"/>
      <path d="M104 96 L116 108 L140 84" stroke="url(#hrbek-green)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M104 118 L116 130 L140 106" stroke="url(#hrbek-green)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M104 140 L116 152 L140 128" stroke="url(#hrbek-green)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <g transform="translate(280,88)">
      <ellipse cx="28" cy="36" rx="22" ry="26" fill="url(#hrbek-orange)" filter="url(#hrbek-shadow-sm)"/>
      <rect x="10" y="8" width="36" height="14" rx="5" fill="url(#hrbek-orange)"/>
      <rect x="4" y="52" width="48" height="10" rx="4" fill="${THEME.inkSoft}" opacity="0.3"/>
    </g>
    <g transform="translate(292,168)">
      <path d="M8 36 C8 20 24 8 40 8 C56 8 72 20 72 36 V52 H8 Z" fill="url(#hrbek-blue)" filter="url(#hrbek-shadow-sm)"/>
      <path d="M16 28 C24 18 56 18 64 28" stroke="#fff" stroke-width="2" opacity="0.5"/>
    </g>
    ${badgeOk(348, 48)}
    ${badgeNo(52, 248, 16)}`,
    "Dodržování postupů a používání OOPP"
  );
}

/** q96 – Zákaz alkoholu a návykových látek */
function q96() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="148" y="70" width="44" height="110" rx="10" fill="url(#hrbek-blue)" opacity="0.35"/>
      <rect x="156" y="58" width="28" height="18" rx="6" fill="url(#hrbek-blue)" opacity="0.5"/>
      <ellipse cx="170" cy="178" rx="38" ry="10" fill="${THEME.inkSoft}" opacity="0.12"/>
      <path d="M118 88 L222 192" stroke="url(#hrbek-red)" stroke-width="10" stroke-linecap="round"/>
    </g>
    <circle cx="170" cy="130" r="48" fill="none" stroke="url(#hrbek-red)" stroke-width="4" opacity="0.2"/>
    ${badgeNo(348, 48)}
    ${badgeOk(52, 48)}`,
    "Zákaz alkoholu a návykových látek na pracovišti"
  );
}

/** q96b – Test na alkohol na pokyn vedoucího */
function q96b() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="118" y="108" width="164" height="72" rx="14" fill="url(#hrbek-metal)"/>
      <rect x="130" y="120" width="56" height="36" rx="6" fill="#1A2332" opacity="0.85"/>
      <rect x="196" y="126" width="72" height="8" rx="4" fill="url(#hrbek-green)" opacity="0.8"/>
      <rect x="196" y="142" width="48" height="6" rx="3" fill="${THEME.green.light}"/>
      <rect x="268" y="132" width="8" height="24" rx="3" fill="${THEME.inkSoft}"/>
      <ellipse cx="276" cy="128" rx="10" ry="6" fill="url(#hrbek-blue)"/>
    </g>
    ${person({ cx: 300, cy: 220, scale: 0.75, facing: -1, armUp: true })}
    ${person({ cx: 88, cy: 220, scale: 0.8, helmet: true, facing: 1 })}
    ${badgeOk(348, 48)}`,
    "Podrobení se testu na alkohol"
  );
}

/** q149 – Vstupní prohlídka hrazená zaměstnavatelem */
function q149() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="72" y="78" width="100" height="110" rx="10" fill="url(#hrbek-blue)"/>
      <rect x="86" y="62" width="72" height="24" rx="4" fill="url(#hrbek-blue)"/>
      <rect x="94" y="100" width="24" height="24" rx="4" fill="#fff" opacity="0.35"/>
      <rect x="126" y="100" width="24" height="24" rx="4" fill="#fff" opacity="0.35"/>
      <rect x="94" y="132" width="56" height="36" rx="4" fill="#fff" opacity="0.25"/>
    </g>
    <g filter="url(#hrbek-shadow)">
      <rect x="210" y="88" width="120" height="130" rx="12" fill="${THEME.card}" stroke="${THEME.green.from}" stroke-width="2"/>
      <circle cx="270" cy="118" r="22" fill="${THEME.green.light}"/>
      <path d="M262 118 H278 M270 110 V126" stroke="url(#hrbek-green)" stroke-width="4" stroke-linecap="round"/>
      <rect x="228" y="148" width="84" height="8" rx="4" fill="${THEME.green.light}"/>
      <rect x="228" y="164" width="64" height="8" rx="4" fill="${THEME.green.light}" opacity="0.6"/>
      ${coin(270, 192)}
    </g>
    <path d="M172 130 H210" stroke="${THEME.green.from}" stroke-width="3" stroke-dasharray="5 4"/>
    ${badgeOk(348, 48)}`,
    "Zaměstnavatel hradí vstupní lékařskou prohlídku"
  );
}

/** q150 – Sdělení údajů lékaři */
function q150() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="200" y="76" width="140" height="150" rx="12" fill="${THEME.card}" stroke="${THEME.blue.from}" stroke-width="2"/>
      <circle cx="270" cy="108" r="20" fill="${THEME.skin}"/>
      <path d="M258 104 Q270 92 282 104" fill="${THEME.hair}"/>
      <rect x="248" y="128" width="44" height="50" rx="10" fill="url(#hrbek-green)"/>
      <path d="M262 118 H278 M270 110 V126" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      <rect x="220" y="186" width="100" height="8" rx="4" fill="${THEME.blue.light}"/>
      <rect x="220" y="200" width="72" height="8" rx="4" fill="${THEME.blue.light}" opacity="0.6"/>
    </g>
    ${person({ cx: 110, cy: 220, scale: 0.9, facing: 1, armUp: true })}
    <rect x="130" y="118" width="56" height="72" rx="8" fill="${THEME.card}" stroke="${THEME.inkSoft}" stroke-width="2" filter="url(#hrbek-shadow-sm)"/>
    <circle cx="158" cy="142" r="10" fill="${THEME.blue.light}"/>
    <rect x="142" y="158" width="32" height="5" rx="2" fill="${THEME.blue.light}"/>
    <rect x="142" y="168" width="24" height="5" rx="2" fill="${THEME.blue.light}" opacity="0.6"/>
    ${badgeOk(348, 48)}`,
    "Sdělení údajů poskytovateli pracovnělékařských služeb"
  );
}

/** q170 – Hlášení pracovního úrazu */
function q170() {
  return wrapIllustration(
    `${sceneFrame()}
    ${person({ cx: 120, cy: 218, scale: 0.9, straightBack: false, armUp: true })}
    <g filter="url(#hrbek-shadow-sm)">
      <ellipse cx="108" cy="178" rx="14" ry="8" fill="${THEME.red.light}"/>
      <path d="M100 178 H116 M108 170 V186" stroke="url(#hrbek-red)" stroke-width="3" stroke-linecap="round"/>
    </g>
    ${person({ cx: 290, cy: 218, scale: 0.95, helmet: true, facing: -1 })}
    <rect x="248" y="100" width="84" height="56" rx="8" fill="${THEME.card}" stroke="${THEME.blue.from}" stroke-width="2" filter="url(#hrbek-shadow-sm)"/>
    <rect x="260" y="114" width="60" height="6" rx="3" fill="${THEME.red.light}"/>
    <rect x="260" y="126" width="44" height="6" rx="3" fill="${THEME.blue.light}"/>
    <path d="M168 150 L248 128" stroke="${THEME.orange.from}" stroke-width="3" stroke-dasharray="5 4"/>
    ${badgeOk(348, 48)}
    ${badgeWarn(52, 48, 18)}`,
    "Bezodkladné hlášení pracovního úrazu"
  );
}

/** q171 – Hlášení závad na pracovišti */
function q171() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <path d="M200 52 L268 188 H132 Z" fill="#fff" stroke="url(#hrbek-orange)" stroke-width="3"/>
      <rect x="192" y="108" width="16" height="36" rx="4" fill="url(#hrbek-orange)"/>
      <circle cx="200" cy="156" r="8" fill="url(#hrbek-orange)"/>
    </g>
    <rect x="72" y="168" width="96" height="12" rx="4" fill="${THEME.inkSoft}" opacity="0.2"/>
    <path d="M88 168 V148" stroke="${THEME.red.from}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="88" cy="142" r="6" fill="url(#hrbek-red)"/>
    ${person({ cx: 300, cy: 220, scale: 0.9, helmet: true, facing: -1, armUp: true })}
    <path d="M120 142 L260 118" stroke="${THEME.blue.from}" stroke-width="2.5" stroke-dasharray="4 4"/>
    ${badgeOk(348, 48)}`,
    "Hlášení závad ohrožujících bezpečnost"
  );
}

/** q175 – Pracovnělékařské služby */
function q175() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="140" y="72" width="120" height="140" rx="14" fill="${THEME.card}" stroke="${THEME.green.from}" stroke-width="2"/>
      <circle cx="200" cy="118" r="32" fill="${THEME.green.light}"/>
      <path d="M184 118 H216 M200 102 V134" stroke="url(#hrbek-green)" stroke-width="6" stroke-linecap="round"/>
      <rect x="164" y="162" width="72" height="10" rx="5" fill="${THEME.green.light}"/>
      <rect x="164" y="180" width="56" height="8" rx="4" fill="${THEME.green.light}" opacity="0.6"/>
    </g>
    ${person({ cx: 90, cy: 220, scale: 0.85, facing: 1 })}
    ${person({ cx: 310, cy: 220, scale: 0.85, facing: -1 })}
    ${badgeOk(348, 48)}`,
    "Podrobení se pracovnělékařským službám"
  );
}

/** q177 – Ochranné rukavice */
function q177() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <path d="M148 148 C148 108 168 88 188 88 C204 88 216 100 216 116 V148" fill="url(#hrbek-blue)" stroke="${THEME.blue.to}" stroke-width="2"/>
      <path d="M216 116 C216 96 232 82 252 82 C268 82 280 96 280 116 V148" fill="url(#hrbek-blue)" stroke="${THEME.blue.to}" stroke-width="2"/>
      <path d="M156 148 V172 M188 148 V180 M220 148 V172 M252 148 V180" stroke="${THEME.blue.to}" stroke-width="5" stroke-linecap="round"/>
      <path d="M160 124 L176 136 L192 120" stroke="#fff" stroke-width="2" opacity="0.4" stroke-linecap="round"/>
    </g>
    <g opacity="0.45" transform="translate(72,168)">
      <ellipse cx="20" cy="24" rx="18" ry="10" fill="${THEME.inkSoft}"/>
      <rect x="8" y="8" width="24" height="14" rx="4" fill="${THEME.inkSoft}"/>
    </g>
    ${badgeOk(348, 48)}
    ${badgeNo(52, 48, 18)}
    ${badgeNo(52, 248, 16)}`,
    "Rukavice proti mechanickému poškození"
  );
}

/** q181 – Náhrada škody zaměstnavateli */
function q181() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="100" y="88" width="200" height="120" rx="14" fill="${THEME.card}" stroke="${THEME.blue.from}" stroke-width="2"/>
      <rect x="120" y="108" width="160" height="12" rx="4" fill="${THEME.blue.light}"/>
      <rect x="120" y="128" width="120" height="8" rx="4" fill="${THEME.blue.light}" opacity="0.6"/>
      ${coin(200, 168, 22)}
      <path d="M168 168 H184" stroke="${THEME.orange.from}" stroke-width="3" stroke-linecap="round"/>
    </g>
    ${person({ cx: 320, cy: 220, scale: 0.8, facing: -1 })}
    ${badgeOk(348, 48)}
    ${badgeNo(52, 48, 18)}`,
    "Náhrada škody při zaviněném porušení povinností"
  );
}

/** q182 – Čištění spotřebiče vypnutého */
function q182() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="148" y="96" width="104" height="72" rx="10" fill="url(#hrbek-metal)"/>
      <rect x="160" y="108" width="80" height="48" rx="6" fill="#1A2332" opacity="0.75"/>
      <circle cx="200" cy="132" r="12" fill="${THEME.blue.light}" opacity="0.5"/>
      <rect x="252" y="148" width="36" height="20" rx="4" fill="${THEME.inkSoft}"/>
      <path d="M252 158 H220" stroke="${THEME.ink}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="214" cy="158" r="8" fill="${THEME.inkSoft}"/>
    </g>
    <g transform="translate(108,140)">
      <ellipse cx="20" cy="28" rx="18" ry="22" fill="url(#hrbek-blue)" opacity="0.5"/>
      <path d="M8 16 C16 8 32 8 40 16" stroke="#fff" stroke-width="2" opacity="0.5"/>
    </g>
    ${badgeOk(348, 48)}
    ${badgeNo(348, 248, 16)}`,
    "Čištění spotřebiče pouze vypnutého"
  );
}

/** q183 – Vadný spotřebič odpojit ze sítě */
function q183() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <rect x="148" y="96" width="104" height="72" rx="10" fill="url(#hrbek-metal)"/>
      <rect x="160" y="108" width="80" height="48" rx="6" fill="#1A2332" opacity="0.85"/>
      <path d="M176 120 L184 136 L192 116 L200 132 L208 118" stroke="#F5A623" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M252 148 H216" stroke="${THEME.ink}" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 4"/>
      <circle cx="208" cy="148" r="8" fill="${THEME.inkSoft}"/>
    </g>
    ${person({ cx: 300, cy: 220, scale: 0.85, facing: -1, armUp: true })}
    ${badgeWarn(72, 56, 20)}
    ${badgeOk(348, 48)}`,
    "Okamžité odpojení závadného spotřebiče"
  );
}

/** q185 – Nahlášení nebezpečné situace */
function q185() {
  return wrapIllustration(
    `${sceneFrame()}
    <g filter="url(#hrbek-shadow)">
      <path d="M200 60 L270 200 H130 Z" fill="#fff" stroke="url(#hrbek-red)" stroke-width="3"/>
      <rect x="192" y="118" width="16" height="40" rx="4" fill="url(#hrbek-red)"/>
      <circle cx="200" cy="168" r="9" fill="url(#hrbek-red)"/>
    </g>
    ${person({ cx: 110, cy: 220, scale: 0.85, facing: 1, armUp: true })}
    ${person({ cx: 300, cy: 220, scale: 0.9, helmet: true, facing: -1 })}
    <path d="M140 140 L260 120" stroke="url(#hrbek-green)" stroke-width="3" stroke-dasharray="5 4"/>
    ${badgeOk(348, 48)}
    ${badgeNo(52, 248, 16)}`,
    "Nahlášení nebezpečné situace nadřízenému"
  );
}

const SLUG = "bozp";

export const BOZP_PREMIUM = {
  [`${SLUG}:q184`]: q184(),
  [`${SLUG}:q94`]: q94(),
  [`${SLUG}:q95`]: q95(),
  [`${SLUG}:q96`]: q96(),
  [`${SLUG}:q96b`]: q96b(),
  [`${SLUG}:q149`]: q149(),
  [`${SLUG}:q150`]: q150(),
  [`${SLUG}:q170`]: q170(),
  [`${SLUG}:q171`]: q171(),
  [`${SLUG}:q175`]: q175(),
  [`${SLUG}:q177`]: q177(),
  [`${SLUG}:q181`]: q181(),
  [`${SLUG}:q182`]: q182(),
  [`${SLUG}:q183`]: q183(),
  [`${SLUG}:q185`]: q185(),
};
