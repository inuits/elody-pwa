import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEmptyValueLabel } from "@/composables/useEmptyValueLabel";

const mocks = vi.hoisted(() => ({
  t: vi.fn((key: string) => `translated(${key})`),
  te: vi.fn(() => true),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mocks.t, te: mocks.te }),
}));

describe("useEmptyValueLabel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.te.mockReturnValue(true);
  });

  it("returns the translated empty-value label", () => {
    expect(useEmptyValueLabel().value).toBe(
      "translated(metadata.labels.no-value)",
    );
  });

  it("falls back to English when the key is not translated", () => {
    mocks.te.mockReturnValue(false);
    expect(useEmptyValueLabel().value).toBe("No value");
  });
});
