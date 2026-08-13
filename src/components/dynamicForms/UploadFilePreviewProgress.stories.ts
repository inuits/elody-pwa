import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UploadFilePreviewProgress from "./UploadFilePreviewProgress.vue";

// Renders the per-file progress-step icons (validate → prepare → upload) shown
// next to each file in the upload dropzone list. The loading/complete/failed
// variants are toggled at runtime by the upload composable via CSS classes, so
// the stories show the initial "empty" state of each configuration.
const meta: Meta<typeof UploadFilePreviewProgress> = {
  title: "DynamicForms/UploadFilePreviewProgress",
  component: UploadFilePreviewProgress,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-64 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof UploadFilePreviewProgress>;

export const MediaFile: Story = {
  args: {
    isValidationFile: false,
  },
};

// A validation file (e.g. the CSV that drives the upload) only shows the
// validate step.
export const ValidationFile: Story = {
  args: {
    isValidationFile: true,
  },
};

export const WithoutPrepareStep: Story = {
  args: {
    isValidationFile: false,
    hidePrepareStep: true,
  },
};
