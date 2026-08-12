import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted } from "vue";
import MetadataEditButton from "./MetadataEditButton.vue";
import { useEditMode } from "@/composables/useEdit";

// The button renders based on the entity's edit state. Outside a single
// entity route the component hides itself on mount, so the stories re-enable
// the (global) edit state right after mounting.
const meta: Meta<typeof MetadataEditButton> = {
  title: "Components/MetadataEditButton",
  component: MetadataEditButton,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof MetadataEditButton>;

export const ReadMode: Story = {
  render: (args) => ({
    components: { MetadataEditButton },
    setup() {
      onMounted(() => {
        const editHelper = useEditMode();
        editHelper.setEditMode("edit");
        editHelper.disableEdit();
      });
      return { args };
    },
    template:
      '<div class="flex p-4"><MetadataEditButton v-bind="args" /></div>',
  }),
};

export const EditingActive: Story = {
  render: (args) => ({
    components: { MetadataEditButton },
    setup() {
      onMounted(() => {
        const editHelper = useEditMode();
        editHelper.setEditMode("edit");
        editHelper.enableEdit();
      });
      return { args };
    },
    template:
      '<div class="flex p-4"><MetadataEditButton v-bind="args" /></div>',
  }),
};
