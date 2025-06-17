import ViewModesMap from "../library/view-modes/ViewModesMap.vue";
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
