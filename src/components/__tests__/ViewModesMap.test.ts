import ViewModesMap from "../library/view-modes/ViewModesMap.vue";
import WktMap from "../maps/WktMap.vue";
import PointMap from "../maps/PointMap.vue";
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { MapTypes } from "@/generated-types/queries";

describe("ViewModesMap center coordinates functionality", () => {
  const mockConfig = [
    {
      key: "mapType",
      value: MapTypes.WktMap,
    },
  ];

  const mockEntities = [
    {
      type: "type1",
      intialValues: {
        map_location: "POINT(10 20)",
        gps_coordinates: { latitude: 10, longitude: 20 },
      },
    },
    {
      type: "type2",
      intialValues: {
        map_location: "POINT(30 40)",
        gps_coordinates: { latitude: 30, longitude: 40 },
      },
    },
    {
      type: "type3",
      intialValues: {
        map_location: null,
        gps_coordinates: null,
      },
    },
  ];

  it("should use the entity with specified entityTypeAsCenterPoint as center", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        config: mockConfig,
        entities: mockEntities,
        entityTypeAsCenterPoint: "type2",
      },
    });

    expect(wrapper.vm.center).toEqual([30, 40]);
  });

  it("should fall back to first entity when entityTypeAsCenterPoint is not found", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        config: mockConfig,
        entities: mockEntities,
        entityTypeAsCenterPoint: "nonexistent-type",
      },
    });

    expect(wrapper.vm.center).toEqual([10, 20]);
  });

  it("should use first entity as center when entityTypeAsCenterPoint is not provided", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        config: mockConfig,
        entities: mockEntities,
      },
    });

    expect(wrapper.vm.center).toEqual([10, 20]);
  });

  it("should handle empty entities array gracefully", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        config: mockConfig,
        entities: [],
        entityTypeAsCenterPoint: "type1",
      },
    });

    expect(wrapper.vm.center).toBeUndefined();
  });

  it("should handle entities with null coordinates gracefully", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        config: mockConfig,
        entities: [mockEntities[2]],
        entityTypeAsCenterPoint: "type3",
      },
    });

    expect(wrapper.vm.center).toBeUndefined();
  });
});

describe("ViewModesMap Points mode routing", () => {
  const makePointsConfig = (options: { withPointsConfig?: boolean; clustering?: boolean } = {}) => {
    const { withPointsConfig = true, clustering } = options;
    return withPointsConfig
      ? [{ key: "pointsConfig", value: { keyToExtractCoordinates: "gps_coordinates", ...(clustering !== undefined && { clustering }) } }]
      : [];
  };

  const makeEntities = (withCoords = true) => [
    {
      id: "e-1",
      type: "type1",
      intialValues: {
        map_location: "POINT(4.5 51.0)",
        gps_coordinates: withCoords ? { latitude: 51.0, longitude: 4.5 } : null,
      },
    },
    {
      id: "e-2",
      type: "type2",
      intialValues: {
        map_location: "POINT(5.0 52.0)",
        gps_coordinates: withCoords ? { latitude: 52.0, longitude: 5.0 } : null,
      },
    },
  ];

  it("renders PointMap when mapType is PointsMap", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig(),
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.findComponent(PointMap).exists()).toBe(true);
  });

  it("does not render WktMap when mapType is PointsMap", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig(),
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.findComponent(WktMap).exists()).toBe(false);
  });

  it("renders WktMap (not PointMap) when mapType is WktMap", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.WktMap,
        config: [{ key: "mapType", value: MapTypes.WktMap }],
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.findComponent(WktMap).exists()).toBe(true);
    expect(wrapper.findComponent(PointMap).exists()).toBe(false);
  });

  it("pointsData extracts lat/lon from pointsConfig.keyToExtractCoordinates", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig(),
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.vm.pointsData).toEqual([
      { id: "e-1", lat: 51.0, lon: 4.5 },
      { id: "e-2", lat: 52.0, lon: 5.0 },
    ]);
  });

  it("pointsData is empty when pointsConfig is missing", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig({ withPointsConfig: false }),
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.vm.pointsData).toHaveLength(0);
  });

  it("passes clustering=true to PointMap when pointsConfig.clustering is true", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig({ clustering: true }),
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.findComponent(PointMap).props("clustering")).toBe(true);
  });

  it("passes clustering=false to PointMap when pointsConfig.clustering is false", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig({ clustering: false }),
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.findComponent(PointMap).props("clustering")).toBe(false);
  });

  it("passes clustering=false to PointMap when pointsConfig.clustering is not set", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig(),
        entities: makeEntities(),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.findComponent(PointMap).props("clustering")).toBe(false);
  });

  it("pointsData filters out entities with null coordinates", () => {
    const entities = [
      ...makeEntities(true),
      {
        id: "e-3",
        type: "type3",
        intialValues: { map_location: null, gps_coordinates: null },
      },
    ];
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig(),
        entities,
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.vm.pointsData).toHaveLength(2);
    expect(wrapper.vm.pointsData.every((p: any) => p.lat != null && p.lon != null)).toBe(true);
  });

  it("pointsData is empty when entities have no coordinates", () => {
    const wrapper = mount(ViewModesMap, {
      props: {
        mapType: MapTypes.PointsMap,
        config: makePointsConfig(),
        entities: makeEntities(false),
        entityTypeAsCenterPoint: "type1",
        centerCoordinatesKey: "gps_coordinates",
      },
    });
    expect(wrapper.vm.pointsData).toHaveLength(0);
  });
});
