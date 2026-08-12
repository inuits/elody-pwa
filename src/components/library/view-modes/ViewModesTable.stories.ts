import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewModesTable from "./ViewModesTable.vue";
import { type Entity, Entitytyping } from "@/generated-types/queries";

const makeEntity = (
  id: string,
  values: Record<string, string>,
): Entity =>
  ({
    __typename: "Manifestation",
    id,
    uuid: id,
    type: Entitytyping.Manifestation,
    intialValues: { __typename: "IntialValues", ...values },
    teaserMetadata: {
      __typename: "teaserMetadata",
      title: { __typename: "PanelMetaData", key: "title", label: "Title" },
      objectNumber: {
        __typename: "PanelMetaData",
        key: "objectNumber",
        label: "Object number",
      },
      period: { __typename: "PanelMetaData", key: "period", label: "Period" },
    },
    relationValues: {},
  }) as unknown as Entity;

const entities = [
  makeEntity("entity-1", {
    title: "Portrait of a Lady with a Fan",
    objectNumber: "SK-A-1234",
    period: "1660",
  }),
  makeEntity("entity-2", {
    title: "Still Life with Flowers in a Glass Vase",
    objectNumber: "SK-A-2150",
    period: "1690",
  }),
  makeEntity("entity-3", {
    title: "View of Ghent with the Three Towers",
    objectNumber: "SK-C-0042",
    period: "1834",
  }),
];

const meta: Meta<typeof ViewModesTable> = {
  title: "Library/ViewModes/ViewModesTable",
  component: ViewModesTable,
  tags: ["autodocs"],
  // The table sizes itself to its container, so stories render it in a fixed box.
  render: (args) => ({
    components: { ViewModesTable },
    setup: () => ({ args }),
    template:
      '<div class="w-[52rem] h-96 p-4"><ViewModesTable v-bind="args" /></div>',
  }),
  args: {
    entities,
    entitiesLoading: false,
    bulkOperationsContext: undefined,
    listItemRouteName: "SingleEntity",
    // Storybook's memory router has no entity routes; disabling navigation
    // renders plain rows instead of router-links.
    enableNavigation: false,
    enableSelection: true,
    entityType: Entitytyping.Manifestation,
    configPerViewMode: {},
  },
};
export default meta;

type Story = StoryObj<typeof ViewModesTable>;

export const Default: Story = {};

export const Refetching: Story = {
  args: {
    entitiesLoading: true,
  },
};

export const Empty: Story = {
  args: {
    entities: [],
  },
};
