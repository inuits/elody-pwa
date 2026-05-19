import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref, computed } from "vue";
import { MapViews } from "@/generated-types/queries";
import PointMap from "../PointMap.vue";

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  createPointFeature: vi.fn().mockReturnValue({ setId: vi.fn(), getGeometry: vi.fn() }),
  activateNewGeoFilter: vi.fn(),
  getGeojsonPolygonFromMap: vi.fn().mockReturnValue({}),
}));

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/composables/useMaps", () => ({
  useMaps: () => ({
    createPointFeature: mocks.createPointFeature,
    activateNewGeoFilter: mocks.activateNewGeoFilter,
    getGeojsonPolygonFromMap: mocks.getGeojsonPolygonFromMap,
  }),
}));

vi.mock("@/components/maps/useHeatMapDetailPopUp", () => ({
  useHeatMapDetailPopUp: () => ({
    detailPopUp: { isVisible: false, position: undefined, entityId: undefined },
    setEntityDetailConfigurations: vi.fn(),
    popUpDetailConfiguration: computed(() => undefined),
  }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({
    result: ref(null),
    loading: ref(false),
  }),
}));

vi.mock("lodash.debounce", () => ({
  default: (fn: any) => fn,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makePoint = (id: string, lat = 51.0, lon = 4.5) => ({ id, lat, lon });

const getWrapper = (overrideProps: Record<string, any> = {}) =>
  shallowMount(PointMap, {
    props: {
      points: [],
      entities: [],
      ...overrideProps,
    },
  });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PointMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without errors with minimal props", () => {
    expect(() => getWrapper()).not.toThrow();
  });

  it("renders without errors with points", () => {
    expect(() =>
      getWrapper({ points: [makePoint("e-1"), makePoint("e-2")] }),
    ).not.toThrow();
  });

  it("clustering defaults to false", () => {
    const wrapper = getWrapper();
    expect(wrapper.vm.clustering).toBe(false);
  });

  it("detail popup is hidden by default", () => {
    const wrapper = getWrapper();
    expect(wrapper.vm.detailPopUp.isVisible).toBe(false);
  });

  it("uses EPSG:3857 projection for Standard map view", () => {
    const wrapper = getWrapper({ mapView: MapViews.Standard });
    expect(wrapper.vm.activeProjection).toBe("EPSG:3857");
  });

  it("uses EPSG:4326 projection for Satellite map view", () => {
    const wrapper = getWrapper({ mapView: MapViews.Satellite });
    expect(wrapper.vm.activeProjection).toBe("EPSG:4326");
  });

  it("calls createPointFeature for each point with the correct projection", () => {
    getWrapper({
      points: [makePoint("e-1"), makePoint("e-2")],
      mapView: MapViews.Satellite,
    });
    expect(mocks.createPointFeature).toHaveBeenCalledTimes(2);
    expect(mocks.createPointFeature).toHaveBeenCalledWith(51.0, 4.5, "e-1", "EPSG:4326");
  });

  it("calls createPointFeature with EPSG:3857 for Standard map view", () => {
    getWrapper({ points: [makePoint("e-1")], mapView: MapViews.Standard });
    expect(mocks.createPointFeature).toHaveBeenCalledWith(51.0, 4.5, "e-1", "EPSG:3857");
  });

  describe("clusterStyle", () => {
    it("returns a style for a single-feature cluster", () => {
      const wrapper = getWrapper({ clustering: true });
      const mockFeature = {
        get: vi.fn().mockReturnValue([{ getId: () => "e-1" }]),
      };
      const style = wrapper.vm.clusterStyle(mockFeature);
      expect(style).toBeDefined();
      expect(style).not.toBeNull();
    });

    it("returns a style for a multi-feature cluster", () => {
      const wrapper = getWrapper({ clustering: true });
      const mockFeature = {
        get: vi.fn().mockReturnValue([
          { getId: () => "e-1" },
          { getId: () => "e-2" },
          { getId: () => "e-3" },
        ]),
      };
      const style = wrapper.vm.clusterStyle(mockFeature);
      expect(style).toBeDefined();
      expect(style).not.toBeNull();
    });

    it("returns different style objects for single vs multi-feature clusters", () => {
      const wrapper = getWrapper({ clustering: true });
      const single = { get: vi.fn().mockReturnValue([{ getId: () => "e-1" }]) };
      const multi = { get: vi.fn().mockReturnValue([{ getId: () => "e-1" }, { getId: () => "e-2" }]) };
      expect(wrapper.vm.clusterStyle(single)).not.toBe(wrapper.vm.clusterStyle(multi));
    });

    it("returns cached style for same cluster size", () => {
      const wrapper = getWrapper({ clustering: true });
      const feature = { get: vi.fn().mockReturnValue([{ getId: () => "e-1" }, { getId: () => "e-2" }]) };
      expect(wrapper.vm.clusterStyle(feature)).toBe(wrapper.vm.clusterStyle(feature));
    });
  });
});
