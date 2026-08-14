import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UploadInterfaceDropzone from "./UploadInterfaceDropzone.vue";
import { UploadFieldType, UploadFlow } from "@/generated-types/queries";

// Files dropped here are only staged locally; the actual upload endpoints
// are not available in Storybook.
const meta: Meta<typeof UploadInterfaceDropzone> = {
  title: "Components/UploadInterfaceDropzone",
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
