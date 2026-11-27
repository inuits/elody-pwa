import { afterEach, describe, expect, it, vi } from "vitest";
import { callEntityEndpoint } from "@/composables/endpointAction";

describe("callEntityEndpoint", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("fills $id in the endpoint url and calls it with the given method", async () => {
    const response = { ok: true };
    const fetchMock = vi.fn(() => Promise.resolve(response));
    vi.stubGlobal("fetch", fetchMock);

    const result = await callEntityEndpoint(
      "api/entities/$id/generate-transcodes",
      "post",
      "A-1",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/entities/A-1/generate-transcodes",
      { method: "POST", headers: { "Content-Type": "application/json" } },
    );
    expect(result).toBe(response);
  });

  it("defaults to GET", async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await callEntityEndpoint("api/entities/$id/zip", undefined, "A-1");

    expect(fetchMock).toHaveBeenCalledWith("/api/entities/A-1/zip", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, status: 403 })));

    await expect(
      callEntityEndpoint("api/entities/$id/sync-origins", "POST", "A-1"),
    ).rejects.toThrow("Response status: 403");
  });
});
