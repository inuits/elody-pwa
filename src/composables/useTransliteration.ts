const OPEN_SYMBOLS = new Set(["{", "[", "<", "&lt;"]);
const CLOSE_SYMBOLS = new Set(["}", "]", ">", "&gt;"]);
const TIGHT_SYMBOLS = new Set(["/"]);

const MULTI_CHAR_TOKENS = ["&lt;", "&gt;"];

const attachesWithoutSpace = (previous: string, current: string): boolean =>
  OPEN_SYMBOLS.has(previous) ||
  CLOSE_SYMBOLS.has(current) ||
  TIGHT_SYMBOLS.has(previous) ||
  TIGHT_SYMBOLS.has(current);

const WORD_GAP = "\u00A0\u00A0";

export const transliterateText = (
  text: string,
  map: Record<string, string>,
  insertSpaces = false,
): string => {
  const matchCandidates = [...Object.keys(map), ...MULTI_CHAR_TOKENS].sort(
    (a, b) => b.length - a.length,
  );
  const units: string[] = [];
  let index = 0;
  while (index < text.length) {
    const matchedKey = matchCandidates.find(
      (key) => key && text.startsWith(key, index),
    );
    if (matchedKey) {
      units.push(map[matchedKey] ?? matchedKey);
      index += matchedKey.length;
    } else {
      const char = String.fromCodePoint(text.codePointAt(index)!);
      units.push(char);
      index += char.length;
    }
  }

  if (!insertSpaces) return units.join("");

  let result = "";
  let previousUnit = "";
  let pendingWordBreak = false;
  for (const unit of units) {
    if (/^\s+$/.test(unit)) {
      pendingWordBreak = true;
      continue;
    }
    if (previousUnit === "") {
      result = unit;
    } else if (attachesWithoutSpace(previousUnit, unit)) {
      result += unit;
    } else if (pendingWordBreak) {
      result += WORD_GAP + unit;
    } else {
      result += " " + unit;
    }
    previousUnit = unit;
    pendingWordBreak = false;
  }
  return result;
};

// Regex covers TipTap-generated HTML only: attribute values never contain raw > chars.
export const transliterateHtml = (
  html: string,
  map: Record<string, string>,
  insertSpaces = false,
): string => {
  return html.replace(/(<[^>]*>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag;
    if (text) return transliterateText(text, map, insertSpaces);
    return match;
  });
};

export const isTransliterationEnabledValue = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === "string") {
    return ["true", "yes", "1"].includes(value.trim().toLowerCase());
  }
  return false;
};

export type UseTransliterationReturn = {
  transliterateText: (
    text: string,
    map: Record<string, string>,
    insertSpaces?: boolean,
  ) => string;
  transliterateHtml: (
    html: string,
    map: Record<string, string>,
    insertSpaces?: boolean,
  ) => string;
};

export const useTransliteration = () => {
  return { transliterateText, transliterateHtml };
};
