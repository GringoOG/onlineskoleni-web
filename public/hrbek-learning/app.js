import { getThemeWidgetForSlide } from "./theme-widgets.js";

const STORAGE_KEY = "hrbek-learning-state";
const APP_BASE = "/hrbek-learning/";
const DATA_URL = `${APP_BASE}data.json`;

const COLOR_CLASSES = {
  blue: "from-blue-500 to-blue-700",
  red: "from-red-500 to-red-700",
  amber: "from-amber-500 to-amber-700",
  teal: "from-teal-500 to-teal-700",
  violet: "from-violet-500 to-violet-700",
  green: "from-emerald-500 to-emerald-700",
  slate: "from-slate-500 to-slate-700",
};

/** @typedef {{ id: string, text: string, options: string[], correctIndex: number }} Question */
/** @typedef {{ id: string, heading: string, paragraphs: string[], checkQuestions: Question[] }} Slide */
/** @typedef {{ slug: string, title: string, shortTitle: string, color: string, priceCzk: number, slides: Slide[], finalTest: object }} Category */

let appData = null;
let demoMode = false;

/** @type {{ view: string, categorySlug: string | null, pendingPaymentSlug: string | null, quizAnswers: Record<string, number>, finalAnswers: Record<string, number>, slideFlipped: boolean, quizError: string | null, finalError: string | null, finalResult: object | null }} */
let ui = {
  view: "catalog",
  categorySlug: null,
  pendingPaymentSlug: null,
  quizAnswers: {},
  finalAnswers: {},
  slideFlipped: false,
  slideQuizPassed: false,
  quizError: null,
  finalError: null,
  finalResult: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { sessionId: null, paidCategories: [], progress: {} };
    }
    return JSON.parse(raw);
  } catch {
    return { sessionId: null, paidCategories: [], progress: {} };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isCategoryUnlocked(state, slug) {
  return demoMode || state.demoMode || state.paidCategories.includes(slug);
}

function applyDemoAccess() {
  const state = loadState();
  state.demoMode = true;
  if (!state.sessionId) {
    state.sessionId = `DEMO-${Date.now()}`;
  }
  if (appData) {
    for (const category of appData.categories) {
      if (!state.paidCategories.includes(category.slug)) {
        state.paidCategories.push(category.slug);
      }
      ensureProgress(state, category.slug);
    }
  }
  saveState(state);
}

function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1") {
    demoMode = true;
    applyDemoAccess();
  } else {
    const state = loadState();
    demoMode = Boolean(state.demoMode);
  }

  const courseSlug = params.get("course");
  if (courseSlug && getCategory(courseSlug) && isCategoryUnlocked(loadState(), courseSlug)) {
    ui.view = "learn";
    ui.categorySlug = courseSlug;
  }
}

function getCategory(slug) {
  return appData.categories.find((category) => category.slug === slug) ?? null;
}

function ensureProgress(state, slug) {
  if (!state.progress[slug]) {
    state.progress[slug] = {
      slideIndex: 0,
      completedSlides: [],
      finalTestUnlocked: false,
      finalTestPassed: false,
    };
  }
  return state.progress[slug];
}

function generateSessionId() {
  const token = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `OS-${Date.now()}-${token}`;
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatSlideHeading(heading) {
  const trimmed = String(heading).trim();
  if (!trimmed) return trimmed;
  return trimmed.endsWith(":") ? trimmed : `${trimmed}:`;
}

function formatPrice(priceCzk) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(priceCzk);
}

function getGradient(color) {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES.slate;
}

function allSlidesCompleted(state, category) {
  const progress = ensureProgress(state, category.slug);
  return category.slides.every((slide) => progress.completedSlides.includes(slide.id));
}

