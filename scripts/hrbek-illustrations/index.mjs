/**
 * Prémiové ilustrace podle ID otázky.
 * Postupně doplňovat další kurzy (pozarni, ridici, …).
 */
import { BOZP_PREMIUM } from "./bozp.mjs";

export const PREMIUM_ILLUSTRATIONS = {
  ...BOZP_PREMIUM,
};

export function hasPremiumIllustration(questionId) {
  return Object.hasOwn(PREMIUM_ILLUSTRATIONS, questionId);
}

export function getPremiumIllustration(questionId) {
  return PREMIUM_ILLUSTRATIONS[questionId];
}
