import { provide } from "vue";
import type { Decorator } from "@storybook/vue3-vite";
import type { MediaFileEntity } from "@/generated-types/queries";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const SAMPLE_TEXT =
  "Logbook of the research vessel Simon Stevin\nDay 1: left Oostende at 06:00, wind NW 4.\nDay 2: sampling station W08, water temperature 12.4 °C.";

const SAMPLE_PDF = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 420 300] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 60 >> stream
BT /F1 24 Tf 40 150 Td (Sample mediafile PDF) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
trailer << /Root 1 0 R >>
%%EOF`;

export const mediafileFixtures = {
  text: {
    id: "story-text",
    mimetype: "text/plain",
    original_filename: "logbook.txt",
  },
  pdf: {
    id: "story-pdf",
    mimetype: "application/pdf",
    original_filename: "report.pdf",
  },
  image: {
    id: "story-image",
    mimetype: "image/jpeg",
    original_filename: "north-sea.jpg",
    display_filename: "north-sea.jpg",
    filename: "north-sea.jpg",
  },
  audio: {
    id: "story-audio",
    mimetype: "audio/mpeg",
    original_filename: "interview.mp3",
  },
  video: {
    id: "story-video",
    mimetype: "video/mp4",
    original_filename: "launch.mp4",
  },
  externalLink: {
    id: "story-link",
    external_url: "https://www.example.org/collection/item-42",
  },
  unsupported: {
    id: "story-zip",
    mimetype: "application/zip",
    original_filename: "archive.zip",
  },
} as const;

export type MediafileFixtureKey = keyof typeof mediafileFixtures;

export const mediafile = (key: MediafileFixtureKey): MediaFileEntity =>
  ({
    id: mediafileFixtures[key].id,
    uuid: mediafileFixtures[key].id,
    type: "mediafile",
    intialValues: { ...mediafileFixtures[key] },
  }) as unknown as MediaFileEntity;

export const mediafileOptions = Object.keys(
  mediafileFixtures,
) as MediafileFixtureKey[];

export const mediafileMapping = Object.fromEntries(
  mediafileOptions.map((key) => [key, mediafile(key)]),
);

export const mediafileListMapping = Object.fromEntries(
  mediafileOptions.map((key) => [key, [mediafile(key), mediafile("text")]]),
);

const fixtureResponse = (id: string): Response | undefined => {
  if (id === mediafileFixtures.text.id)
    return new Response(SAMPLE_TEXT, {
      headers: { "Content-Type": "text/plain" },
    });
  if (id === mediafileFixtures.pdf.id)
    return new Response(SAMPLE_PDF, {
      headers: { "Content-Type": "application/pdf" },
    });
  return undefined;
};

export const stubMediafileFetch = () => {
  const realFetch = window.fetch;
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input.toString();
    const match = url.match(/\/api\/mediafile\/([^/?]+)/);
    const response = match && fixtureResponse(match[1]);
    return response ? Promise.resolve(response) : realFetch(input, init);
  };
  return () => {
    window.fetch = realFetch;
  };
};

export const withMediafileContext =
  (context: string): Decorator =>
  (story) => ({
    components: { story },
    setup() {
      provide("mediafileViewerContext", context);
      useEntityMediafileSelector().addMediafileSelectionStateContext(context);
    },
    template: `<story />`,
  });
