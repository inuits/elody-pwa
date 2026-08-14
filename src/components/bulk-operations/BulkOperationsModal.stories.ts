import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide } from "vue";
import BulkOperationsModal from "./BulkOperationsModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, RouteNames, TypeModals } from "@/generated-types/queries";

// BulkOperationsModal is the dialog wrapper that hosts the CSV-export,
// delete-entities and delete-relations panels depending on which bulk
// operation modal type is opened. The stories open one of those types on
// mount so the dialog shows the corresponding panel.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
  bulkSelectAllSizeLimit: 500,
};

const meta: Meta<typeof BulkOperationsModal> = {
  title: "BulkOperations/BulkOperationsModal",
  component: BulkOperationsModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof BulkOperationsModal>;

const renderWithModalType = (modalType: TypeModals) => () => ({
  components: { BulkOperationsModal },
  setup() {
    provide("config", storyConfig);
    const { closeAllModals, openModal } = useBaseModal();
    closeAllModals();
    onMounted(() => openModal(modalType, ModalStyle.CenterWide));
  },
  template: "<BulkOperationsModal />",
});

export const DeleteRelations: Story = {
  render: renderWithModalType(TypeModals.BulkOperationsDeleteRelations),
};

export const DeleteEntities: Story = {
  render: renderWithModalType(TypeModals.BulkOperationsDeleteEntities),
};
