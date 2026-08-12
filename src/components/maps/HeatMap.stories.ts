import type { Meta, StoryObj } from "@storybook/vue3-vite";
import HeatMap from "./HeatMap.vue";

// OpenLayers heatmap layer over an OSM basemap. The heat features are derived
// from entities carrying GeoJSON (extractGeojsonFeaturesFromEntities), which
// needs backend-shaped map data; without it the story shows the empty basemap
// with the fullscreen/context-menu controls. Tiles stream from OSM, so the
// basemap only appears with network access.
const meta: Meta<typeof HeatMap> = {
  title: "Maps/HeatMap",
  component: HeatMap,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-[720px] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof HeatMap>;

export const EmptyBasemap: Story = {
  args: {
    entities: [],
    entitiesLoading: false,
    // EPSG:3857 coordinates roughly centered on the Belgian coast
    center: [325000, 6675000],
    zoom: 9,
    blur: 20,
    radius: 15,
    geoFilters: undefined,
  },
};
