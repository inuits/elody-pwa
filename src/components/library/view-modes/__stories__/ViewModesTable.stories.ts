import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewModesTable from "../ViewModesTable.vue";
import {
  BaseLibraryModes,
  Entitytyping,
  GetPreviewComponentsDocument,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";

const CONTEXT = BulkOperationsContextEnum.Home;

const meta: Meta<typeof ViewModesTable> = {
  title: "Library/ViewModes/ViewModesTable",
  component: ViewModesTable,
  parameters: {
    docs: {
      description: {
        component:
          'The table view mode: one sticky header row with the "Select page" checkbox and the field labels, ' +
          "then a TableViewRow per entity. A group-by config splits the rows under group headers.",
      },
    },
  },
  argTypes: {
    baseLibraryMode: {
      control: "select",
      options: Object.values(BaseLibraryModes),
    },
    entities: { control: "object" },
    groups: { control: "object" },
    onTogglePageSelection: { action: "togglePageSelection" },
    onLoadMoreInGroup: { action: "loadMoreInGroup" },
    onLoadMoreGroups: { action: "loadMoreGroups" },
  },
  render: (args) => ({
    components: { ViewModesTable },
    setup() {
      apolloClient.writeQuery({
        query: GetPreviewComponentsDocument,
        variables: { entityType: Entitytyping.Asset },
        data: { PreviewComponents: { __typename: "PreviewComponents" } },
      });
      const { enqueueItemForBulkProcessing, dequeueAllItemsForBulkProcessing } =
        useBulkOperations();
      dequeueAllItemsForBulkProcessing(CONTEXT);
      enqueueItemForBulkProcessing(CONTEXT, { id: "e2" } as never);
      return { args };
    },
    template: `<div style="max-width:900px"><view-modes-table v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof ViewModesTable>;

const entity = (id: string, title: string, author: string, year: string) => ({
  id,
  uuid: id,
  type: Entitytyping.Asset,
  teaserMetadata: {
    title: { key: "title", label: "Title", __typename: "Metadata" },
    author: { key: "author", label: "Author", __typename: "Metadata" },
    year: { key: "year", label: "Year", __typename: "Metadata" },
  },
  intialValues: { title, author, year },
  relationValues: {},
});

const entities = [
  entity("e1", "Tales from the North Sea", "Jan Persoon", "1987"),
  entity(
    "e2",
    "Coastal Fishing in the 20th Century",
    "Marie Vermeulen",
    "2004",
  ),
  entity("e3", "A Book of Hours of the Scheldt", "Pieter Claes", "1512"),
];

const base = {
  entities,
  entitiesLoading: false,
  bulkOperationsContext: CONTEXT,
  listItemRouteName: "",
  enableSelection: true,
  entityType: Entitytyping.Asset,
  configPerViewMode: {},
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  pageIsSelected: false,
};

export const Default: Story = { args: base };

export const Grouped: Story = {
  args: {
    ...base,
    groups: [
      {
        id: "g1",
        value: "Jan Persoon",
        label: "Jan Persoon",
        entities: [entities[0]],
        count: 1,
        page: 1,
        loading: false,
        hasMore: false,
      },
      {
        id: "g2",
        value: "Marie Vermeulen",
        label: "Marie Vermeulen",
        entities: [entities[1], entities[2]],
        count: 14,
        page: 1,
        loading: false,
        hasMore: true,
      },
    ] as never,
  },
};
