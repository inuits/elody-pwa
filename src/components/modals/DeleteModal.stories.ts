import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide } from "vue";
import DeleteModal from "./DeleteModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type DeleteQueryOptions,
  ModalStyle,
  RouteNames,
  TypeModals,
} from "@/generated-types/queries";

// DeleteModal is driven by useBaseModal state instead of props: the stories
// open the modal on mount so the <dialog> becomes visible in the canvas.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
};

const meta: Meta<typeof DeleteModal> = {
  title: "Modals/DeleteModal",
  component: DeleteModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DeleteModal>;

const renderWithOptions = (deleteQueryOptions: DeleteQueryOptions) => () => ({
  components: { DeleteModal },
  setup() {
    provide("config", storyConfig);
    const { closeAllModals, openModal } = useBaseModal();
    closeAllModals();
    onMounted(() =>
      openModal(
        TypeModals.Delete,
        ModalStyle.Center,
        undefined,
        deleteQueryOptions,
      ),
    );
  },
  template: "<DeleteModal />",
});

// Simplest configuration: no blocking-relations query and no relations to
// delete along, so the modal renders the plain confirm/cancel step.
export const Default: Story = {
  render: renderWithOptions({
    deleteEntityLabel: "manifestation",
  } as DeleteQueryOptions),
};

export const MediafileDelete: Story = {
  render: renderWithOptions({
    deleteEntityLabel: "mediafile",
  } as DeleteQueryOptions),
};
