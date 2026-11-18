import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted } from "vue";
import type { DropzoneFile } from "dropzone";
import Dropzone from "../Dropzone.vue";
import DropzoneView from "../DropzoneView.vue";
import { useDropzone } from "@/composables/useDropzone";
import useUpload from "@/composables/upload/useUpload";
import { ProgressStepStatus, ProgressStepType } from "@/generated-types/queries";

const meta: Meta = {
  // Story id components-dropzone--progress, per MANIFEST.md.
  title: "Components/Dropzone",
  parameters: {
    docs: {
      description: {
        component:
          "The upload surface: a dashed zone whose label is a real button " +
          "(dropzone.js opens the file dialog on click), and one row per file " +
          "added by dropzone.js: name, size, a status glyph per step " +
          "(validate, prepare, upload) and a remove button. A failed step " +
          "turns the row's border red and lists the errors under it; " +
          "warnings show as a yellow list under a row that still completes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const rows: { name: string; megabytes: number; upload: ProgressStepStatus; errors?: string[]; warnings?: string[] }[] = [
  { name: "scan-004.tiff", megabytes: 45, upload: ProgressStepStatus.Complete, warnings: ["No metadata row was found in the CSV for this file"] },
  { name: "scan-003.tiff", megabytes: 47, upload: ProgressStepStatus.Failed, errors: ["Something went wrong while uploading"] },
  { name: "scan-001.tiff", megabytes: 48, upload: ProgressStepStatus.Complete },
  { name: "scan-002.tiff", megabytes: 51, upload: ProgressStepStatus.Loading },
];

/** Four files added to the real dropzone, then driven by useUpload: uploaded, uploading, failed and uploaded with a warning. */
export const Progress: Story = {
  render: () => ({
    components: { Dropzone },
    setup() {
      const dropzone = new useDropzone();
      const { resetUpload, updateFileThumbnails, __handleFileThumbnailWarning } = useUpload();
      resetUpload();
      onMounted(() => {
        const instance = (dropzone.dropzone as any).value;
        rows.forEach((row) => {
          const file = new File([""], row.name, { type: "image/tiff" });
          Object.defineProperty(file, "size", { value: row.megabytes * 1000 * 1000 });
          instance.addFile(file);
          const added = file as unknown as DropzoneFile;
          updateFileThumbnails(added, ProgressStepType.Prepare, ProgressStepStatus.Complete);
          updateFileThumbnails(added, ProgressStepType.Upload, row.upload, row.errors);
          if (row.warnings) __handleFileThumbnailWarning(added, row.warnings);
        });
      });
      return { dropzone };
    },
    template: `
      <div style="max-width:640px;display:flex;flex-direction:column">
        <dropzone :dropzone="dropzone" dropzone-label="upload-fields.labels.file-upload" view-style="p-3 h-full overflow-x-hidden mb-4 grow" :is-validation-file="false" />
      </div>`,
  }),
};

export const Playground: StoryObj<typeof DropzoneView> = {
  args: {
    modelValue: undefined,
    dropzoneLabel: "Drag files here or browse",
    isValidation: false,
    fileCount: 0,
    style: "",
  },
  argTypes: {
    fileCount: { control: { type: "number", min: 0 } },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  render: (args) => ({
    components: { DropzoneView },
    setup: () => ({ args }),
    template: `
      <div style="max-width:520px;height:120px">
        <dropzone-view v-bind="args" />
      </div>`,
  }),
};
