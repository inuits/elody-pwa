export const transliterateText = (
  text: string,
  map: Record<string, string>,
  insertSpaces = false,
): string => {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  const units: string[] = [];
  let index = 0;
  while (index < text.length) {
    const matchedKey = keys.find((key) => key && text.startsWith(key, index));
    if (matchedKey) {
      units.push(map[matchedKey]);
      index += matchedKey.length;
    } else {
      const char = String.fromCodePoint(text.codePointAt(index)!);
      units.push(char);
      index += char.length;
    }
  }
  // Map first, then optionally add a space between every unit so cursive scripts
  // (e.g. Arabic) do not visually merge into each other.
  return units.join(insertSpaces ? " " : "");
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
