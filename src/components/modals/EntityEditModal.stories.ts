import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide } from "vue";
import EntityEditModal from "./EntityEditModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  Entitytyping,
  ModalStyle,
  RouteNames,
  TypeModals,
} from "@/generated-types/queries";

// EntityEditModal loads its entity + form definition from GraphQL when the
// modal opens. The Storybook Apollo client resolves every query to empty
// data, so the modal renders its "no editable fields" empty state — the
// realistic fallback when a form query returns nothing.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
};

const meta: Meta<typeof EntityEditModal> = {
  title: "Modals/EntityEditModal",
  component: EntityEditModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof EntityEditModal>;

export const EmptyFormState: Story = {
  render: () => ({
    components: { EntityEditModal },
    setup() {
      provide("config", storyConfig);
      const { closeAllModals, openModal } = useBaseModal();
      closeAllModals();
      onMounted(() =>
        openModal(
          TypeModals.EntityEditModal,
          ModalStyle.CenterWide,
          undefined,
          undefined,
          false,
          undefined,
          {
            entityId: "manifestation-1",
            entityType: Entitytyping.Manifestation,
            title: "modals.entityEdit.title",
          },
        ),
      );
    },
    template: "<EntityEditModal />",
  }),
};
