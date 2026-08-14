import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide } from "vue";
import BulkOperationsEditModal from "./BulkOperationsEditModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import {
  Entitytyping,
  ModalStyle,
  RouteNames,
  TypeModals,
} from "@/generated-types/queries";

// Bulk relation-edit modal: the selected items on the left get a relation
// (picked in the right-hand form) attached in bulk. The relation form itself
// is declared by a GetBulkOperationsRelationForm query — empty with the
// Storybook Apollo client — so the story shows the modal shell with the
// items list and submit bar. The component requires the "bulkEdit" form to
// exist, so the story creates it up front.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
  bulkSelectAllSizeLimit: 500,
};

const context = BulkOperationsContextEnum.EntityElementList;

const enqueuedItems = [
  {
    id: "manifestation-1",
    type: Entitytyping.Manifestation,
    teaserMetadata: [
      { key: "title", label: "Title", value: "De donkere kamer van Damokles" },
    ],
  },
  {
    id: "manifestation-2",
    type: Entitytyping.Manifestation,
    teaserMetadata: [
      { key: "title", label: "Title", value: "Nooit meer slapen" },
    ],
  },
] as any[];

const meta: Meta<typeof BulkOperationsEditModal> = {
  title: "BulkOperations/BulkOperationsEditModal",
  component: BulkOperationsEditModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof BulkOperationsEditModal>;

export const Default: Story = {
  render: () => ({
    components: { BulkOperationsEditModal },
    setup() {
      provide("config", storyConfig);
      const { dequeueAllItemsForBulkProcessing, enqueueItemForBulkProcessing } =
        useBulkOperations();
      dequeueAllItemsForBulkProcessing(context);
      enqueuedItems.forEach((item) =>
        enqueueItemForBulkProcessing(context, item),
      );
      const { createForm } = useFormHelper();
      createForm("bulkEdit", {
        intialValues: {},
        relationValues: {},
      } as any);
      const { closeAllModals, openModal } = useBaseModal();
      closeAllModals();
      onMounted(() =>
        openModal(TypeModals.BulkOperationsEdit, ModalStyle.CenterWide),
      );
      return { context };
    },
    template: '<BulkOperationsEditModal :context="context" />',
  }),
};
