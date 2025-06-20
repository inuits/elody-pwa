import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMapCenter } from "@/composables/useMapCenter";
import { getValueForPanelMetadata } from "@/helpers";
import { MapTypes } from "@/generated-types/queries";
import type { MapElement } from "@/generated-types/queries";

vi.mock("@/helpers", () => ({
  getValueForPanelMetadata: vi.fn(),
}));

describe("useMapCenter", () => {
  const mockElement = (type: MapTypes, centerKey: string): MapElement => ({
    type,
    center: centerKey,
    label: "test",
    isCollapsed: false,
    config: {},
    __typename: "MapElement",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HeatMap type", () => {
    it("returns normalized coordinates for HeatMap when metadata exists", () => {
      const element = mockElement(MapTypes.HeatMap, "gps_coordinates");
      vi.mocked(getValueForPanelMetadata).mockReturnValue([10, 20]);

      const { center } = useMapCenter(element, "entity1");
      expect(center.value).toEqual([20, 10]);
    });

    it("returns empty array when metadata is missing for HeatMap", () => {
      const element = mockElement(MapTypes.HeatMap, "gps_coordinates");
      vi.mocked(getValueForPanelMetadata).mockReturnValue(null);

      const { center } = useMapCenter(element, "entity1");
      expect(center.value).toEqual([]);
    });
  });

  describe("Wkt type", () => {
    it("returns correct coordinates for Wkt when metadata exists", () => {
      const element = mockElement(MapTypes.WktMap, "coordinates");
      vi.mocked(getValueForPanelMetadata).mockReturnValue({
        latitude: 30,
        longitude: 40,
      });

      const { center } = useMapCenter(element, "entity1");
      expect(center.value).toEqual([30, 40]);
    });

    it("returns empty array when metadata is missing for Wkt", () => {
      const element = mockElement(MapTypes.WktMap, "coordinates");
      vi.mocked(getValueForPanelMetadata).mockReturnValue(null);

      const { center } = useMapCenter(element, "entity1");
      expect(center.value).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("returns empty array for unknown map type", () => {
      const element = {
        ...mockElement(MapTypes.WktMap, "gps_coordinates"),
        type: "UnknownType" as any,
      };
      vi.mocked(getValueForPanelMetadata).mockReturnValue([10, 20]);

      const { center } = useMapCenter(element, "entity1");
      expect(center.value).toEqual([]);
    });

    it("returns empty array when center key is not provided", () => {
      const element = {
        ...mockElement(MapTypes.WktMap, "coordinates"),
        center: undefined as any,
      };
      vi.mocked(getValueForPanelMetadata).mockReturnValue("");

      const { center } = useMapCenter(element, "entity1");
      expect(center.value).toEqual([]);
    });
  });
});
