# English and Spanish

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** the whole app speaks English or Spanish, and the Teacher can switch at any time. She chooses in two places: a **Language** row in the Settings sheet, and an **EN · ES** switch in the top-left corner of both tabs. On first open the app follows the phone's language. Decided in the grilling session of 2026-11-25. The Spanish word for each term is the _En español_ line in [GLOSSARY.md](../../../GLOSSARY.md).

Today the app is in English, except the install guide's sheet, which already follows the phone's language ([issue 25](25-install-guide.md)). History dates also follow the phone's language, so a phone in Spanish already shows "mar, 24 nov" beside "3 runs". Saved data holds no text, only codes such as `completed` and `stopped`, so History reads in whichever language is chosen without changing anything saved.

## Decisions

### Choosing the language

- **In Settings:** a **Language** row under Theme, styled like the Chime and Theme rows. Its options are "English" and "Español", each written in its own language, so someone who can't read the current language still finds theirs.
- **The EN · ES switch:** a small pill in the top-left corner of the Timer and History tabs, in the same place on both. The current language is highlighted, and a tap switches to the other. Its tap area is 44 pt even though it looks smaller. VoiceOver reads it as "Language: English" or "Idioma: Español", in the current language. Codes are fine here because there's no room for names; Settings shows the names.
- **History gets two rows at the top:** the switch on the left and the gear on the right in the first row, and the heading in the second. History already looks like this when the Install pill shows. Its list starts about 40 px lower, which is fine because History scrolls.
- **The switch keeps its corner in Safari.** The Install pill sits to its right. When the install banner shows, the banner takes the top row and the switch sits in the corner under it, as the gear does on the right. The Home Screen app shows neither the pill nor the banner.
- **A stray tap loses nothing.** The change shows at once, with no reload, and a Run keeps counting, paused or not. History and "This lesson" redraw in the new language.
- **No flags.** A flag stands for a country, not a language.

### Which language first

- **It follows the phone** until the Teacher chooses: Spanish when the phone's language is any `es-*`, and English otherwise. Once she chooses, the choice is saved on the phone under its own key and wins from then on.
- **It's applied before the page draws**, as the Theme is, so the app never flashes in the other language when it opens.
- **Safari and the Home Screen app each keep their own choice.** They don't share storage, just as they keep separate Histories. A Teacher who picks Español in Safari before installing gets the phone's language again in the Home Screen app. This only matters when the phone is in one language and she wants the app in the other. Accepted.

### What changes language

