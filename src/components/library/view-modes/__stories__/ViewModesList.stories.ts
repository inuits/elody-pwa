import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewModesList from "../ViewModesList.vue";
import {
  Entitytyping,
  GetPreviewComponentsDocument,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";

const meta: Meta<typeof ViewModesList> = {
  // Story id library-viewmodes-viewmodeslist--default, per MANIFEST.md.
  title: "Library/ViewModes/ViewModesList",
  component: ViewModesList,
  parameters: {
    docs: {
      description: {
        component:
          "The query-driven result list in its list and grid modes. Selection " +
          "state comes from the real bulk-operations store — the first row is " +
          "enqueued here, so it wears the checkbox-owned wash and ring. The " +
          "preview split itself is driven by client config (the " +
          "getPreviewComponents query), which this build's generated types do " +
          "not carry; its tiers are exercised through the viewport toolbar " +
          "and the row cue is shown in the ListItem story instead.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewModesList>;

const CONTEXT = BulkOperationsContextEnum.Home;

const entity = (id: string, title: string, author: string) => ({
  id,
  uuid: id,
  type: Entitytyping.Asset,
  teaserMetadata: {
    title: { key: "title", label: "Titel", __typename: "Metadata" },
    author: { key: "author", label: "Auteur", __typename: "Metadata" },
  },
  intialValues: { title, author },
  relationValues: {},
});

const entities = [
  entity("e1", "Verhalen uit de Noordzee", "Jan Persoon"),
  entity("e2", "Kustvisserij in de 20e eeuw", "Marie Vermeulen"),
  entity("e3", "Getijdenboek van de Schelde", "Pieter Claes"),
];

const base = {
  placeholderEntities: [],
  entitiesLoading: false,
  bulkOperationsContext: CONTEXT,
  listItemRouteName: "",
  enableSelection: true,
  enableNavigation: false,
  entityType: Entitytyping.Asset,
  configPerViewMode: {},
};

const setupStores = () => {
  // The component asks for the client's preview config on mount; answered
  // from the cache so the mock client never hits a (nonexistent) network.
  apolloClient.writeQuery({
    query: GetPreviewComponentsDocument,
    variables: { entityType: Entitytyping.Asset },
    data: { PreviewComponents: { __typename: "PreviewComponents" } },
  });

  const { enqueueItemForBulkProcessing, dequeueAllItemsForBulkProcessing } =
    useBulkOperations();
  dequeueAllItemsForBulkProcessing(CONTEXT);
  enqueueItemForBulkProcessing(CONTEXT, { id: "e1" } as never);
};

/** List mode; the first row is selected through the bulk-operations store. */
export const Default: Story = {
  render: () => ({
    components: { ViewModesList },
    setup() {
      setupStores();
      return { base, entities };
    },
    template: `
      <div style="max-width:680px">
        <view-modes-list v-bind="base" :entities="entities" mode="list" />
      </div>`,
  }),
};

/** The same rows as 300px grid cards: 8px radius, 1px border, no shadow. */
export const Grid: Story = {
  render: () => ({
    components: { ViewModesList },
    setup() {
      setupStores();
      return { base, entities };
    },
    template: `
      <div style="max-width:980px">
        <view-modes-list v-bind="base" :entities="entities" mode="grid" />
      </div>`,
  }),
};
