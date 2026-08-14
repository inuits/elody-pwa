import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UploadInterfaceDropzone from "./UploadInterfaceDropzone.vue";
import UploadFilePreviewProgress from "./dynamicForms/UploadFilePreviewProgress.vue";
import ProgressBar from "./ProgressBar.vue";
import { UploadFieldType, UploadFlow } from "@/generated-types/queries";

// Files dropped here are only staged locally; the actual upload endpoints
// are not available in Storybook.
const meta: Meta<typeof UploadInterfaceDropzone> = {
  title: "Components/Dropzone",
  component: UploadInterfaceDropzone,
  tags: ["autodocs"],
  argTypes: {
    dropzoneSize: { control: "select", options: ["small", "normal", "big"] },
    uploadFlow: { control: "select", options: Object.values(UploadFlow) },
  },
  decorators: [
    () => ({ template: '<div class="w-[40rem] p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof UploadInterfaceDropzone>;

export const MediafilesUpload: Story = {
  args: {
    uploadFlow: UploadFlow.MediafilesOnly,
    uploadFieldType: UploadFieldType.Batch,
    dropzoneLabel: "Sleep scans of foto's hierheen (tiff, jpg, pdf)",
    acceptedFileTypes: ["tiff", "jpg", "jpeg", "pdf"],
    dropzoneSize: "small",
    dryRun: false,
  },
};

/** Manifest id `components-dropzone--progress`: dropzone with the per-file
 *  progress rows (validate → prepare → upload) and the overall progress bar.
 *  Real progression is driven by the upload composable at runtime; the story
 *  shows the anatomy with the endpoints stubbed. */
export const Progress: Story = {
  render: (args) => ({
    components: { UploadInterfaceDropzone, UploadFilePreviewProgress, ProgressBar },
    setup: () => ({ args }),
    template: `
      <div class="flex w-[40rem] flex-col gap-3 p-4">
        <UploadInterfaceDropzone v-bind="args" />
        <div class="flex items-center justify-between rounded-[5px] border border-neutral-30 bg-neutral-0 px-3 py-2">
          <span class="text-table">voorplat_scan_001.tiff</span>
          <UploadFilePreviewProgress :is-validation-file="false" />
        </div>
        <div class="flex items-center justify-between rounded-[5px] border border-neutral-30 bg-neutral-0 px-3 py-2">
          <span class="text-table">achterplat_scan_002.tiff</span>
          <UploadFilePreviewProgress :is-validation-file="false" />
        </div>
        <div class="h-2"><ProgressBar :progress="60" progress-bar-type="percentage" /></div>
      </div>
    `,
  }),
  args: {
    uploadFlow: UploadFlow.MediafilesOnly,
    uploadFieldType: UploadFieldType.Batch,
    dropzoneLabel: "Sleep scans of foto's hierheen (tiff, jpg, pdf)",
    acceptedFileTypes: ["tiff", "jpg", "jpeg", "pdf"],
    dropzoneSize: "small",
    dryRun: false,
  },
};

export const CsvImport: Story = {
  args: {
    uploadFlow: UploadFlow.CsvOnly,
    uploadFieldType: UploadFieldType.Batch,
    dropzoneLabel: "Sleep het import-CSV-bestand hierheen",
    acceptedFileTypes: ["csv"],
    dropzoneSize: "small",
    dryRun: true,
    maxAmountOfFiles: 1,
  },
};
