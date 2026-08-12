import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide } from "vue";
import SearchModal from "./SearchModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, RouteNames, TypeModals } from "@/generated-types/queries";

// The simple-search modal: a search bar that builds advanced filters from the
// entered term and shows the results in an embedded BaseLibrary. Without a
// backend the story shows the initial state (search bar, no results yet).
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
};

const meta: Meta<typeof SearchModal> = {
  title: "Modals/SearchModal",
  component: SearchModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof SearchModal>;

export const Default: Story = {
  render: () => ({
    components: { SearchModal },
    setup() {
      provide("config", storyConfig);
      const { closeAllModals, openModal } = useBaseModal();
      closeAllModals();
      onMounted(() => openModal(TypeModals.Search, ModalStyle.Center));
    },
    template: "<SearchModal />",
  }),
};
