import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, ref } from "vue";
import DropzoneView from "../DropzoneView.vue";
import DropzonePreview from "../DropzonePreview.vue";

const meta: Meta = {
  // Story id components-dropzone--progress, per MANIFEST.md.
  title: "Components/Dropzone",
  parameters: {
    docs: {
      description: {
        component:
          "The upload surface: a dashed zone whose label is a real button " +
          "(dropzone.js opens the file dialog on click), and one row per file " +
          "cloned from the preview template: name, size, a status glyph per " +
          "step (validate, prepare, upload) and a remove button. A failed " +
          "step turns the row's border red and lists the errors under it.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const rows = [
  { name: "scan-001.tiff", size: "48", steps: { validate: "complete", prepare: "complete", upload: "complete" } },
  { name: "scan-002.tiff", size: "51", steps: { validate: "complete", prepare: "complete", upload: "loading" } },
  { name: "scan-003.tiff", size: "47", steps: { validate: "complete", prepare: "complete", upload: "failed" }, error: "Something went wrong while uploading" },
];

/** Three file rows in the zone: uploaded, uploading and failed. */
export const Progress: Story = {
  render: () => ({
    components: { DropzoneView, DropzonePreview },
    setup() {
      const view = ref<HTMLDivElement>();
      const template = ref<HTMLDivElement>();
      onMounted(() => {
        rows.forEach((row) => {
          const preview = template.value!.cloneNode(true) as HTMLDivElement;
          preview.querySelector("[data-dz-name]")!.textContent = row.name;
          preview.querySelector("[data-dz-size]")!.innerHTML = `<strong>${row.size}</strong> MB`;
          Object.entries(row.steps).forEach(([step, status]) => {
            const container = preview.querySelector(`.file-${step}-container`)!;
            [...container.children].forEach((child) => child.classList.add("hidden"));
            container.querySelector(`.file-${step}-${status}`)!.classList.remove("hidden");
          });
          if (row.error) {
            const errors = preview.querySelector(".error-message-container")!;
            errors.innerHTML = `<ul class="list-disc"><li>${row.error}</li></ul>`;
            errors.classList.remove("hidden");
            preview.classList.add("border-2", "border-danger");
          }
          view.value!.appendChild(preview);
        });
      });
      return { view, template };
    },
    template: `
      <div style="max-width:640px">
        <dropzone-view v-model="view" dropzone-label="upload-fields.labels.file-upload" :is-validation="false" :file-count="rows.length" :style="'p-3'" />
        <dropzone-preview v-model="template" :is-validation-file="false" />
      </div>`,
    data: () => ({ rows }),
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
