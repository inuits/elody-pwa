import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import EditModal from "./EditModal.vue";
import { useEditMode } from "@/composables/useEdit";

// EditModal is the floating save/discard bar shown while an entity is in edit
// mode. Edit state lives in the useEditMode composable, so the stories enable
// it for the story entity before rendering.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
};

const meta: Meta<typeof EditModal> = {
  title: "Modals/EditModal",
  component: EditModal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof EditModal>;

const renderInEditMode =
  (mode: "edit" | "edit-delete") => (args: { entityId: string }) => ({
    components: { EditModal },
    setup() {
      provide("config", storyConfig);
      const editHelper = useEditMode(args.entityId);
      editHelper.enableEdit();
      editHelper.setEditMode(mode);
      return { args };
    },
    // The bar positions itself fixed at the bottom of the viewport.
    template: '<div class="h-40"><EditModal v-bind="args" /></div>',
  });

export const EditMode: Story = {
  args: { entityId: "story-entity-1" },
  render: renderInEditMode("edit"),
};

// "edit-delete" also shows the delete button in the submit bar.
export const EditDeleteMode: Story = {
  args: { entityId: "story-entity-2" },
  render: renderInEditMode("edit-delete"),
};
