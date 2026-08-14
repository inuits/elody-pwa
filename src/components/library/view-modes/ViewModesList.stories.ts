import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewModesList from "./ViewModesList.vue";
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

const meta: Meta<typeof ViewModesList> = {
  title: "Library/ViewModes/ViewModesList",
  component: ViewModesList,
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "select", options: ["list", "grid"] },
  },
  // The list sizes itself to its container, so stories render it in a fixed box.
  render: (args) => ({
    components: { ViewModesList },
    setup: () => ({ args }),
    template:
      '<div class="w-[52rem] h-96 p-4"><ViewModesList v-bind="args" /></div>',
  }),
  args: {
    entities,
    placeholderEntities: [],
    entitiesLoading: false,
    bulkOperationsContext: undefined,
    listItemRouteName: "SingleEntity",
    // Storybook's memory router has no entity routes; disabling navigation
    // renders plain list items instead of router-links.
    enableNavigation: false,
    enableSelection: true,
    entityType: Entitytyping.Manifestation,
    configPerViewMode: {},
  },
};
export default meta;

type Story = StoryObj<typeof ViewModesList>;

export const ListMode: Story = {
  args: {
    mode: "list",
  },
};

export const GridMode: Story = {
  args: {
    mode: "grid",
  },
};

export const Loading: Story = {
  args: {
    mode: "list",
    entitiesLoading: true,
  },
};
