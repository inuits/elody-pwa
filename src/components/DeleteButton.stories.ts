import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted } from "vue";
import DeleteButton from "./DeleteButton.vue";
import { useEditMode } from "@/composables/useEdit";

// DeleteButton only appears when the current entity's edit state allows
// deletion. Without a route-bound entity the component falls back to the
// global edit state, which the story flips to "edit-delete" after mount.
const meta: Meta<typeof DeleteButton> = {
  title: "Components/DeleteButton",
  component: DeleteButton,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof DeleteButton>;

export const Default: Story = {
  render: () => ({
    components: { DeleteButton },
    setup() {
      onMounted(() => {
        useEditMode().setEditMode("edit-delete");
      });
    },
    template: '<div class="flex p-4"><DeleteButton /></div>',
  }),
};
