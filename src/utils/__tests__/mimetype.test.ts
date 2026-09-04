import { describe, expect, it } from "vitest";
import { getViewerForMimetype } from "@/utils/mimetype";
import { ElodyViewers } from "@/generated-types/queries";

describe("getViewerForMimetype", () => {
  it("maps top-level types to their viewer", () => {
    expect(getViewerForMimetype("text/csv")).toBe(ElodyViewers.Text);
    expect(getViewerForMimetype("text/plain; charset=utf-8")).toBe(
      ElodyViewers.Text,
    );
    expect(getViewerForMimetype("image/tiff")).toBe(ElodyViewers.Iiif);
    expect(getViewerForMimetype("audio/mpeg")).toBe(ElodyViewers.Audio);
    expect(getViewerForMimetype("video/mp4")).toBe(ElodyViewers.Video);
    expect(getViewerForMimetype("application/pdf")).toBe(ElodyViewers.Pdf);
  });

  it("does not match the subtype against top-level types", () => {
    expect(
      getViewerForMimetype("application/vnd.oasis.opendocument.text"),
    ).toBeUndefined();
    expect(getViewerForMimetype("application/zip")).toBeUndefined();
  });

  it("returns undefined for missing or malformed values", () => {
    expect(getViewerForMimetype(undefined)).toBeUndefined();
    expect(getViewerForMimetype("")).toBeUndefined();
    expect(getViewerForMimetype("text")).toBeUndefined();
  });
});
