import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import DropzonePreview from "../DropzonePreview.vue";

const meta: Meta<typeof DropzonePreview> = {
  title: "Base/Dropzone/DropzonePreview",
  component: DropzonePreview,
  argTypes: {
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The hidden template dropzone.js clones for every added file: name, " +
          "size, progress, a remove button and warning/error lines. The story " +
          "unhides it so the row can be seen.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropzonePreview>;

export const Default: Story = {
  args: { isValidationFile: false, hidePrepareStep: false },
  render: (args) => ({
    components: { DropzonePreview },
    setup: () => ({ args, element: ref<HTMLDivElement>() }),
    template: `
      <div style="max-width:640px" class="[&>.hidden]:block">
        <dropzone-preview v-bind="args" v-model="element" />
      </div>`,
  }),
};
