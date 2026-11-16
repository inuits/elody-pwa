import type { Meta, StoryObj } from "@storybook/vue3-vite";
import WktMap from "../WktMap.vue";
import { MapViews } from "@/generated-types/queries";

const meta: Meta<typeof WktMap> = {
  title: "Components/WktMap",
  component: WktMap,
  parameters: {
    docs: {
      description: {
        component:
          "Geometries from WKT on an OpenLayers map, drawn in the client " +
          "accent. A site too small to see at the current zoom shows as a " +
          "dot. The base layer is OpenStreetMap, so the tiles need an " +
          "internet connection.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WktMap>;

const SITES = [
  {
    id: "story-site-harbour",
    wkt: "POLYGON((2.90 51.225, 2.94 51.225, 2.95 51.245, 2.91 51.25, 2.90 51.225))",
  },
  {
    id: "story-site-dune",
    wkt: "POLYGON((3.05 51.27, 3.12 51.27, 3.12 51.30, 3.05 51.30, 3.05 51.27))",
  },
  {
    id: "story-site-small",
    wkt: "POLYGON((3.2000 51.3300, 3.2004 51.3300, 3.2004 51.3303, 3.2000 51.3303, 3.2000 51.3300))",
  },
];

export const Default: Story = {
  render: () => ({
    components: { WktMap },
    setup: () => ({ sites: SITES, MapViews }),
    template: `
      <wkt-map
        :wkt="sites"
        :entities="[]"
        :map-view="MapViews.Standard"
        :use-filters="false"
        :geo-filters="undefined"
      />`,
  }),
};
