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
vi.mock("@/composables/upload/useUpload", () => ({
  default: () => ({
    prefetchedUploadUrls: { value: [] },
    containsFileOfType: { value: {} },
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
