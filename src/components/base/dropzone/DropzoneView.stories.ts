import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DropzoneView from "./DropzoneView.vue";

const meta: Meta<typeof DropzoneView> = {
  title: "Base/Dropzone/DropzoneView",
  component: DropzoneView,
  tags: ["autodocs"],
  // Sizes to its container (h-full), so the story wraps it in a sized div.
  decorators: [
    () => ({ template: '<div class="w-[28rem] h-56 p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof DropzoneView>;

export const Empty: Story = {
  args: {
    modelValue: undefined,
    dropzoneLabel: "Sleep bestanden hierheen of klik om te uploaden",
    isValidation: false,
    fileCount: 0,
  },
};

export const WithFiles: Story = {
  args: {
    modelValue: undefined,
    dropzoneLabel: "Sleep bestanden hierheen of klik om te uploaden",
    isValidation: false,
    fileCount: 3,
  },
};
