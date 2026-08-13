import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted } from "vue";
import EntityHeaderButton from "./EntityHeaderButton.vue";
import { useEditMode } from "@/composables/useEdit";
import type { EntityButtonConfig } from "@/generated-types/queries";

// EntityHeaderButton is gated on the entity's edit state allowing deletion
// (it replaces the default DeleteButton with a config-driven action). The
// story flips the global edit state to "delete" after mount.
const meta: Meta<typeof EntityHeaderButton> = {
  title: "Components/EntityHeaderButton",
  component: EntityHeaderButton,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityHeaderButton },
    setup() {
      onMounted(() => {
        useEditMode().setEditMode("delete");
      });
      return { args };
    },
    template: '<div class="flex p-4"><EntityHeaderButton v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityHeaderButton>;

export const Archive: Story = {
  args: {
    config: {
      label: "Archiveer record",
      icon: "ArchiveAlt",
      mutation: "ArchiveEntity",
    } as unknown as EntityButtonConfig,
  },
};

export const WithCustomStyle: Story = {
  args: {
    config: {
      label: "Markeer als verwijderd",
      icon: "Trash",
      mutation: "SoftDeleteEntity",
      style: { background: "#fde8e8", text: "#c81e1e" },
    } as unknown as EntityButtonConfig,
  },
};
