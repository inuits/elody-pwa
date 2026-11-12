import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Dropzone from "../Dropzone.vue";
import { useDropzone } from "@/composables/useDropzone";

const meta: Meta<typeof Dropzone> = {
  title: "Base/Dropzone/Dropzone",
  component: Dropzone,
  argTypes: {
    dropzone: { control: false },
    onUpdateFilesInDropzone: { action: "updateFilesInDropzone" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The upload field used by the upload modal: a dropzone.js zone plus " +
          "its per-file preview template. Added files go into the shared " +
          "upload queue; nothing is uploaded from the story.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropzone>;

export const Default: Story = {
  args: {
    dropzoneLabel: "Drag files here or click to browse",
    viewStyle: "p-3 h-full overflow-x-hidden mb-4 grow",
    isValidationFile: false,
    hidePrepareStep: false,
  },
  render: (args) => ({
    components: { Dropzone },
    setup: () => ({ args, dropzone: new useDropzone() }),
    template: `<div style="max-width:640px;min-height:260px"><dropzone :key="JSON.stringify(args)" v-bind="args" :dropzone="dropzone" /></div>`,
  }),
};
