// The app's two languages, English and Spanish, with no DOM. The Spanish words for the
// glossary's terms are its _En español_ lines; keep them in step.
//
//   firstLanguage({ saved, phoneLanguage })  "en" | "es": the Teacher's saved choice, or else
//                                             the phone's language (any es-* is Spanish)
//   createText(language, { phoneLocale, timeZone })
//     language, locale   the locale for dates: the phone's own when it speaks this language
//                        (es-MX, en-GB…), so its region's 12- or 24-hour time holds; else "es" / "en"
//     timeZone           for dates; the phone's when not given (tests give one)
//     t(key, values)     the text, with {placeholders} filled in. A text with plural forms
//                        ({ one, other }) picks one by `values.n`, with Intl.PluralRules.
//
// Whole sentences with placeholders, never pieces glued together: word order differs.
// A test checks every key is in both languages. A third language is its texts here, its
// option in index.html and its code in LANGUAGES.
export const LANGUAGES = ["en", "es"];

export const MESSAGES = {
  en: {
    ready: "Ready",
    paused: "Paused",
    tapToStart: "Tap to start",
    tapAgain: "Tap again",
    stop: "Stop",
    cancel: "Cancel",
    dialPause: "Pause, {time} left",
    dialResume: "Resume, {time} left",
    dialStart: "Start, {time}",
    presets: "Presets",
    presetMinutes: { one: "{n} minute", other: "{n} minutes" },
    presetSelected: "{preset}, selected",
    replaceWith: "Tap again to replace with {preset}",
    removeSeconds: "Remove {n} seconds",
    addSeconds: "Add {n} seconds",
    lessonHeading: "This lesson · {runs} · {total}",
    runs: { one: "{n} run", other: "{n} runs" },
    minutes: "{n} min",
    underAMinute: "<1 min",
    completed: "{time} · completed",
    stopped: "{time} · stopped {ran}",
    lotus: "A mala of 108 beads lights up blue one by one around a blooming lotus; the blue lotus tassel opens when the Run completes",
    sections: "Sections",
    timerTab: "Timer",
    historyTab: "History",
    settings: "Settings",
    done: "Done",
    chime: "Chime",
    bowl: "Bowl",
    singingBowl: "Singing bowl",
    theme: "Theme",
    language: "Language",
    languageSwitch: "Language: English",
    version: "Version {date} · {commit}",
    versionDateOnly: "Version {date}",
    historyUnsavedTitle: "History isn't being saved on this phone.",
    historyUnsavedBody: "New runs will be lost when the app closes.",
    historyEmpty: "No lessons yet",
    historyHint: "Each lesson appears here after its first Run.",
    deleteLesson: "Delete lesson",
    deleteLessonOf: "Delete lesson of {date}, {time}",
    deleteConfirm: "Delete this lesson? This can't be undone.",
    install: "Install",
    installAdd: "Add it to your Home Screen",
    hide: "Hide",
  },
  es: {
    ready: "Lista",
    paused: "En pausa",
    tapToStart: "Toca y empieza",
    tapAgain: "Toca otra vez",
    stop: "Detener",
    cancel: "Cancelar",
    dialPause: "Pausar, quedan {time}",
    dialResume: "Reanudar, quedan {time}",
    dialStart: "Empezar, {time}",
    presets: "Tiempos",
    presetMinutes: { one: "{n} minuto", other: "{n} minutos" },
    presetSelected: "{preset}, elegido",
    replaceWith: "Toca otra vez para cambiar a {preset}",
    removeSeconds: "Quitar {n} segundos",
    addSeconds: "Agregar {n} segundos",
    lessonHeading: "Esta clase · {runs} · {total}",
    runs: { one: "{n} ronda", other: "{n} rondas" },
    minutes: "{n} min",
    underAMinute: "<1 min",
    completed: "{time} · completada",
    stopped: "{time} · detenida {ran}",
    lotus: "Un mala de 108 cuentas se ilumina de azul, una a una, alrededor de un loto que florece; la borla azul del loto se abre cuando la ronda se completa",
    sections: "Secciones",
    timerTab: "Temporizador",
    historyTab: "Historial",
    settings: "Configuración",
    done: "Listo",
    chime: "Campana",
    bowl: "Cuenco",
    singingBowl: "Cuenco",
    theme: "Tema",
    language: "Idioma",
    languageSwitch: "Idioma: Español",
    version: "Versión {date} · {commit}",
    versionDateOnly: "Versión {date}",
    historyUnsavedTitle: "El historial no se está guardando en este teléfono.",
    historyUnsavedBody: "Las rondas nuevas se perderán al cerrar la app.",
    historyEmpty: "Tu práctica empieza aquí",
    historyHint: "Cada clase aparece aquí al terminar su primera ronda.",
    deleteLesson: "Borrar clase",
    deleteLessonOf: "Borrar la clase del {date}, {time}",
    deleteConfirm: "¿Borrar esta clase? No se puede deshacer.",
    install: "Instalar",
    installAdd: "Agrégala a tu pantalla de inicio",
    hide: "Ocultar",
  },
};

// English, for callers given no language (tests written before there were two).
export const ENGLISH = createText("en");

export function firstLanguage({ saved, phoneLanguage }) {
  if (LANGUAGES.includes(saved)) return saved;
  return /^es\b/i.test(phoneLanguage ?? "") ? "es" : "en";
}

export function createText(language, { phoneLocale, timeZone } = {}) {
  const messages = MESSAGES[language];
  const plurals = new Intl.PluralRules(language);
  const sameLanguage = phoneLocale && phoneLocale.toLowerCase().split("-")[0] === language;
  const locale = sameLanguage ? phoneLocale : language;
  function t(key, values = {}) {
    let text = messages[key];
    if (typeof text === "object") text = text[plurals.select(values.n)] ?? text.other;
    return text.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
  }
  return { language, locale, timeZone, t };
}
