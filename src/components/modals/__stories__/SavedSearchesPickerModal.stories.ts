import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, provide } from "vue";
import SavedSearchesPickerModal from "../SavedSearchesPickerModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { registerQueryFixture } from "@/main";
import { registerLibraryFixtures } from "@/components/library/__stories__/libraryFixtures";

const savedSearch = (id: string, title: string) => ({
  __typename: "SavedSearch",
  id,
  uuid: id,
  type: "savedSearch",
  intialValues: { __typename: "IntialValues", title, filters: [] },
  allowedViewModes: null,
  teaserMetadata: {
    __typename: "teaserMetadata",
    title: { __typename: "PanelMetaData", key: "title", label: "Title", value: title },
  },
});

const registerFixtures = () => {
  registerLibraryFixtures();
  registerQueryFixture("GetFilterMatcherMapping", { FilterMatcherMapping: [] });
  registerQueryFixture("getAdvancedFilters", {
    EntityTypeFilters: {
      __typename: "SavedSearch",
      advancedFilters: { __typename: "AdvancedFilters" },
    },
  });
  registerQueryFixture("GetBulkOperations", {
    BulkOperations: { __typename: "SavedSearch" },
  });
  registerQueryFixture("getPreviewComponents", {
    PreviewComponents: { __typename: "SavedSearch" },
  });
  registerQueryFixture("getEntities", {
    Entities: {
      __typename: "EntitiesResults",
      count: 4,
      limit: 20,
      facets: [],
      results: [
        savedSearch("ss-1", "Comics published after 2000"),
        savedSearch("ss-2", "Fantasy without a cover image"),
        savedSearch("ss-3", "Recently edited by me"),
        savedSearch("ss-4", "Awaiting review"),
      ],
    },
  });
};

const meta: Meta<typeof SavedSearchesPickerModal> = {
  title: "Modals/SavedSearches",
  component: SavedSearchesPickerModal,
  parameters: {
    docs: {
      description: {
        component:
          "All saved searches: a modal library of SavedSearch entities. " +
          "One can be selected; Confirm selection applies it to the list.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SavedSearchesPickerModal>;

export const Picker: Story = {
  render: () => ({
    components: { SavedSearchesPickerModal },
    setup() {
      registerFixtures();
      provide("config", {
        features: { savedSearch: { enabled: true } },
        routerConfig: [{ name: "Home", children: [] }],
      });
      onMounted(async () => {
        await nextTick();
        useBaseModal().openModal(
          TypeModals.SaveSearchPicker,
          ModalStyle.RightWide,
        );
      });
      return {};
    },
    template: `<saved-searches-picker-modal />`,
  }),
};