- **Everything the Teacher sees or hears:** every text on both tabs and in Settings, every VoiceOver label (the dial, the Presets, − and +, the gear, the tabs, the lotus's description), the delete confirmation's question, the "History isn't being saved" note and the version line.
- **The page's `lang`** changes with the language, so VoiceOver reads Spanish with a Spanish voice and Safari doesn't offer to translate it.
- **Dates and times in History, and the version line's date**, follow the app's language, not the phone's. When the phone's language is the same as the app's, its full locale is used (`es-MX`, `es-ES`, `en-GB`…), which keeps the region's choice of 12- or 24-hour time. Otherwise plain `es` or `en` is used.
- **The install banner and the Install pill** follow the app's language ("Install", "Instalar").
- **The install guide's sheet keeps following the phone's language**, as it does now. It names iOS's own buttons and shows iOS's screens, and iOS shows them in the phone's language.
- **What doesn't change:**
  - Names: Yogi Timer, Glow, Bead, Tingsha and Gong. They're marked `translate="no"`.
  - What iOS draws itself: the share sheet, and the OK and Cancel buttons of the delete confirmation. These follow the phone's language. When the phone and the app differ, the confirmation shows a Spanish question with English buttons, or the other way round. Accepted: it's rare and still clear.
  - The name under the Home Screen icon, and the manifest's description.

### The Spanish

- **Latin American Spanish, with "tú"**, as the install guide already uses ("Toca **Agregar a Inicio**").
- **Plain words where she glances mid-class**, such as the dial, Stop and the Presets. A yoga tone only in History's empty state.
- The words, from the glossary and the session:

| English | Spanish |
|---|---|
| Ready | Lista |
| Tap to start | Toca para empezar |
| Paused | En pausa |
| Stop / Cancel | Detener / Cancelar |
| Tap again | Toca otra vez |
| This lesson · 5 runs · 14 min | Esta clase · 5 rondas · 14 min (1 ronda) |
| 3 min · completed | 3 min · completada |
| 5 min · stopped 2:41 | 5 min · detenida 2:41 |
| Timer / History | Temporizador / Historial |
| Settings / Done | Configuración / Listo |
| Chime / Bowl (VoiceOver: Singing bowl) | Campana / Cuenco |
| Theme / Language | Tema / Idioma |
| Version | Versión |
| No lessons yet | Tu práctica empieza aquí |
| Each lesson appears here after its first Run. | Cada clase aparece aquí al terminar su primera ronda. |
| Delete this lesson? This can't be undone. | ¿Borrar esta clase? No se puede deshacer. |
| Install / Add it to your Home Screen / Hide | Instalar / Agrégala a tu pantalla de inicio / Ocultar |
| VoiceOver: Pause, 2:41 left / Resume, 2:41 left / Start, 1:05 | Pausar, quedan 2:41 / Reanudar, quedan 2:41 / Empezar, 1:05 |
| VoiceOver: Presets; 3 minutes; 3 minutes, selected | Tiempos; 3 minutos; 3 minutos, elegido |
| VoiceOver: Tap again to replace with 3 minutes | Toca otra vez para cambiar a 3 minutos |
| VoiceOver: Remove 5 seconds / Add 5 seconds | Quitar 5 segundos / Agregar 5 segundos |

  The rest (the "not being saved" note, the delete button's label, the lotus's description, the tab bar's label) follow from these words and can be polished as they're built.

### How it's built: internationalization rules

- **One catalogue of texts**, a DOM-free module holding English and Spanish under the same keys. There's no library. A test fails when a key is missing from either language, so adding a third language means adding its texts and its option.
- **Whole sentences with placeholders, never pieces glued together:** "Toca otra vez para cambiar a {preset}". Word order differs between languages.
- **Plurals with `Intl.PluralRules`**, not `n === 1`.
- **Dates, times and numbers with `Intl`** and the locale chosen above.
- **No text inside images or SVG.** The guide's screenshots are already per language. Om (ॐ) is a symbol, not a word.
- **Room for longer text.** Spanish runs about 30 % longer. The Timer tab still never scrolls ([issue 21](21-timer-tab-never-scrolls.md)), "Toca otra vez" fits in a Preset button, and "Temporizador" fits in the tab bar.
- **Saved data stays free of text.** It already is.

## Acceptance criteria

- [x] Settings has a Language row with "English" and "Español". The EN · ES switch is in the top-left corner of both tabs, with a 44 pt tap area. Either one changes the whole app at once, mid-Run included, and the Run carries on.
- [x] On first open the app is in Spanish on a phone in any Spanish, and in English otherwise. A choice, once made, survives closing and reopening the app.
- [x] Opening the app never shows the other language for an instant.
- [x] Every text and every VoiceOver label is in the chosen language, and `<html lang>` matches it.
- [x] History's dates and times, and the version line's date, follow the app's language, with the phone's region when the languages match.
- [x] Plurals read right in both languages: "1 run", "5 runs", "1 ronda", "5 rondas".
- [x] The Install banner and pill follow the app's language, and the install guide's sheet still follows the phone's.
- [x] Yogi Timer, Glow, Bead, Tingsha and Gong never change, and are marked `translate="no"`.
- [x] History has the switch and the gear in its first row and the heading in its second. In Safari the switch keeps its corner, with the Install pill to its right, or under the banner.
- [x] In Spanish, the Timer tab still never scrolls at 375 × 667 and 402 × 874, with a Run going, paused, with a Selected Preset and with "Toca otra vez" showing.
- [x] A test fails if a text is missing from either language.
- [x] **Checked in the iOS Simulator as the Home Screen app**, opened from its icon, with real taps:
  - With the phone in Spanish, the first open is in Spanish; with the phone in English, in English.
  - The switch and the Settings row both change the language, mid-Run too, and the choice survives closing the app from the app switcher.
  - "Toca otra vez", "Detener" and "En pausa" fit, and History reads in Spanish, dates included.
  - In Glow and Bead, each in light and dark. Screenshots in the done comment.

## Testing

- TDD for the catalogue: every key in both languages, and the plurals.
- TDD for `format.js`, given a language: "3 min · completada", "2 min · detenida 1:30", "1 ronda", and dates and times in the right locale (with the phone's region when the languages match).
- TDD for what each tab shows, through the Timer screen's `view()` and the History screen's view, given a language: "Lista", "Esta clase · 5 rondas · 14 min", "Pausar, quedan 2:41", "Tu práctica empieza aquí".
- TDD for choosing the first language: `es-MX` and `es` give Spanish, `en-GB` and `fr` give English, and a saved choice always wins.
- The switch's place, the two rows in History, the fit of the longer Spanish and the instant switch are checked in the browser at both sizes, then in the iOS Simulator (see the last acceptance criterion).
- VoiceOver with a Spanish voice goes to the real-iPhone test ([issue 20](20-real-iphone-acceptance-test.md)).

## Comments

### 2026-11-25, done.

- **The texts**, in `language.js`, with no DOM: English and Spanish under the same keys, `firstLanguage()` (the saved choice, or else the phone's: any `es-*` is Spanish), and `createText()`, which gives `t(key, values)` with placeholders and `Intl.PluralRules` plurals, and the locale for dates (the phone's own when it speaks the app's language). 7 tests, one of them checking every key is in both languages.
- **Both tabs in a language.** `format.js`, the Timer screen's `view(now, text)` and the History screen's `view(text)` take the language and default to English. New tests in Spanish: "3 min · completada", "2 min · detenida 1:30", "1 ronda", "Esta clase · 2 rondas · 4 min", "Pausar, quedan 0:41", "Lista", dates in Spanish even on a phone in English, and the version line (`describeVersion`, the build's calendar day read in UTC). 168 tests in all.
- **The page.**
  - `app_language.js` holds the language in use, saves the choice under `yogi-timer.language`, and tells the Timer and History controllers to redraw.
  - `language_controller.js` (on `<body>`) writes every `data-text` and `data-text-label`, sets `<html lang>`, and drives the EN · ES switch, the Language row and the version line.
  - The head script sets `<html lang>` before the page draws. In Spanish it keeps the page hidden until the controller has written it; should the scripts fail, the page shows anyway after 2 s, in English.
  - The Chime, Theme and Language rows share their columns (a subgrid), so the selectors line up whatever the headings' length.
  - Vite now also gives the build's date and commit apart (`VITE_APP_BUILT`, `VITE_APP_COMMIT`), so the date can follow the language.
- **Checked in the browser pane** at 375 × 667 and 402 × 874, in Spanish: the Timer panel's `scrollHeight` equals its `clientHeight`; "Toca otra vez" fits a Preset in three lines; the switch changes everything at once mid-Run; the Settings sheet's top is at 574 px at 402 × 874, below the Presets (536 px). No console errors.
- **Checked in the iOS Simulator** (iPhone 17, phone in Spanish) as the Home Screen app:
  - The first open was in Spanish. The switch changed the language mid-Run and the Run carried on; paused, it read "EN PAUSA" and "Detener".
  - Switched to English and closed from the app switcher, it reopened in English on the Spanish phone.
  - History and Settings in Spanish, the Language row switching back to English, in Glow and Bead, light and dark.
  - Screenshots: [first open, Glow light](26-english-and-spanish/glow-light-first-open-es.png), [paused, Glow light](26-english-and-spanish/glow-light-paused-es.png), [reopened in English](26-english-and-spanish/glow-light-reopened-en-on-spanish-phone.png), [This lesson, Glow dark](26-english-and-spanish/glow-dark-lesson-es.png), [History, Glow dark](26-english-and-spanish/glow-dark-history-es.png), [Settings, Glow dark](26-english-and-spanish/glow-dark-settings-es.png), [Settings, Bead dark](26-english-and-spanish/bead-dark-settings-en.png), [History, Bead light](26-english-and-spanish/bead-light-history-en.png).
- **Not checked:**
  - VoiceOver with a Spanish voice: for the real-iPhone test ([issue 20](20-real-iphone-acceptance-test.md)).
  - Starting the app with the phone in English: the Simulator's phone was in Spanish. The rule is tested (`firstLanguage`).
  - The Install banner and pill in Spanish: they show only in Safari, not in the Home Screen app.
- **Leftovers:**
  - The Timer controller still builds the Presets' and − / +'s VoiceOver labels itself (as it did before); they could come from `view()` and be tested.
  - The head script repeats `firstLanguage`'s rule; its comment says to keep them in step.
  - "No lessons yet" and "Tu práctica empieza aquí" say different things on purpose: the yoga tone is Spanish only.
