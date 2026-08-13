import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImportWrapper from "./ImportWrapper.vue";
import { BaseFieldType } from "@/generated-types/queries";

// Thin dispatcher used by DynamicForm: it picks the import component for a
// BaseFieldType import field. All three supported types render the
// network-drive directory picker (empty state under the mock Apollo client).
const meta: Meta<typeof ImportWrapper> = {
  title: "Imports/ImportWrapper",
  component: ImportWrapper,
  tags: ["autodocs"],
  argTypes: {
    inputFieldType: {
      control: "select",
      options: [
        BaseFieldType.BaseFileSystemImportField,
        BaseFieldType.BaseMagazineWithCsvImportField,
        BaseFieldType.BaseMagazineWithMetsImportField,
      ],
    },
  },
  decorators: [() => ({ template: '<div class="w-[480px] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ImportWrapper>;

export const FileSystemImport: Story = {
  args: {
    formId: "GetImportForm",
    inputFieldType: BaseFieldType.BaseFileSystemImportField,
    closeAndDeleteForm: () => {},
  },
};
