import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PointMap from "../PointMap.vue";
import { MapViews } from "@/generated-types/queries";

/**
 * A single flat tile served as a data URI: the map renders a neutral grid
 * without ever touching a tile server, so the story works offline and in CI
 * screenshots. The app never sets tileUrl and keeps its real base layers.
 */
const FIXTURE_TILE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAWElEQVR42u3PsQ0AIAwEsey/HSVF+hSIGWCNlyzdDeBau6Or/5wbGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQA4guge5EOhyWLQdXgAAAABJRU5ErkJggg==";

const POINTS = [
  { id: "story-oostende", lat: 51.23, lon: 2.92 },
  { id: "story-zeebrugge", lat: 51.33, lon: 3.2 },
  { id: "story-vlissingen", lat: 51.44, lon: 3.57 },
  { id: "story-hansweert", lat: 51.44, lon: 4.0 },
  { id: "story-antwerpen", lat: 51.22, lon: 4.4 },
];

const meta: Meta<typeof PointMap> = {
  // Story id components-pointmap--default, embedded by map-viewer.md.
  title: "Components/PointMap",
  component: PointMap,
  parameters: {
    docs: {
      description: {
        component:
          "Point features on an OpenLayers base map. Markers and cluster " +
          "discs take the tenant accent through accentMapStyle (OL cannot " +
          "read CSS variables, so the style helper reads the computed value " +
          "from the themed body); the view fits itself around the features " +
          "on load. The base layer here is an offline fixture tile — the " +
          "app renders OSM or Esri imagery.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PointMap>;

export const Default: Story = {
  render: () => ({
    components: { PointMap },
    setup: () => ({ points: POINTS, tile: FIXTURE_TILE, MapViews }),
    template: `
      <div style="height:65vh">
        <point-map
          :points="points"
          :entities="[]"
          :map-view="MapViews.Standard"
          :tile-url="tile"
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
      tile: FIXTURE_TILE,
      MapViews,
    }),
    template: `
      <div style="height:65vh">
        <point-map
          :points="points"
          :entities="[]"
          :map-view="MapViews.Standard"
          :tile-url="tile"
          :clustering="true"
          :center="[3.5, 51.3]"
        />
      </div>`,
  }),
};
