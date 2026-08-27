import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, provide } from "vue";
import SavedSearchesPickerModal from "../SavedSearchesPickerModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

const meta: Meta<typeof SavedSearchesPickerModal> = {
  // Story id modals-savedsearches--picker, embedded by saved-searches.md.
  title: "Modals/SavedSearches",
  component: SavedSearchesPickerModal,
  parameters: {
    docs: {
      description: {
        component:
          "The saved-searches picker: a modal library of SavedSearch " +
          "entities with single selection and a counted confirm. With no " +
          "backend behind the workshop the rows hold their loading " +
          "skeletons — itself a designed state (saved-searches.md).",
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
      provide("config", {
        features: { savedSearch: { enabled: true }, hasBulkSelect: false },
      });
      onMounted(async () => {
        await nextTick();
        useBaseModal().openModal(
          TypeModals.SaveSearchPicker,
          ModalStyle.Center,
        );
      });
      return {};
    },
    template: `<saved-searches-picker-modal />`,
  }),
};
