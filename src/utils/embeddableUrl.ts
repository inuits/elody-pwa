export const getExternalHttpUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
};

export const getEmbeddableUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string" || !value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;

  const host = url.hostname.replace(/^www\./, "");
  const youtubeEmbed = (id: string) =>
    id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;

  switch (host) {
    case "youtube.com":
    case "youtube-nocookie.com": {
      if (url.pathname.startsWith("/embed/")) return url.href;
      const shorts = url.pathname.match(/^\/shorts\/([^/]+)/);
      if (shorts) return youtubeEmbed(shorts[1]);
      return youtubeEmbed(url.searchParams.get("v") || "");
    }
    case "youtu.be":
      return youtubeEmbed(url.pathname.slice(1).split("/")[0]);
    case "vimeo.com": {
      if (url.pathname.startsWith("/video/")) return url.href;
      const id = url.pathname.slice(1).split("/")[0];
      return /^\d+$/.test(id)
        ? `https://player.vimeo.com/video/${id}`
        : undefined;
    }
    case "player.vimeo.com":
      return url.href;
    case "open.spotify.com": {
      if (url.pathname.startsWith("/embed/")) return url.href;
      return `https://open.spotify.com/embed${url.pathname}`;
    }
    case "soundcloud.com":
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url.href)}`;
    case "w.soundcloud.com":
      return url.href;
    default:
      return undefined;
  }
};
