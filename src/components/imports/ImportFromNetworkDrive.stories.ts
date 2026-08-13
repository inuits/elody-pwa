import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImportFromNetworkDrive from "./ImportFromNetworkDrive.vue";
import { BaseFieldType } from "@/generated-types/queries";

// Directory picker for filesystem/magazine imports. Directories are fetched
// from baseGraphql on mount; the mock Apollo client resolves empty data, so
// the stories render the "no directories" empty state with the disabled
// start-import button.
const meta: Meta<typeof ImportFromNetworkDrive> = {
  title: "Imports/ImportFromNetworkDrive",
  component: ImportFromNetworkDrive,
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

type Story = StoryObj<typeof ImportFromNetworkDrive>;

export const FileSystemImport: Story = {
  args: {
    formId: "GetImportForm",
    inputFieldType: BaseFieldType.BaseFileSystemImportField,
    closeAndDeleteForm: () => {},
  },
};

export const MagazineWithCsvImport: Story = {
  args: {
    formId: "GetImportForm",
    inputFieldType: BaseFieldType.BaseMagazineWithCsvImportField,
    closeAndDeleteForm: () => {},
  },
};

export const MagazineWithMetsImport: Story = {
  args: {
    formId: "GetImportForm",
    inputFieldType: BaseFieldType.BaseMagazineWithMetsImportField,
    closeAndDeleteForm: () => {},
  },
};
