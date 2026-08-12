import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import DynamicFormSkeleton from "./DynamicFormSkeleton.vue";
import { SkeletonComponentType } from "@/generated-types/queries";

// The skeleton layout per form is tenant configuration: config.skeletonLayouts
// maps a form key to the placeholder blocks shown while the real form
// definition is fetched from baseGraphql.
const skeletonLayouts: Record<string, SkeletonComponentType[]> = {
  GetUploadForm: [
    SkeletonComponentType.Title,
    SkeletonComponentType.UploadInfoLink,
    SkeletonComponentType.UploadCsvTemplates,
    SkeletonComponentType.DropzoneInfo,
    SkeletonComponentType.DropzoneSmall,
    SkeletonComponentType.ButtonWithProgress,
  ],
  GetCreateAssetForm: [
    SkeletonComponentType.Title,
    SkeletonComponentType.Input,
    SkeletonComponentType.Textarea,
    SkeletonComponentType.Dropdown,
    SkeletonComponentType.Checkbox,
    SkeletonComponentType.Button,
  ],
};

const meta: Meta<typeof DynamicFormSkeleton> = {
  title: "DynamicForms/DynamicFormSkeleton",
  component: DynamicFormSkeleton,
  tags: ["autodocs"],
  // The component reads its layout from the injected tenant config, so every
  // story provides a config with skeletonLayouts for the formKey it renders.
  render: (args) => ({
    components: { DynamicFormSkeleton },
    setup: () => {
      provide("config", { skeletonLayouts });
      return { args };
    },
    template:
      '<div class="relative w-[480px] h-[480px] p-4"><DynamicFormSkeleton v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof DynamicFormSkeleton>;

export const UploadForm: Story = {
  args: {
    formKey: "GetUploadForm",
  },
};

export const CreateEntityForm: Story = {
  args: {
    formKey: "GetCreateAssetForm",
  },
};

// A form key without a configured layout falls back to a centered spinner.
export const NoLayoutConfigured: Story = {
  args: {
    formKey: "GetUnknownForm",
  },
};
