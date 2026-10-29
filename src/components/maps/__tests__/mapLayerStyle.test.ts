import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, computed } from "vue";
import WktMap from "../WktMap.vue";
import PointMap from "../PointMap.vue";

// Vue normalises a `style` binding on any component and drops style
// functions, so the map layers must get their style on the layer instance.
const mocks = vi.hoisted(() => ({
  setStyle: vi.fn(),
  getSiteStyle: vi.fn(),
}));

vi.mock("vue3-openlayers", async () => {
  const { defineComponent, h } = await vi.importActual<typeof import("vue")>("vue");
  const passthrough = defineComponent({
    setup: (_, { slots }) => () => h("div", slots.default?.()),
  });
  const vectorLayer = defineComponent({
    setup: (_, { slots, expose }) => {
      expose({ vectorLayer: { setStyle: mocks.setStyle } });
      return () => h("div", slots.default?.());
    },
  });
  return {
    Map: { OlMap: passthrough, OlView: passthrough, OlOverlay: passthrough },
    Layers: { OlTileLayer: passthrough, OlVectorLayer: vectorLayer },
    Sources: {
      OlSourceOsm: passthrough,
      OlSourceXyz: passthrough,
      OlSourceVector: passthrough,
      OlSourceCluster: passthrough,
    },
    MapControls: {},
  };
});

vi.mock("@/composables/useMaps", () => ({
  useMaps: () => ({
    getMarkerFeature: vi.fn(),
    transformDataToWktFeatures: vi.fn().mockReturnValue([]),
    activateNewGeoFilter: vi.fn(),
    getGeojsonPolygonFromMap: vi.fn(),
    getSiteStyle: mocks.getSiteStyle,
    createPointFeature: vi.fn(),
  }),
}));

vi.mock("@/components/maps/useHeatMapDetailPopUp", () => ({
  useHeatMapDetailPopUp: () => ({
    detailPopUp: { isVisible: false },
    setEntityDetailConfigurations: vi.fn(),
    popUpDetailConfiguration: computed(() => undefined),
  }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({ result: ref(null), loading: ref(false) }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const stubs = { MapChrome: true, MapFeaturePopUp: true };

describe("map layer styles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gives the WktMap sites layer the site style", async () => {
    mount(WktMap, {
      props: { wkt: [], entities: [], useFilters: false, geoFilters: undefined },
      global: { stubs },
    });
    await flushPromises();
    expect(mocks.setStyle).toHaveBeenCalledWith(mocks.getSiteStyle);
  });

  it("gives the PointMap cluster layer its cluster style", async () => {
    mount(PointMap, {
      props: { points: [], entities: [], clustering: true },
      global: { stubs },
    });
    await flushPromises();
    expect(mocks.setStyle).toHaveBeenCalledWith(expect.any(Function));
  });
});
