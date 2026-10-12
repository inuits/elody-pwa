import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref, computed, reactive } from "vue";
import WktMap from "../WktMap.vue";

const mocks = vi.hoisted(() => ({
  activateNewGeoFilter: vi.fn(),
  getGeojsonPolygonFromMap: vi.fn().mockReturnValue({}),
  getSiteStyle: vi.fn(),
  detailPopUp: { isVisible: false, position: undefined, entityId: undefined },
}));

vi.mock("@/composables/useMaps", () => ({
  useMaps: () => ({
    getMarkerFeature: vi.fn(),
    transformDataToWktFeatures: vi.fn().mockReturnValue([]),
    activateNewGeoFilter: mocks.activateNewGeoFilter,
    getGeojsonPolygonFromMap: mocks.getGeojsonPolygonFromMap,
    getSiteStyle: mocks.getSiteStyle,
  }),
}));

vi.mock("@/components/maps/useHeatMapDetailPopUp", () => ({
  useHeatMapDetailPopUp: () => ({
    detailPopUp: reactive(mocks.detailPopUp),
    setEntityDetailConfigurations: vi.fn(),
    popUpDetailConfiguration: computed(() => undefined),
  }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({ result: ref(null), loading: ref(false) }),
}));

vi.mock("lodash.debounce", () => ({
  default: (fn: any) => fn,
}));

const makeMap = (zoom: number, clickedFeature?: Record<string, any>) => {
  const view = { getZoom: () => zoom, animate: vi.fn() };
  return {
    view,
    map: {
      getView: () => view,
      forEachFeatureAtPixel: (_pixel: any, callback: (feature: any) => any) =>
        clickedFeature && callback(clickedFeature),
    },
  };
};

const makeFeature = (id: string, bucketCount?: number) => ({
  id_: id,
  getId: () => id,
  get: (key: string) => (key === "bucketCount" ? bucketCount : undefined),
});

const getWrapper = (overrideProps: Record<string, any> = {}) =>
  shallowMount(WktMap, {
    props: {
      wkt: [],
      entities: [],
      useFilters: true,
      filtersBaseApi: {},
      geoFilters: {},
      ...overrideProps,
    },
  });

describe("WktMap geo buckets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.detailPopUp, {
      isVisible: false,
      position: undefined,
      entityId: undefined,
    });
  });

  it("asks for buckets below bucketUntilZoom", () => {
    const wrapper = getWrapper({ bucketUntilZoom: 12 });
    wrapper.vm.mapRef = makeMap(10);
    wrapper.vm.handleMoveBoundingBox();
    expect(mocks.activateNewGeoFilter.mock.calls[0][3]).toBe(35);
  });

  it("asks for real sites from bucketUntilZoom on", () => {
    const wrapper = getWrapper({ bucketUntilZoom: 12 });
    wrapper.vm.mapRef = makeMap(12);
    wrapper.vm.handleMoveBoundingBox();
    expect(mocks.activateNewGeoFilter.mock.calls[0][3]).toBeUndefined();
  });

  it("never asks for buckets without bucketUntilZoom", () => {
    const wrapper = getWrapper();
    wrapper.vm.mapRef = makeMap(3);
    wrapper.vm.handleMoveBoundingBox();
    expect(mocks.activateNewGeoFilter.mock.calls[0][3]).toBeUndefined();
  });

  it("builds the viewport polygon in the active projection", () => {
    const wrapper = getWrapper();
    const mapRef = makeMap(10);
    wrapper.vm.mapRef = mapRef;
    wrapper.vm.handleMoveBoundingBox();
    expect(mocks.getGeojsonPolygonFromMap).toHaveBeenCalledWith(
      mapRef.map,
      "EPSG:4326",
    );
  });

  it("zooms in on a bucket holding several sites", () => {
    const wrapper = getWrapper({ bucketUntilZoom: 12 });
    const mapRef = makeMap(9, makeFeature("site-1", 5));
    wrapper.vm.mapRef = mapRef;
    wrapper.vm.handleMapClick({ pixel: [0, 0], coordinate: [37.9, 26.7] });
    expect(mapRef.view.animate).toHaveBeenCalledWith(
      expect.objectContaining({ center: [37.9, 26.7], zoom: 11 }),
    );
    expect(mocks.detailPopUp.isVisible).toBe(false);
  });

  it("requests the viewport as soon as the geo filter arrives", async () => {
    const wrapper = getWrapper({ bucketUntilZoom: 12, geoFilters: undefined });
    wrapper.vm.mapRef = makeMap(9);
    await wrapper.setProps({ geoFilters: {} });
    expect(mocks.activateNewGeoFilter).toHaveBeenCalledTimes(1);
    expect(mocks.activateNewGeoFilter.mock.calls[0][3]).toBe(35);
  });

  it("does not request the viewport when filters are off", async () => {
    const wrapper = getWrapper({ useFilters: false, geoFilters: undefined });
    wrapper.vm.mapRef = makeMap(9);
    await wrapper.setProps({ geoFilters: {} });
    expect(mocks.activateNewGeoFilter).not.toHaveBeenCalled();
  });

  it("opens the popup for a single-site bucket", () => {
    const wrapper = getWrapper({ bucketUntilZoom: 12 });
    const mapRef = makeMap(9, makeFeature("site-1", 1));
    wrapper.vm.mapRef = mapRef;
    wrapper.vm.handleMapClick({ pixel: [0, 0], coordinate: [37.9, 26.7] });
    expect(mapRef.view.animate).not.toHaveBeenCalled();
    expect(mocks.detailPopUp.entityId).toBe("site-1");
    expect(mocks.detailPopUp.isVisible).toBe(true);
  });
});

describe("WktMap sites layer", () => {
  it("styles sites with the site style", () => {
    const wrapper = getWrapper();
    expect(wrapper.vm.getSiteStyle).toBe(mocks.getSiteStyle);
  });
});

describe("WktMap cursor", () => {
  const mapWithFeatureUnderPointer = (hasFeature: boolean) => {
    const target = { style: { cursor: "" } };
    return {
      target,
      mapRef: {
        map: {
          getTargetElement: () => target,
          hasFeatureAtPixel: () => hasFeature,
        },
      },
    };
  };

  it("shows a pointer over a site or bucket", () => {
    const wrapper = getWrapper();
    const { target, mapRef } = mapWithFeatureUnderPointer(true);
    wrapper.vm.mapRef = mapRef;
    wrapper.vm.handlePointerMove({ pixel: [0, 0], dragging: false });
    expect(target.style.cursor).toBe("pointer");
  });

  it("resets the cursor over empty map", () => {
    const wrapper = getWrapper();
    const { target, mapRef } = mapWithFeatureUnderPointer(false);
    target.style.cursor = "pointer";
    wrapper.vm.mapRef = mapRef;
    wrapper.vm.handlePointerMove({ pixel: [0, 0], dragging: false });
    expect(target.style.cursor).toBe("");
  });
});
