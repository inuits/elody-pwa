import { describe, expect, it } from "vitest";
import {
  isTransliterationEnabledValue,
  useTransliteration,
} from "@/composables/useTransliteration";

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
  "s¹": "س",
  "s²": "ش",
  "s³": "س",
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
  س: "s¹",
  ش: "s²",
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

// A source space becomes a widened word gap. Non-breaking spaces are used so the
// gap survives the reading field's `white-space: nowrap` (which collapses runs of
// ordinary spaces).
const WORD_GAP = "\u00A0\u00A0";

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

    it("transliterates 'ش' to the multi-character 's²'", () => {
      expect(transliterateText("ش", ARABIC_TO_LATIN)).toBe("s²");
    });

    it("transliterates 'س' to the multi-character 's¹'", () => {
      expect(transliterateText("س", ARABIC_TO_LATIN)).toBe("s¹");
    });

    it("transliterates 'ث' to 'ṯ'", () => {
      expect(transliterateText("ث", ARABIC_TO_LATIN)).toBe("ṯ");
    });

    it("emits multi-character values for a full word (شمس -> s²s¹s¹... )", () => {
      // ش -> s², م -> m, س -> s¹
      expect(transliterateText("شمس", ARABIC_TO_LATIN)).toBe("s²ms¹");
    });
  });

  describe("transliterateText with insertSpaces enabled", () => {
    it("inserts a space between every mapped character", () => {
      expect(transliterateText("btr", LATIN_TO_ARABIC, true)).toBe("ب ت ر");
    });

    it("does not add a trailing or leading space for a single character", () => {
      expect(transliterateText("b", LATIN_TO_ARABIC, true)).toBe("ب");
    });

    it("maps first, then spaces multi-character keys as single units", () => {
      // s² m s¹ -> ش م س, spaced -> "ش م س"
      expect(transliterateText("s²ms¹", LATIN_TO_ARABIC, true)).toBe("ش م س");
    });

    it("spaces passthrough characters too", () => {
      expect(transliterateText("b.r", LATIN_TO_ARABIC, true)).toBe("ب . ر");
    });

    it("returns empty string for empty input", () => {
      expect(transliterateText("", LATIN_TO_ARABIC, true)).toBe("");
    });

    it("does not insert spaces when the flag is omitted (default off)", () => {
      expect(transliterateText("btr", LATIN_TO_ARABIC)).toBe("بتر");
    });

    it("does not insert spaces when the flag is false", () => {
      expect(transliterateText("btr", LATIN_TO_ARABIC, false)).toBe("بتر");
    });
  });

  describe("transliterateHtml with insertSpaces enabled", () => {
    it("inserts spaces inside text nodes while preserving tags", () => {
      expect(transliterateHtml("<p>btr</p>", LATIN_TO_ARABIC, true)).toBe(
        "<p>ب ت ر</p>",
      );
    });

    it("does not insert spaces when the flag is omitted", () => {
      expect(transliterateHtml("<p>btr</p>", LATIN_TO_ARABIC)).toBe(
        "<p>بتر</p>",
      );
    });
  });

  describe("transliterateText word boundaries (insertSpaces)", () => {
    it("turns a single source space into a widened word gap", () => {
      expect(transliterateText("b t", LATIN_TO_ARABIC, true)).toBe(
        `ب${WORD_GAP}ت`,
      );
    });

    it("keeps single spaces within words and a word gap between them", () => {
      // "wd dm" -> "و د" <gap> "د م"
      expect(transliterateText("wd dm", LATIN_TO_ARABIC, true)).toBe(
        `و د${WORD_GAP}د م`,
      );
    });

    it("does not add a leading or trailing word gap", () => {
      expect(transliterateText(" b ", LATIN_TO_ARABIC, true)).toBe("ب");
    });

    it("collapses multiple source spaces into one word gap", () => {
      expect(transliterateText("b  t", LATIN_TO_ARABIC, true)).toBe(
        `ب${WORD_GAP}ت`,
      );
    });
  });

  describe("transliterateText symbol attachment (insertSpaces)", () => {
    it("does not space curly braces around a letter", () => {
      expect(transliterateText("{s}", LATIN_TO_ARABIC, true)).toBe("{س}");
    });

    it("does not space a slash or braces inside a group", () => {
      expect(transliterateText("{s/n}", LATIN_TO_ARABIC, true)).toBe("{س/ن}");
    });

    it("does not space square brackets around a letter", () => {
      expect(transliterateText("[s]", LATIN_TO_ARABIC, true)).toBe("[س]");
    });

    it("does not space raw angle brackets around a letter", () => {
      expect(transliterateText("<b>", LATIN_TO_ARABIC, true)).toBe("<ب>");
    });

    it("does not space HTML-entity angle brackets (&lt; / &gt;)", () => {
      expect(transliterateText("&lt;b&gt;", LATIN_TO_ARABIC, true)).toBe(
        "&lt;ب&gt;",
      );
    });

    it("keeps the word gap between two bracketed groups", () => {
      expect(transliterateText("{s} {n}", LATIN_TO_ARABIC, true)).toBe(
        `{س}${WORD_GAP}{ن}`,
      );
    });

    it("keeps a space before an opening brace that follows a letter", () => {
      expect(transliterateText("mʿ{ʾ}", LATIN_TO_ARABIC, true)).toBe(
        "م ع {ا}",
      );
    });

    it("keeps a space after a closing brace before the next letter", () => {
      expect(transliterateText("{ʾ}b", LATIN_TO_ARABIC, true)).toBe("{ا} ب");
    });

    it("spaces brace groups outside but not inside (real reading example)", () => {
      // l-mrʿ{ʾ}{ġ}
      expect(transliterateText("l-mrʿ{ʾ}{ġ}", LATIN_TO_ARABIC, true)).toBe(
        "ل - م ر ع {ا} {غ}",
      );
    });
  });

  describe("transliterateHtml word gaps and symbol attachment", () => {
    it("applies the word gap inside a text node", () => {
      expect(transliterateHtml("<p>b t</p>", LATIN_TO_ARABIC, true)).toBe(
        `<p>ب${WORD_GAP}ت</p>`,
      );
    });

    it("attaches braces/slash with no spaces inside a text node", () => {
      expect(transliterateHtml("<p>{s/n}</p>", LATIN_TO_ARABIC, true)).toBe(
        "<p>{س/ن}</p>",
      );
    });

    it("attaches entity angle brackets with no spaces", () => {
      expect(transliterateHtml("<p>&lt;b&gt;</p>", LATIN_TO_ARABIC, true)).toBe(
        "<p>&lt;ب&gt;</p>",
      );
    });
  });

  describe("transliterateText with multi-character keys", () => {
    it("transliterates 's¹' to 'س' (not 'س¹')", () => {
      expect(transliterateText("s¹", LATIN_TO_ARABIC)).toBe("س");
    });

    it("transliterates 's²' to 'ش' (not 'س²')", () => {
      expect(transliterateText("s²", LATIN_TO_ARABIC)).toBe("ش");
    });

    it("transliterates 's³' to 'س' (not 'س³')", () => {
      expect(transliterateText("s³", LATIN_TO_ARABIC)).toBe("س");
    });

    it("still transliterates a bare 's' to 'س'", () => {
      expect(transliterateText("s", LATIN_TO_ARABIC)).toBe("س");
    });

    it("prefers the multi-character key over its single-character prefix", () => {
      // s² m s¹ -> ش م س = شمس
      expect(transliterateText("s²ms¹", LATIN_TO_ARABIC)).toBe("شمس");
    });

    it("passes a superscript through unchanged when not preceded by 's'", () => {
      expect(transliterateText("¹", LATIN_TO_ARABIC)).toBe("¹");
    });

    it("handles multi-character keys inside HTML", () => {
      expect(transliterateHtml("<p>s²ms¹</p>", LATIN_TO_ARABIC)).toBe(
        "<p>شمس</p>",
      );
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

describe("isTransliterationEnabledValue", () => {
  it("returns true for the boolean true", () => {
    expect(isTransliterationEnabledValue(true)).toBe(true);
  });

  it("returns true for truthy strings (case/whitespace insensitive)", () => {
    expect(isTransliterationEnabledValue("true")).toBe(true);
    expect(isTransliterationEnabledValue(" Yes ")).toBe(true);
    expect(isTransliterationEnabledValue("1")).toBe(true);
  });

  it("returns false for the boolean false", () => {
    expect(isTransliterationEnabledValue(false)).toBe(false);
  });

  it("returns false for falsy / negative strings", () => {
    expect(isTransliterationEnabledValue("false")).toBe(false);
    expect(isTransliterationEnabledValue("No")).toBe(false);
    expect(isTransliterationEnabledValue("")).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isTransliterationEnabledValue(null)).toBe(false);
    expect(isTransliterationEnabledValue(undefined)).toBe(false);
  });
});
