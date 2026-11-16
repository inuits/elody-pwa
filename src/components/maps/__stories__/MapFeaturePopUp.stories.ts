import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MapFeaturePopUp from "../MapFeaturePopUp.vue";

const meta: Meta<typeof MapFeaturePopUp> = {
  title: "Components/MapFeaturePopUp",
  component: MapFeaturePopUp,
  parameters: {
    docs: {
      description: {
        component:
          "The popup a map opens when a feature is clicked: the configured " +
          "values of the record and a link that opens it in a new tab.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MapFeaturePopUp>;

const configuration = [
  { key: "title", label: "Name" },
  { key: "station_code", label: "Station code" },
  { key: "depth", label: "Depth" },
];

const entity = {
  id: "story-station",
  type: "station",
  intialValues: { title: "Sampling station W08", station_code: "W08", depth: "" },
};

export const States: Story = {
  render: () => ({
    components: { MapFeaturePopUp },
    setup: () => ({ configuration, entity }),
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start">
        <div>
          <code style="font-size:var(--text-label)">loading</code>
          <map-feature-pop-up :configuration="configuration" :loading="true" />
        </div>
        <div>
          <code style="font-size:var(--text-label)">loaded</code>
          <map-feature-pop-up :configuration="configuration" :entity="entity" :loading="false" />
        </div>
      </div>`,
  }),
};
