import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PointMap from "./PointMap.vue";
import { MapViews } from "@/generated-types/queries";

// OpenLayers point map (used e.g. for VLIZ sampling stations). Tiles stream
// from OSM/Esri, so the basemap only appears with network access; the markers
// and clustering behaviour are driven entirely by the points prop.
const points = [
  { id: "station-1", lat: 51.23, lon: 2.92 },
  { id: "station-2", lat: 51.35, lon: 3.12 },
  { id: "station-3", lat: 51.34, lon: 3.13 },
  { id: "station-4", lat: 51.42, lon: 2.81 },
];

const meta: Meta<typeof PointMap> = {
  title: "Maps/PointMap",
  component: PointMap,
  tags: ["autodocs"],
  argTypes: {
    mapView: { control: "select", options: Object.values(MapViews) },
  },
  decorators: [() => ({ template: '<div class="w-[720px] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof PointMap>;

export const Markers: Story = {
  args: {
    points,
    entities: [],
    center: [2.92, 51.23],
    mapView: MapViews.Standard,
  },
};

export const Clustered: Story = {
  args: {
    points,
    entities: [],
    center: [2.92, 51.23],
    mapView: MapViews.Standard,
    clustering: true,
  },
};

export const Satellite: Story = {
  args: {
    points,
    entities: [],
    center: [2.92, 51.23],
    mapView: MapViews.Satellite,
  },
};