function renderShell(content) {
  const state = loadState();
  return `
    <div class="min-h-screen">
      <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button data-action="go-catalog" class="text-left">
            <p class="text-xs font-semibold uppercase tracking-wider text-brand">OnlineŠkolení.cz</p>
            <h1 class="text-lg font-bold text-slate-900 sm:text-xl">${escapeHtml(appData.appTitle)}</h1>
          </button>
          <div class="flex flex-wrap items-center gap-3 text-sm">
            ${
              demoMode
                ? `<span class="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">Demo režim – vše odemčeno</span>`
                : state.sessionId
                  ? `<span class="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">Session: ${escapeHtml(state.sessionId)}</span>`
                  : `<span class="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Bez aktivní session</span>`
            }
            <a href="/lms" class="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50">
              ← Moje školení
            </a>
            <button
              data-action="reset-demo"
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 transition hover:bg-slate-50"
            >
              Reset průběhu
            </button>
          </div>
          ${
            demoMode
              ? `<div class="border-t border-emerald-100 bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-800 sm:px-6">
                  Všechny kategorie jsou v demo režimu dostupné bez platby GoPay. Pro plný přístup z LMS se přihlaste účtem <strong>testik</strong> / <strong>test1234</strong>.
                </div>`
              : ""
          }
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">${content}</main>
    </div>
  `;
}

function renderCatalog() {
  const state = loadState();

  const cards = appData.categories
    .map((category) => {
      const paid = isCategoryUnlocked(state, category.slug);
      const progress = ensureProgress(state, category.slug);
      const done = allSlidesCompleted(state, category);
      const totalSlides = category.slides.length;
      const completedCount = progress.completedSlides.length;
      const percent = Math.round((completedCount / totalSlides) * 100);

      return `
        <article class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
          <div class="bg-gradient-to-r ${getGradient(category.color)} px-5 py-4 text-white">
            <p class="text-xs font-semibold uppercase tracking-wider opacity-90">${escapeHtml(category.shortTitle)}</p>
            <h2 class="mt-1 text-lg font-bold leading-snug">${escapeHtml(category.title)}</h2>
          </div>
          <div class="flex flex-1 flex-col p-5">
            <p class="text-sm text-slate-600">${totalSlides} lekcí · závěrečný test ${category.finalTest.questionCount} otázek</p>
            ${
              paid
                ? `<div class="mt-4">
                    <div class="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Průběh výuky</span><span>${completedCount}/${totalSlides}</span>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full rounded-full bg-brand transition-all" style="width:${percent}%"></div>
                    </div>
                  </div>`
                : `<p class="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Kategorie je zamčená – dokončete simulaci platby GoPay.</p>`
            }
            <div class="mt-auto flex flex-wrap gap-2 pt-5">
              ${
                paid
                  ? `<button data-action="open-category" data-slug="${category.slug}" class="btn-primary flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                      ${done ? "Závěrečný test" : "Pokračovat ve výuce"}
                    </button>`
                  : `<button data-action="open-payment" data-slug="${category.slug}" class="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                      Odemknout · ${formatPrice(category.priceCzk)}
                    </button>`
              }
            </div>
            ${
              paid && progress.finalTestPassed
                ? `<p class="mt-3 text-center text-xs font-semibold text-emerald-600">✓ Závěrečný test úspěšně dokončen</p>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  return renderShell(`
    <section class="fade-in">
      <div class="mb-8 max-w-3xl">
        <h2 class="text-2xl font-bold text-slate-900 sm:text-3xl">Katalog školení</h2>
        <p class="mt-2 text-slate-600">
          Microlearning platforma: projděte studijní karty, ověřte si znalosti průběžnými otázkami
          a po dokončení všech lekcí absolvujte závěrečný test.
          ${
            demoMode
              ? ""
              : " Bez demo režimu je každá kategorie odemčena až po simulaci platby GoPay, nebo použijte odkaz z přihlášeného LMS s parametrem <code>?demo=1</code>."
          }
        </p>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">${cards}</div>
    </section>
  `);
}

function renderPaymentModal() {
  const category = getCategory(ui.pendingPaymentSlug);
  if (!category) return renderCatalog();

  return renderShell(`
    <section class="fade-in">
      ${renderBreadcrumb(category, "Platba GoPay")}
      <div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00A651] text-lg font-bold text-white">GP</div>
          <div>
            <p class="text-sm font-semibold text-slate-900">GoPay · simulace platby</p>
            <p class="text-xs text-slate-500">Sandbox režim pro demonstraci</p>
          </div>
        </div>
        <dl class="mt-5 space-y-3 text-sm">
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Školení</dt><dd class="font-medium text-right">${escapeHtml(category.title)}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Částka</dt><dd class="text-lg font-bold text-slate-900">${formatPrice(category.priceCzk)}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Stav</dt><dd class="font-medium text-amber-700">Čeká na zaplacení</dd></div>
        </dl>
        <p class="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Po úspěšné platbě se kategorie odemkne a systém vygeneruje unikátní přístupovou session uloženou v prohlížeči.
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <button data-action="cancel-payment" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Zrušit
          </button>
          <button data-action="simulate-payment" data-slug="${category.slug}" class="flex-1 rounded-xl bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f46]">
            Simulovat úspěšnou platbu
          </button>
        </div>
      </div>
    </section>
  `);
}

function renderBreadcrumb(category, current) {
  return `
    <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <button data-action="go-catalog" class="hover:text-brand">Katalog</button>
      <span>/</span>
      <button data-action="open-category" data-slug="${category.slug}" class="hover:text-brand">${escapeHtml(category.shortTitle)}</button>
      <span>/</span>
      <span class="font-medium text-slate-800">${escapeHtml(current)}</span>
    </nav>
  `;
}

function renderQuestionBlock(question, prefix, answersMap) {
  const options = question.options
    .map((option, optionIndex) => {
      const inputId = `${prefix}-${question.id}-${optionIndex}`;
      const checked = answersMap[question.id] === optionIndex ? "checked" : "";
      return `
        <label for="${inputId}" class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand/40 hover:bg-brand-tint/40">
          <input
            id="${inputId}"
            type="radio"
            name="${prefix}-${question.id}"
            value="${optionIndex}"
            data-question-id="${question.id}"
            data-answer-index="${optionIndex}"
            class="mt-1"
            ${checked}
          />
          <span class="text-sm leading-relaxed text-slate-700">${escapeHtml(option)}</span>
        </label>
      `;
    })
    .join("");

  return `
    <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p class="text-sm font-semibold text-slate-900">${escapeHtml(question.text)}</p>
      <div class="mt-3 space-y-2">${options}</div>
    </div>
  `;
}

function renderLearning() {
  const category = getCategory(ui.categorySlug);
  if (!category) return renderCatalog();

  const state = loadState();
  if (!isCategoryUnlocked(state, category.slug)) {
    ui.view = "payment";
    ui.pendingPaymentSlug = category.slug;
    return renderPaymentModal();
  }

  const progress = ensureProgress(state, category.slug);

  if (allSlidesCompleted(state, category) || progress.finalTestUnlocked) {
    if (!progress.finalTestUnlocked) {
      progress.finalTestUnlocked = true;
      saveState(state);
    }
    return renderFinalTest(category);
  }

  const slide = category.slides[progress.slideIndex];
  const slideNumber = progress.slideIndex + 1;
  const totalSlides = category.slides.length;
  const paragraphs = slide.paragraphs
    .map((paragraph) => `<p class="text-sm leading-relaxed text-slate-700 sm:text-base">${escapeHtml(paragraph)}</p>`)
    .join("");

  const quizBlocks = slide.checkQuestions
    .map((question) => renderQuestionBlock(question, "slide-quiz", ui.quizAnswers))
    .join("");

  return renderShell(`
    <section class="fade-in">
      ${renderBreadcrumb(category, `Lekce ${slideNumber}/${totalSlides}`)}
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-brand">Microlearning</p>
          <h2 class="text-2xl font-bold text-slate-900">${escapeHtml(formatSlideHeading(slide.heading))}</h2>
        </div>
        <div class="min-w-[180px]">
          <div class="mb-1 flex justify-between text-xs text-slate-500">
            <span>Lekce</span><span>${slideNumber} / ${totalSlides}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-brand" style="width:${Math.round((slideNumber / totalSlides) * 100)}%"></div>
          </div>
        </div>
      </div>

      <div class="card-flip">
        <div class="card-inner ${ui.slideFlipped ? "is-flipped" : ""}">
          <div class="card-face rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div class="space-y-3">${paragraphs}</div>
              </div>
              <div class="flex min-h-[220px] items-center justify-center lg:justify-end">
                ${getThemeWidgetForSlide(slide.svg_placeholder, category.slug)}
              </div>
            </div>
            <div class="mt-8 flex justify-end">
              <button data-action="flip-to-quiz" class="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                Rozumím, otestovat
              </button>
            </div>
          </div>

          <div class="card-face card-face-back rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h3 class="text-xl font-bold text-slate-900">Kontrolní otázky</h3>
            <p class="mt-1 text-sm text-slate-600">Ověřte si pochopení tématu před postupem na další lekci.</p>
            <div class="mt-5 space-y-4 pb-1">${quizBlocks}</div>
            ${
              ui.quizError
                ? `<p class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${escapeHtml(ui.quizError)}</p>`
                : ""
            }
            ${
              ui.slideQuizPassed
                ? `<div class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Správně! Můžete pokračovat na další lekci.
                  </div>
                  <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button data-action="continue-slide" class="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                      ${slideNumber >= totalSlides ? "Přejít na závěrečný test" : "Pokračovat na další lekci"}
                    </button>
                  </div>`
                : `<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button data-action="flip-to-study" class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      ← Zpět na studijní text
                    </button>
                    <button data-action="submit-slide-quiz" class="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                      Ověřit odpovědi
                    </button>
                  </div>`
            }
          </div>
        </div>
      </div>
    </section>
  `);
}

function renderFinalTest(category) {
  const state = loadState();
  const progress = ensureProgress(state, category.slug);
  const test = category.finalTest;

  if (progress.finalTestPassed && ui.finalResult) {
    return renderShell(`
      <section class="fade-in mx-auto max-w-2xl text-center">
        ${renderBreadcrumb(category, "Výsledek testu")}
        <div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
          <p class="text-4xl">✓</p>
          <h2 class="mt-3 text-2xl font-bold text-emerald-900">Gratulujeme!</h2>
          <p class="mt-2 text-emerald-800">
            Závěrečný test jste úspěšně dokončili (${ui.finalResult.correct}/${ui.finalResult.total} správně).
            Certifikát (PDF) vydává až oficiální závěrečný test v přihlášeném LMS po objednávce školení.
          </p>
          <button data-action="go-catalog" class="mt-6 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
            Zpět do katalogu
          </button>
        </div>
      </section>
    `);
  }

  const questions = category._finalTestQuestions ?? shuffle(test.pool).slice(0, test.questionCount);
  category._finalTestQuestions = questions;

  const questionBlocks = questions
    .map((question, index) => `
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Otázka ${index + 1}</p>
        ${renderQuestionBlock(question, "final-quiz", ui.finalAnswers)}
      </div>
    `)
    .join("");

  return renderShell(`
    <section class="fade-in">
      ${renderBreadcrumb(category, "Závěrečný test")}
      <div class="mb-6 max-w-3xl">
        <h2 class="text-2xl font-bold text-slate-900">${escapeHtml(test.title)}</h2>
        <p class="mt-2 text-slate-600">
          ${escapeHtml(test.subtitle)} · ${test.questionCount} náhodně vybraných otázek · úspěch od ${test.minCorrect} správných (${test.passPercent} %)
        </p>
      </div>
      <form data-form="final-test" class="space-y-5">${questionBlocks}</form>
      ${
        ui.finalError
          ? `<p class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${escapeHtml(ui.finalError)}</p>`
          : ""
      }
      <div class="mt-6 flex justify-end">
        <button data-action="submit-final-test" class="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
          Odeslat závěrečný test
        </button>
      </div>
    </section>
  `);
}

function render() {
  const root = document.getElementById("app");
  if (!root || !appData) return;

  let html = "";
  switch (ui.view) {
    case "payment":
      html = renderPaymentModal();
      break;
    case "learn":
      html = renderLearning();
      break;
    default:
      html = renderCatalog();
  }

  root.innerHTML = html;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", handleAction);
  });

  document.querySelectorAll('input[type="radio"][data-question-id]').forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.currentTarget;
      const questionId = target.dataset.questionId;
      const answerIndex = Number(target.dataset.answerIndex);
      const isFinal = target.name.startsWith("final-quiz");

      if (isFinal) {
        ui.finalAnswers[questionId] = answerIndex;
      } else {
        ui.quizAnswers[questionId] = answerIndex;
      }
    });
  });
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  const slug = event.currentTarget.dataset.slug ?? null;

  switch (action) {
    case "go-catalog":
      ui.view = "catalog";
      ui.categorySlug = null;
      ui.pendingPaymentSlug = null;
      ui.slideFlipped = false;
      ui.slideQuizPassed = false;
      ui.quizError = null;
      ui.finalError = null;
      render();
      break;

    case "open-payment":
      ui.view = "payment";
      ui.pendingPaymentSlug = slug;
      render();
      break;

    case "cancel-payment":
      ui.view = "catalog";
      ui.pendingPaymentSlug = null;
      render();
      break;

    case "simulate-payment": {
      const state = loadState();
      if (!state.sessionId) {
        state.sessionId = generateSessionId();
      }
      if (!state.paidCategories.includes(slug)) {
        state.paidCategories.push(slug);
      }
      ensureProgress(state, slug);
      saveState(state);
      ui.view = "learn";
      ui.categorySlug = slug;
      ui.pendingPaymentSlug = null;
      ui.slideFlipped = false;
      ui.slideQuizPassed = false;
      ui.quizAnswers = {};
      ui.quizError = null;
      render();
      break;
    }

    case "open-category": {
      const state = loadState();
      const category = getCategory(slug);
      if (!category) return;
      if (!isCategoryUnlocked(state, slug)) {
        ui.view = "payment";
        ui.pendingPaymentSlug = slug;
        render();
        return;
      }
      ui.view = "learn";
      ui.categorySlug = slug;
      ui.slideFlipped = false;
      ui.slideQuizPassed = false;
      ui.quizAnswers = {};
      ui.quizError = null;
      ui.finalError = null;
      if (allSlidesCompleted(state, category)) {
        const progress = ensureProgress(state, slug);
        progress.finalTestUnlocked = true;
        saveState(state);
      }
      render();
      break;
    }

    case "flip-to-quiz":
      ui.slideFlipped = true;
      ui.slideQuizPassed = false;
      ui.quizError = null;
      render();
      break;

    case "flip-to-study":
      ui.slideFlipped = false;
      ui.slideQuizPassed = false;
      ui.quizError = null;
      render();
      break;

    case "submit-slide-quiz":
      submitSlideQuiz();
      break;

    case "continue-slide":
      continueSlide();
      break;

    case "submit-final-test":
      submitFinalTest();
      break;

    case "reset-demo":
      localStorage.removeItem(STORAGE_KEY);
      demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
      ui = {
        view: "catalog",
        categorySlug: null,
        pendingPaymentSlug: null,
        quizAnswers: {},
        finalAnswers: {},
        slideFlipped: false,
        slideQuizPassed: false,
        quizError: null,
        finalError: null,
        finalResult: null,
      };
      if (appData?.categories) {
        appData.categories.forEach((category) => {
          delete category._finalTestQuestions;
        });
      }
      if (demoMode) {
        applyDemoAccess();
      }
      render();
      break;

    default:
      break;
  }
}

function submitSlideQuiz() {
  const category = getCategory(ui.categorySlug);
  if (!category) return;

  const state = loadState();
  const progress = ensureProgress(state, category.slug);
  const slide = category.slides[progress.slideIndex];
  const unanswered = slide.checkQuestions.filter(
    (question) => ui.quizAnswers[question.id] === undefined
  );

  if (unanswered.length > 0) {
    ui.quizError = "Vyplňte prosím všechny kontrolní otázky.";
    render();
    return;
  }

  const wrong = slide.checkQuestions.filter(
    (question) => ui.quizAnswers[question.id] !== question.correctIndex
  );

  if (wrong.length > 0) {
    ui.quizError =
      "Některé odpovědi nejsou správné. Projděte si znovu studijní text a zkuste to znovu.";
    render();
    return;
  }

  if (!progress.completedSlides.includes(slide.id)) {
    progress.completedSlides.push(slide.id);
  }

  ui.slideQuizPassed = true;
  ui.quizError = null;
  saveState(state);
  render();
}

function continueSlide() {
  const category = getCategory(ui.categorySlug);
  if (!category) return;

  const state = loadState();
  const progress = ensureProgress(state, category.slug);
  const isLastSlide = progress.slideIndex >= category.slides.length - 1;

  if (isLastSlide) {
    progress.finalTestUnlocked = true;
    ui.slideFlipped = false;
    ui.slideQuizPassed = false;
    ui.quizAnswers = {};
    saveState(state);
    render();
    return;
  }

  progress.slideIndex += 1;
  ui.slideFlipped = false;
  ui.slideQuizPassed = false;
  ui.quizAnswers = {};
  ui.quizError = null;
  saveState(state);
  render();
}

function submitFinalTest() {
  const category = getCategory(ui.categorySlug);
  if (!category) return;

  const state = loadState();
  const progress = ensureProgress(state, category.slug);
  const test = category.finalTest;
  const questions = category._finalTestQuestions ?? shuffle(test.pool).slice(0, test.questionCount);

  const unanswered = questions.filter(
    (question) => ui.finalAnswers[question.id] === undefined
  );
  if (unanswered.length > 0) {
    ui.finalError = "Vyplňte prosím všechny otázky závěrečného testu.";
    render();
    return;
  }

  const correct = questions.filter(
    (question) => ui.finalAnswers[question.id] === question.correctIndex
  ).length;

  if (correct < test.minCorrect) {
    ui.finalError = `Test nebyl úspěšný (${correct}/${questions.length} správně). Potřebujete alespoň ${test.minCorrect} správných odpovědí. Zkuste to znovu – otázky budou znovu zamíchány.`;
    ui.finalAnswers = {};
    delete category._finalTestQuestions;
    render();
    return;
  }

  progress.finalTestPassed = true;
  ui.finalResult = { correct, total: questions.length };
  ui.finalError = null;
  saveState(state);
  render();
}

async function init() {
  const root = document.getElementById("app");
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`data.json HTTP ${response.status}`);
    }

    appData = await response.json();
    initFromUrl();
    render();
  } catch (error) {
    console.error("[hrbek-learning]", error);
    if (root) {
      root.innerHTML = `
        <div class="flex min-h-screen items-center justify-center p-6">
          <div class="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p class="font-semibold text-red-800">Nepodařilo se načíst školení</p>
            <p class="mt-2 text-sm text-red-700">Zkuste obnovit stránku nebo otevřít
              <a href="/hrbek-learning/?demo=1" class="underline">/hrbek-learning/?demo=1</a>.
            </p>
          </div>
        </div>
      `;
    }
  }
}

init();
