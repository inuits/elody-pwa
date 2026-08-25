import { describe, it, expect } from "vitest";
import { getEmbeddableUrl, getExternalHttpUrl } from "@/utils/embeddableUrl";

describe("getEmbeddableUrl", () => {
  it("maps YouTube watch, short and shorts urls to the embed player", () => {
    expect(getEmbeddableUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(getEmbeddableUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(getEmbeddableUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("keeps a url that is already an embed url", () => {
    expect(getEmbeddableUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("maps Vimeo and Spotify urls to their players", () => {
    expect(getEmbeddableUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    );
    expect(
      getEmbeddableUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"),
    ).toBe("https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");
  });

  it("wraps SoundCloud urls in the widget player", () => {
    expect(getEmbeddableUrl("https://soundcloud.com/artist/track")).toBe(
      "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fartist%2Ftrack",
    );
  });

  it("returns undefined for anything not known to be embeddable", () => {
    // Framing these would fail with X-Frame-Options and show a blank frame.
    expect(
      getEmbeddableUrl("https://www.standaard.be/some-review"),
    ).toBeUndefined();
    expect(getEmbeddableUrl("https://example.org/trailer.mp4")).toBeUndefined();
  });

  it("rejects anything that is not an absolute http(s) url", () => {
    expect(getEmbeddableUrl("javascript:alert(1)")).toBeUndefined();
    expect(
      getEmbeddableUrl("www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBeUndefined();
    expect(getEmbeddableUrl("")).toBeUndefined();
    expect(getEmbeddableUrl(undefined)).toBeUndefined();
  });
});

describe("getExternalHttpUrl", () => {
  it("accepts absolute http and https urls", () => {
    expect(getExternalHttpUrl("https://example.org/a")).toBe(
      "https://example.org/a",
    );
    expect(getExternalHttpUrl("http://example.org/a")).toBe(
      "http://example.org/a",
    );
  });

  it("rejects scheme-less and non-http schemes, which are unsafe as an href", () => {
    expect(getExternalHttpUrl("www.example.org")).toBeUndefined();
    expect(getExternalHttpUrl("javascript:alert(1)")).toBeUndefined();
    expect(getExternalHttpUrl("")).toBeUndefined();
    expect(getExternalHttpUrl(undefined)).toBeUndefined();
  });
});
