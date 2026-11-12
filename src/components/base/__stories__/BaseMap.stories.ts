import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseMap from "../BaseMap.vue";

const meta: Meta<typeof BaseMap> = {
  title: "Base/BaseMap",
  component: BaseMap,
  parameters: {
    docs: {
      description: {
        component:
          "Leaflet map with a single marker at the mediafile's location, followed by its map metadata. " +
          "Used by mediafile map elements; the base layer comes from OpenStreetMap, so the tiles need an internet connection.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseMap>;

export const Default: Story = {
  args: {
    element: {} as never,
    entityUuid: "story-map-entity",
    mapData: [
      {
        key: "location",
        label: "Location",
        value: { latitude: 51.23, longitude: 2.92 },
      },
      { key: "name", label: "Name", value: "Oostende harbour" },
    ],
  },
};
