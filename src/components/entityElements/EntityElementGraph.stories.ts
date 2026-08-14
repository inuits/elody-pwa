import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import EntityElementGraph from "./EntityElementGraph.vue";
import type { GraphElement } from "@/generated-types/queries";

// The component injects "entityFormData" (normally provided by the single
// entity page) and fetches its datapoints through GraphData. The mock Apollo
// client resolves every query to empty data, so the story shows the loading
// state of the element — enough to verify header, collapse and layout.
const graphElement = (overrides: Partial<GraphElement> = {}): GraphElement =>
  ({
    __typename: "GraphElement",
    label: "Sensor readings",
    isCollapsed: false,
    type: "line",
    datasource: "database",
    dataset: {
      __typename: "GraphDataset",
      labels: ["temperature", "humidity"],
      filter: { __typename: "GraphDatasetFilter", key: null, values: null },
    },
    timeUnit: "day",
    datapoints: 100,
    convert_to: null,
    ...overrides,
  }) as unknown as GraphElement;

const meta: Meta<typeof EntityElementGraph> = {
  title: "EntityElements/EntityElementGraph",
  component: EntityElementGraph,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityElementGraph },
    setup: () => {
      provide("entityFormData", { id: "asset-storybook-1" });
      return { args };
    },
    template:
      '<div class="max-w-3xl h-96 p-4"><EntityElementGraph v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityElementGraph>;

export const Loading: Story = {
  args: {
    element: graphElement(),
  },
};

export const Collapsed: Story = {
  args: {
    element: graphElement({ isCollapsed: true }),
  },
};
