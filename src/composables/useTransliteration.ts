export const transliterateText = (
  text: string,
  map: Record<string, string>,
): string => {
  return [...text].map((char) => map[char] ?? char).join("");
}

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
