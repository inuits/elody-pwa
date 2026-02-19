import { describe, it, expect, vi, beforeEach } from "vitest";

let fetchDocuments: typeof import("@/composables/useDocumentFetcher").fetchDocuments;
let getDocument: typeof import("@/composables/useDocumentFetcher").getDocument;

const mockDocuments = {
  GetEntitiesDocument: { kind: "Document", definitions: [{ kind: "OperationDefinition" }] },
  GetFiltersDocument: { kind: "Document", definitions: [{ kind: "OperationDefinition" }] },
};

beforeEach(async () => {
  vi.resetModules();
  vi.restoreAllMocks();
  const mod = await import("@/composables/useDocumentFetcher");
  fetchDocuments = mod.fetchDocuments;
  getDocument = mod.getDocument;
});

describe("fetchDocuments", () => {
  it("fetches documents from /api/documents and caches them", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDocuments),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchDocuments();

    expect(mockFetch).toHaveBeenCalledWith("/api/documents", { cache: "no-store" });
    expect(result).toEqual(mockDocuments);
  });

  it("returns cached documents on subsequent calls without re-fetching", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDocuments),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchDocuments();
    const result = await fetchDocuments();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockDocuments);
  });

  it("sets empty cache and returns {} on non-ok response", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    }));

    const result = await fetchDocuments();

    expect(result).toEqual({});
    expect(consoleError).toHaveBeenCalledWith("Failed to fetch documents: 500");
  });

  it("sets empty cache and returns {} on network error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const result = await fetchDocuments();

    expect(result).toEqual({});
    expect(consoleError).toHaveBeenCalledWith("Failed to fetch documents: Network error");
  });

  it("logs the number of loaded document nodes on success", async () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDocuments),
    }));

    await fetchDocuments();

    expect(consoleLog).toHaveBeenCalledWith("Loaded 2 GraphQL document nodes");
  });
});

describe("getDocument", () => {
  it("returns the document by name after fetchDocuments has been called", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDocuments),
    }));
    await fetchDocuments();

    const doc = getDocument("GetEntitiesDocument");

    expect(doc).toEqual(mockDocuments.GetEntitiesDocument);
  });

  it("returns undefined and warns when called before fetchDocuments", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const doc = getDocument("GetEntitiesDocument");

    expect(doc).toBeUndefined();
    expect(consoleWarn).toHaveBeenCalledWith(
      'getDocument("GetEntitiesDocument") called before documents were loaded. Call fetchDocuments() first.',
    );
  });

  it("returns undefined and warns when document name is not found", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDocuments),
    }));
    await fetchDocuments();

    const doc = getDocument("NonExistentDocument");

    expect(doc).toBeUndefined();
    expect(consoleWarn).toHaveBeenCalledWith(
      'Document "NonExistentDocument" not found in cached documents.',
    );
  });

  it("returns undefined without warning for missing doc after a failed fetch", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await fetchDocuments();

    const doc = getDocument("GetEntitiesDocument");

    expect(doc).toBeUndefined();
    expect(consoleWarn).toHaveBeenCalledWith(
      'Document "GetEntitiesDocument" not found in cached documents.',
    );
  });
});
