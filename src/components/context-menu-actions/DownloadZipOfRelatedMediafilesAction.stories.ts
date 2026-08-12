import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DownloadZipOfRelatedMediafilesAction from "./DownloadZipOfRelatedMediafilesAction.vue";
import { DamsIcons } from "@/generated-types/queries";

// Context-menu item that downloads a zip of all mediafiles related to the
// entity from a configured endpoint ($id is replaced by the entity id).
const meta: Meta<typeof DownloadZipOfRelatedMediafilesAction> = {
  title: "ContextMenuActions/DownloadZipOfRelatedMediafilesAction",
  component: DownloadZipOfRelatedMediafilesAction,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof DownloadZipOfRelatedMediafilesAction>;

export const Default: Story = {
  args: {
    label: "contextMenu.downloadZipOfRelatedMediafiles",
    icon: DamsIcons.Download,
    endpointUrl: "api/entities/$id/mediafiles/zip",
    endpointMethod: "GET",
    filename: "manifestation-mediafiles.zip",
    entityId: "manifestation-1",
  },
};
