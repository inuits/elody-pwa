import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImportFromNetworkDrive from "../ImportFromNetworkDrive.vue";
import { BaseFieldType } from "@/generated-types/queries";
import { PENDING_QUERY, registerQueryFixture } from "@/main";
import { openAndSelect, registerDirectories } from "./importFixtures";

const render = () => ({
  components: { ImportFromNetworkDrive },
  setup: () => ({
    inputFieldType: BaseFieldType.BaseFileSystemImportField,
    noop: () => undefined,
  }),
  template: `
    <div style="max-width:480px;background:var(--color-surface);border:1px solid var(--color-border-subtle);border-radius:var(--radius-card);overflow:hidden">
      <import-from-network-drive form-id="story-import" :input-field-type="inputFieldType" :close-and-delete-form="noop" />
    </div>`,
});

const meta: Meta<typeof ImportFromNetworkDrive> = {
  title: "Components/ImportBrowser",
  component: ImportFromNetworkDrive,
  parameters: {
    docs: {
      description: {
        component:
          "Import from a network drive: the drive's folders as a tree and " +
          "a Start import button that stays disabled until a folder is " +
          "selected.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImportFromNetworkDrive>;

export const Default: Story = {
  beforeEach: registerDirectories,
  render,
};

export const FolderSelected: Story = {
  name: "Folder selected",
  beforeEach: registerDirectories,
  render,
  play: openAndSelect,
};

export const Loading: Story = {
  beforeEach: () => registerQueryFixture("getDirectories", PENDING_QUERY),
  render,
};

export const NoFolders: Story = {
  name: "No folders",
  beforeEach: () =>
    registerQueryFixture("getDirectories", { Directories: [] }),
  render,
};
