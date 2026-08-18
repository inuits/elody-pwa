import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { useExportXlsx } from "../useExportXlsx";
import { downloadFile } from "@/helpers";

const mocks = vi.hoisted(() => ({
  getStateForRoute: vi.fn(() => null),
  displaySuccessNotification: vi.fn(),
  displayErrorNotification: vi.fn(),
  displayPersistentNotification: vi.fn(),
  closeNotification: vi.fn(),
}));

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({ getStateForRoute: mocks.getStateForRoute }),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displaySuccessNotification: mocks.displaySuccessNotification,
    displayErrorNotification: mocks.displayErrorNotification,
    displayPersistentNotification: mocks.displayPersistentNotification,
    closeNotification: mocks.closeNotification,
  }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ path: "/inscriptions" }),
}));

vi.mock("@/helpers", () => ({
  downloadFile: vi.fn(),
}));

vi.mock("luxon", () => ({
  DateTime: {
    now: () => ({
      toFormat: () => "01.01.2026",
    }),
  },
}));

describe("useExportXlsx", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStateForRoute.mockReturnValue(null);
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["xlsx-bytes"])),
    });
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(Date, "now").mockReturnValue(1000);
  });

  it("shows a persistent in-progress notification before requesting the export", async () => {
    const { exportEntitiesToXlsx } = useExportXlsx();

    await exportEntitiesToXlsx("inscription");

    expect(mocks.displayPersistentNotification).toHaveBeenCalledWith(
      1000,
      "bulk-operations.xlsx-export.in-progress-title",
      "bulk-operations.xlsx-export.in-progress-description",
      "warn",
    );
  });

  it("sends type and the total entity count as limit", async () => {
    mocks.getStateForRoute.mockReturnValue({ totalEntityCount: 137 });
    const { exportEntitiesToXlsx } = useExportXlsx();

    await exportEntitiesToXlsx("inscription");

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/export/xlsx");
    const body = JSON.parse(options.body);
    expect(body).toEqual({ type: "inscription", limit: 137 });
  });

  it("forwards order_by and asc from the current route state when present", async () => {
    mocks.getStateForRoute.mockReturnValue({
      totalEntityCount: 20,
      queryVariables: { searchValue: { order_by: "title", isAsc: 0 } },
    });
    const { exportEntitiesToXlsx } = useExportXlsx();

    await exportEntitiesToXlsx("inscription");

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.order_by).toBe("title");
    expect(body.asc).toBe(0);
  });

  it("closes the in-progress notification, downloads the blob, and shows success on a successful response", async () => {
    const { exportEntitiesToXlsx } = useExportXlsx();

    await exportEntitiesToXlsx("inscription");

    expect(mocks.closeNotification).toHaveBeenCalledWith(1000);
    expect(downloadFile).toHaveBeenCalledWith(
      "inscription_01.01.2026.xlsx",
      expect.any(Blob),
    );
    expect(mocks.displaySuccessNotification).toHaveBeenCalledWith(
      "bulk-operations.xlsx-export.success-title",
      "bulk-operations.xlsx-export.success-description",
    );
  });

  it("closes the in-progress notification and shows an error when the request fails", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("entity type cannot be exported"),
    });
    const { exportEntitiesToXlsx } = useExportXlsx();

    await exportEntitiesToXlsx("inscription");

    expect(mocks.closeNotification).toHaveBeenCalledWith(1000);
    expect(mocks.displayErrorNotification).toHaveBeenCalledWith(
      "bulk-operations.xlsx-export.error.title",
      "entity type cannot be exported",
    );
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it("closes the in-progress notification and shows an error when fetch throws", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    const { exportEntitiesToXlsx } = useExportXlsx();

    await exportEntitiesToXlsx("inscription");
    await flushPromises();

    expect(mocks.closeNotification).toHaveBeenCalledWith(1000);
    expect(mocks.displayErrorNotification).toHaveBeenCalledWith(
      "bulk-operations.xlsx-export.error.title",
      "network down",
    );
  });
});
