import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/composables/useListItemHelper", () => ({
  useListItemHelper: () => ({ setHoveredListItem: vi.fn() }),
}));
vi.mock("@/composables/useGraphqlAsync", () => ({
  useGraphqlAsync: () => ({ getQueryDocument: vi.fn(), queryAsync: vi.fn() }),
}));
vi.mock("@/utils/cssToken", () => ({
  readCssToken: () => "#112233",
  withAlpha: (color: string, alpha: number) => `${color}/${alpha}`,
}));

import { useMaps } from "@/composables/useMaps";

const site = (size: number) =>
  ({
    getGeometry: () => ({ getExtent: () => [0, 0, size, size] }),
  }) as any;

describe("useMaps site style", () => {
  beforeEach(() => vi.clearAllMocks());

  it("draws a site in the accent with a 25% fill", () => {
    const [style] = useMaps().getSiteStyle(site(100), 1);
    expect(style.getStroke()?.getColor()).toBe("#112233");
    expect(style.getFill()?.getColor()).toBe("#112233/0.25");
  });

  it("draws a too-small site as an accent dot", () => {
    const [style] = useMaps().getSiteStyle(site(1), 1);
    expect((style.getImage() as any).getFill().getColor()).toBe("#112233");
  });
});
