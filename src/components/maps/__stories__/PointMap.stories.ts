import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PointMap from "../PointMap.vue";
import { MapViews } from "@/generated-types/queries";

const POINTS = [
  { id: "story-oostende", lat: 51.23, lon: 2.92 },
  { id: "story-zeebrugge", lat: 51.33, lon: 3.2 },
  { id: "story-vlissingen", lat: 51.44, lon: 3.57 },
  { id: "story-hansweert", lat: 51.44, lon: 4.0 },
  { id: "story-antwerpen", lat: 51.22, lon: 4.4 },
];

const meta: Meta<typeof PointMap> = {
  title: "Components/PointMap",
  component: PointMap,
  parameters: {
    docs: {
      description: {
        component:
          "Point features on an OpenLayers map. The base layer is " +
          "OpenStreetMap, so the tiles need an internet connection; offline " +
          "the points and controls show on an empty background.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PointMap>;

export const Default: Story = {
  render: () => ({
    components: { PointMap },
    setup: () => ({ points: POINTS, MapViews }),
    template: `
      <div style="height:65vh">
        <point-map
          :points="points"
          :entities="[]"
          :map-view="MapViews.Standard"
          :center="[3.5, 51.3]"
        />
      </div>`,
  }),
};

/** Overlapping points collapse into accent-coloured cluster discs. */
export const Clustered: Story = {
  render: () => ({
    components: { PointMap },
    setup: () => ({
      points: [
        ...POINTS,
        { id: "story-a", lat: 51.225, lon: 4.41 },
        { id: "story-b", lat: 51.218, lon: 4.39 },
        { id: "story-c", lat: 51.222, lon: 4.42 },
      ],
      MapViews,
    }),
    template: `
      <div style="height:65vh">
        <point-map
          :points="points"
          :entities="[]"
          :map-view="MapViews.Standard"
          :clustering="true"
          :center="[3.5, 51.3]"
        />
      </div>`,
  }),
};
