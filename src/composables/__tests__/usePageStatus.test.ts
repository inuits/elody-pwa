import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePageStatus } from "@/composables/usePageStatus";
import { PageStatus } from "@/generated-types/queries";

const mockClearBreadcrumbs = vi.fn();
vi.mock("@/composables/useBreadcrumbs", () => ({
  useBreadcrumbs: () => ({
    clearBreadcrumbPathAndAddOverviewPage: mockClearBreadcrumbs,
  }),
}));

describe("usePageStatus", () => {
  beforeEach(() => {
    const { resetPageStatus } = usePageStatus();
    resetPageStatus();
    vi.clearAllMocks();
  });

  it("should initialize with Success status", () => {
    const { pageStatus } = usePageStatus();
    expect(pageStatus.value).toBe(PageStatus.Success);
  });

  it("should update the status when setPageStatus is called", () => {
    const { pageStatus, setPageStatus } = usePageStatus();
    setPageStatus(PageStatus.NotFound);
    expect(pageStatus.value).toBe(PageStatus.NotFound);
  });

  it("should reset to Success when resetPageStatus is called", () => {
    const { pageStatus, setPageStatus, resetPageStatus } = usePageStatus();
    setPageStatus(PageStatus.Forbidden);
    resetPageStatus();
    expect(pageStatus.value).toBe(PageStatus.Success);
  });

  it("should trigger breadcrumb update when status changes to an error", async () => {
    const { setPageStatus } = usePageStatus();

    setPageStatus(PageStatus.NotFound);

    await vi.waitFor(() => {
      expect(mockClearBreadcrumbs).toHaveBeenCalledWith(PageStatus.NotFound);
    });
  });

  it("should NOT trigger breadcrumb update when status is Success", async () => {
    const { setPageStatus, resetPageStatus } = usePageStatus();

    setPageStatus(PageStatus.NotFound);
    vi.clearAllMocks();

    resetPageStatus();

    expect(mockClearBreadcrumbs).not.toHaveBeenCalled();
  });
});
