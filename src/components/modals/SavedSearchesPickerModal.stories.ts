import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide } from "vue";
import SavedSearchesPickerModal from "./SavedSearchesPickerModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, RouteNames, TypeModals } from "@/generated-types/queries";

// The picker embeds a full BaseLibrary scoped to saved_search entities. The
// Storybook Apollo client resolves every query to empty data, so the library
// renders its empty state — enough to inspect the modal chrome and layout.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
};

const meta: Meta<typeof SavedSearchesPickerModal> = {
  title: "Modals/SavedSearchesPickerModal",
  component: SavedSearchesPickerModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof SavedSearchesPickerModal>;

export const Default: Story = {
  render: () => ({
    components: { SavedSearchesPickerModal },
    setup() {
      provide("config", storyConfig);
      const { closeAllModals, openModal } = useBaseModal();
      closeAllModals();
      onMounted(() =>
        openModal(TypeModals.SaveSearchPicker, ModalStyle.CenterWide),
      );
    },
    template: "<SavedSearchesPickerModal />",
  }),
};
