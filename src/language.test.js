import { describe, expect, it } from "vitest";
import { MESSAGES, createText, firstLanguage } from "./language.js";

describe("the first language", () => {
  it("follows a phone in any Spanish", () => {
    expect(firstLanguage({ saved: null, phoneLanguage: "es-MX" })).toBe("es");
    expect(firstLanguage({ saved: null, phoneLanguage: "es" })).toBe("es");
  });

  it("is English on a phone in any other language", () => {
    expect(firstLanguage({ saved: null, phoneLanguage: "en-GB" })).toBe("en");
    expect(firstLanguage({ saved: null, phoneLanguage: "fr" })).toBe("en");
    expect(firstLanguage({ saved: null, phoneLanguage: undefined })).toBe("en");
  });

  it("is the Teacher's choice once she has made one", () => {
    expect(firstLanguage({ saved: "en", phoneLanguage: "es-MX" })).toBe("en");
    expect(firstLanguage({ saved: "es", phoneLanguage: "en-US" })).toBe("es");
    expect(firstLanguage({ saved: "fr", phoneLanguage: "es-MX" })).toBe("es");
  });
});

describe("the catalogue", () => {
  it("has every text in both languages", () => {
    expect(Object.keys(MESSAGES.es).sort()).toEqual(Object.keys(MESSAGES.en).sort());
    for (const key of Object.keys(MESSAGES.en)) {
      expect(typeof MESSAGES.en[key], key).toBe(typeof MESSAGES.es[key]);
    }
  });

  it("fills in placeholders", () => {
    expect(createText("es").t("replaceWith", { preset: "3 minutos" })).toBe("Toca otra vez para cambiar a 3 minutos");
  });

  it("picks the plural each language needs", () => {
    const en = createText("en");
    const es = createText("es");
    expect(en.t("runs", { n: 1 })).toBe("1 run");
    expect(en.t("runs", { n: 5 })).toBe("5 runs");
    expect(es.t("runs", { n: 1 })).toBe("1 ronda");
    expect(es.t("runs", { n: 5 })).toBe("5 rondas");
  });

  it("dates in the phone's region when the phone speaks the same language, else plainly", () => {
    expect(createText("es", { phoneLocale: "es-MX" }).locale).toBe("es-MX");
    expect(createText("es", { phoneLocale: "en-GB" }).locale).toBe("es");
    expect(createText("en", { phoneLocale: "en-GB" }).locale).toBe("en-GB");
  });
});
