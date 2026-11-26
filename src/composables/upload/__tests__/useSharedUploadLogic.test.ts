import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSharedUploadLogic } from "../useSharedUploadLogic";
import { DuplicateMediafileError } from "../types";

const handleHttpError = vi.fn(async () => "Error");
const linkDocument = vi.hoisted(() => ({ value: "LinkDocument" as unknown }));

vi.mock("@/composables/useErrorCodes", () => ({
  useErrorCodes: () => ({ handleHttpError }),
}));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: async () => linkDocument.value }),
}));
// Shared like the module-level refs of useUploadState: every
// useSharedUploadLogic() call (one per file) sees the same batch result.
const uploadState = vi.hoisted(() => ({
  prefetchedUploadUrls: { value: [] as string[] },
  batchUploadError: { value: undefined as string | undefined },
  containsFileOfType: { value: {} as Record<string, boolean> },
  batchEntities: vi.fn(),
}));

vi.mock("@/composables/upload/useUpload", () => ({
  default: () => ({
    ...uploadState,
    getCsvBlob: () => new Blob(["same_entity,title"]),
    updateFileThumbnails: vi.fn(),
  }),
}));

const respondWith = (message: string, asPlainString = false) => {
  global.fetch = vi.fn(async () => {
    const body = JSON.stringify({
      extensions: { response: { body: asPlainString ? message : { message } } },
    });
    return new Response(body, { status: 409 });
  }) as any;
};
const duplicateMessage =
  "W2004 | prefix: | duplicate_keys:sheep.JPEG - Entity with following identifiers already exists: sheep.JPEG";

describe("useSharedUploadLogic - getUploadUrlForMediafileOnEntity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkDocument.value = "LinkDocument";
  });

  const getUrl = () =>
    useSharedUploadLogic().getUploadUrlForMediafileOnEntity("A01", {
      name: "sheep.JPEG",
    } as any);

  it("reports a duplicate identifier as the existing mediafile, without an error toast", async () => {
    respondWith(duplicateMessage);

    const error = await getUrl().catch((error) => error);

    expect(error).toBeInstanceOf(DuplicateMediafileError);
    expect(error.existingId).toBe("sheep.JPEG");
    expect(handleHttpError).not.toHaveBeenCalled();
  });

  it("reads a duplicate identifier from a plain-string error body", async () => {
    respondWith(duplicateMessage, true);

    const error = await getUrl().catch((error) => error);

    expect(error).toBeInstanceOf(DuplicateMediafileError);
    expect(error.existingId).toBe("sheep.JPEG");
  });

  it("keeps the plain error when the client lacks the link mutation", async () => {
    linkDocument.value = undefined;
    respondWith(duplicateMessage);

    await expect(getUrl()).rejects.toBe("Error");
    expect(handleHttpError).toHaveBeenCalled();
  });

  it("keeps the plain error for other failures", async () => {
    respondWith("W0001 | something else");

    await expect(getUrl()).rejects.toBe("Error");
    expect(handleHttpError).toHaveBeenCalled();
  });
});

describe("useSharedUploadLogic - getUploadUrl for a CSV batch", () => {
  const importErrors = {
    errors: {
      entities: [
        "2) keyword 'haven' does not exist",
        "2) partnerElody 'https://marineinfo.org/id/institute/36' does not exist",
      ],
      mediafiles: [],
    },
    job_id: "job-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    uploadState.prefetchedUploadUrls.value = [];
    uploadState.batchUploadError.value = undefined;
    uploadState.containsFileOfType.value = { csv: true };
  });

  const getUrl = (name: string) =>
    useSharedUploadLogic().getUploadUrl({ name } as any);

  it("gives the upload link of each file when the import succeeds", async () => {
    uploadState.batchEntities.mockResolvedValue({
      links: [
        "http://storage/upload-with-ticket/IMG_7534.JPG?id=MED-1",
        "http://storage/upload-with-ticket/IMG_7535.JPG?id=MED-2",
      ],
    });

    expect(await getUrl("IMG_7535.JPG")).toContain("IMG_7535.JPG");
    expect(await getUrl("IMG_7534.JPG")).toContain("IMG_7534.JPG");
    expect(uploadState.batchEntities).toHaveBeenCalledTimes(1);
  });

  it("shows the import's own errors when the import fails", async () => {
    uploadState.batchEntities.mockResolvedValue(importErrors);

    const error = await getUrl("IMG_7534.JPG").catch((error) => error);

    expect(error).toBe(
      "2) keyword 'haven' does not exist\n" +
        "2) partnerElody 'https://marineinfo.org/id/institute/36' does not exist",
    );
  });

  it("does not send the CSV again for every other file of a failed import", async () => {
    uploadState.batchEntities.mockResolvedValue(importErrors);

    await getUrl("IMG_7534.JPG").catch(() => undefined);
    const error = await getUrl("IMG_7535.JPG").catch((error) => error);

    expect(error).toContain("keyword 'haven' does not exist");
    expect(uploadState.batchEntities).toHaveBeenCalledTimes(1);
  });

  it("still says the import failed when the error has no details", async () => {
    uploadState.batchEntities.mockResolvedValue({});

    const error = await getUrl("IMG_7534.JPG").catch((error) => error);

    expect(typeof error).toBe("string");
    expect(error).not.toMatch(/TypeError/);
    expect(error.length).toBeGreaterThan(0);
  });
});
