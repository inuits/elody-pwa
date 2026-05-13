import { describe, expect, it } from "vitest";
import { useTransliteration } from "@/composables/useTransliteration";

const LATIN_TO_ARABIC: Record<string, string> = {
  ʾ: "ا",
  b: "ب",
  t: "ت",
  ṯ: "ث",
  g: "ج",
  ḥ: "ح",
  ẖ: "خ",
  d: "د",
  ḏ: "ذ",
  r: "ر",
  z: "ز",
  s: "س",
  š: "ش",
  ṣ: "ص",
  ḍ: "ض",
  ṭ: "ط",
  ẓ: "ظ",
  ʿ: "ع",
  ġ: "غ",
  f: "ف",
  p: "ف",
  q: "ق",
  k: "ك",
  l: "ل",
  m: "م",
  n: "ن",
  h: "ه",
  w: "و",
  y: "ي",
};

const ARABIC_TO_LATIN: Record<string, string> = {
  ا: "ʾ",
  ب: "b",
  ت: "t",
  ث: "ṯ",
  ج: "g",
  ح: "ḥ",
  خ: "ẖ",
  د: "d",
  ذ: "ḏ",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "š",
  ص: "ṣ",
  ض: "ḍ",
  ط: "ṭ",
  ظ: "ẓ",
  ع: "ʿ",
  غ: "ġ",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
};

describe("useTransliteration", () => {
  const { transliterateText, transliterateHtml } = useTransliteration();

  describe("transliterateText with LATIN_TO_ARABIC map", () => {
    it("transliterates 'b' to 'ب'", () => {
      expect(transliterateText("b", LATIN_TO_ARABIC)).toBe("ب");
    });

    it("transliterates 'š' to 'ش'", () => {
      expect(transliterateText("š", LATIN_TO_ARABIC)).toBe("ش");
    });

    it("transliterates 'ṯ' to 'ث'", () => {
      expect(transliterateText("ṯ", LATIN_TO_ARABIC)).toBe("ث");
    });
  });

  describe("transliterateText with ARABIC_TO_LATIN map", () => {
    it("transliterates 'ب' to 'b'", () => {
      expect(transliterateText("ب", ARABIC_TO_LATIN)).toBe("b");
    });

    it("transliterates 'ش' to 'š'", () => {
      expect(transliterateText("ش", ARABIC_TO_LATIN)).toBe("š");
    });

    it("transliterates 'ث' to 'ṯ'", () => {
      expect(transliterateText("ث", ARABIC_TO_LATIN)).toBe("ṯ");
    });
  });

  describe("transliterateText passthrough", () => {
    it("passes through characters not in the map unchanged (spaces)", () => {
      expect(transliterateText("b r", LATIN_TO_ARABIC)).toBe("ب ر");
    });

    it("passes through punctuation not in the map unchanged", () => {
      expect(transliterateText("b.r", LATIN_TO_ARABIC)).toBe("ب.ر");
    });

    it("returns empty string for empty input", () => {
      expect(transliterateText("", LATIN_TO_ARABIC)).toBe("");
    });
  });

  describe("transliterateHtml", () => {
    it("preserves <p> tags intact", () => {
      expect(transliterateHtml("<p>ب</p>", ARABIC_TO_LATIN)).toBe("<p>b</p>");
    });

    it("preserves <strong> tags intact", () => {
      expect(transliterateHtml("<strong>ب</strong>", ARABIC_TO_LATIN)).toBe(
        "<strong>b</strong>",
      );
    });

    it("preserves <em> tags intact", () => {
      expect(transliterateHtml("<em>ب</em>", ARABIC_TO_LATIN)).toBe(
        "<em>b</em>",
      );
    });

    it("converts Latin to Arabic when given LATIN_TO_ARABIC map", () => {
      expect(transliterateHtml("<p>b</p>", LATIN_TO_ARABIC)).toBe("<p>ب</p>");
    });

    it("returns empty string for empty input", () => {
      expect(transliterateHtml("", LATIN_TO_ARABIC)).toBe("");
    });

    it("does not transliterate HTML attributes", () => {
      expect(transliterateHtml('<p class="rtl">ب</p>', ARABIC_TO_LATIN)).toBe(
        '<p class="rtl">b</p>',
      );
    });

    it("passes through Latin chars in Arabic-dominant mixed text", () => {
      expect(transliterateHtml("<p>ب hello</p>", ARABIC_TO_LATIN)).toBe(
        "<p>b hello</p>",
      );
    });
  });
});
