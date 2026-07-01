export const transliterateText = (
  text: string,
  map: Record<string, string>,
): string => {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  let result = "";
  let index = 0;
  while (index < text.length) {
    const matchedKey = keys.find((key) => key && text.startsWith(key, index));
    if (matchedKey) {
      result += map[matchedKey];
      index += matchedKey.length;
    } else {
      const char = String.fromCodePoint(text.codePointAt(index)!);
      result += char;
      index += char.length;
    }
  }
  return result;
};

// Regex covers TipTap-generated HTML only: attribute values never contain raw > chars.
export const transliterateHtml = (
  html: string,
  map: Record<string, string>,
): string => {
  return html.replace(/(<[^>]*>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag;
    if (text) return transliterateText(text, map);
    return match;
  });
};

export type UseTransliterationReturn = {
  transliterateText: (text: string, map: Record<string, string>) => string;
  transliterateHtml: (html: string, map: Record<string, string>) => string;
};

export const useTransliteration = () => {
  return { transliterateText, transliterateHtml };
};
