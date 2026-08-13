import type { Meta, StoryObj } from "@storybook/vue3-vite";
import WktMap from "./WktMap.vue";
import { MapViews } from "@/generated-types/queries";

// OpenLayers map rendering WKT geometries (e.g. a sampling area polygon and a
// track line). Tiles stream from OSM/Esri, so the basemap only appears with
// network access; the vector features come from the wkt props.
const wkt = [
  {
    id: "area-1",
    wkt: "POLYGON((2.6 51.2, 3.2 51.2, 3.2 51.5, 2.6 51.5, 2.6 51.2))",
  },
  {
    id: "track-1",
    wkt: "LINESTRING(2.7 51.25, 2.9 51.35, 3.1 51.42)",
  },
];

const overlayWkt = [
  {
    id: "overlay-1",
    wkt: "POLYGON((2.8 51.28, 3.0 51.28, 3.0 51.38, 2.8 51.38, 2.8 51.28))",
  },
];

const meta: Meta<typeof WktMap> = {
  title: "Maps/WktMap",
  component: WktMap,
  tags: ["autodocs"],
  argTypes: {
    mapView: { control: "select", options: Object.values(MapViews) },
  },
  decorators: [() => ({ template: '<div class="w-[720px] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof WktMap>;

export const Geometries: Story = {
  args: {
    wkt,
    entities: [],
    mapView: MapViews.Standard,
    useFilters: false,
    geoFilters: undefined,
  },
};

export const WithOverlay: Story = {
  args: {
    wkt,
    overlayWkt,
    entities: [],
    mapView: MapViews.Standard,
    useFilters: false,
    geoFilters: undefined,
  },
};
