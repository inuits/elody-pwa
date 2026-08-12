import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewModesMap from "./ViewModesMap.vue";
import {
  type ConfigItem,
  type Entity,
  MapTypes,
} from "@/generated-types/queries";

// Map behavior (zoom, center, per-map-type settings) is config-driven, exactly
// as it arrives from the GraphQL view-mode configuration.
const pointsMapConfig = [
  { key: "center", value: [51.0543, 3.7174] },
  { key: "zoom", value: 8 },
  { key: "mapView", value: "standard" },
  {
    key: "pointsConfig",
    value: { keyToExtractCoordinates: "gps_coordinates", clustering: false },
  },
] as unknown as ConfigItem[];

const makeEntity = (
  id: string,
  latitude: number,
  longitude: number,
): Entity =>
  ({
    __typename: "BaseEntity",
    id,
    uuid: id,
    type: "asset",
    intialValues: {
      __typename: "IntialValues",
      gps_coordinates: { latitude, longitude },
    },
    teaserMetadata: {},
    relationValues: {},
  }) as unknown as Entity;

const entities = [
  makeEntity("find-1", 51.0543, 3.7174), // Ghent
  makeEntity("find-2", 51.2194, 4.4025), // Antwerp
  makeEntity("find-3", 50.8503, 4.3517), // Brussels
];

const meta: Meta<typeof ViewModesMap> = {
  title: "Library/ViewModes/ViewModesMap",
  component: ViewModesMap,
  tags: ["autodocs"],
  // The map fills its container, so stories render it in a sized box.
  render: (args) => ({
    components: { ViewModesMap },
    setup: () => ({ args }),
    template:
      '<div class="w-[48rem] p-4"><ViewModesMap v-bind="args" /></div>',
  }),
  args: {
    config: pointsMapConfig,
    entities,
    entitiesLoading: false,
    entityTypeAsCenterPoint: "asset",
    centerCoordinatesKey: "gps_coordinates",
    setPaginationLimit: () => {},
    setAdvancedFilters: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof ViewModesMap>;

export const PointsMap: Story = {
  args: {
    mapType: MapTypes.PointsMap,
  },
};

export const LoadingOverlay: Story = {
  args: {
    mapType: MapTypes.PointsMap,
    entitiesLoading: true,
  },
};
