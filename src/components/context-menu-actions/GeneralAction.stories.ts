import type { Meta, StoryObj } from "@storybook/vue3-vite";
import GeneralAction from "./GeneralAction.vue";
import {
  ContextMenuGeneralActionEnum,
  DamsIcons,
} from "@/generated-types/queries";

// Context-menu item that runs a predefined GraphQL operation against the
// entity (e.g. marking a mediafile as primary for its parent).
const meta: Meta<typeof GeneralAction> = {
  title: "ContextMenuActions/GeneralAction",
  component: GeneralAction,
  tags: ["autodocs"],
  argTypes: {
    action: {
      control: "select",
      options: Object.values(ContextMenuGeneralActionEnum),
    },
  },
  decorators: [
    () => ({
      template:
        '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof GeneralAction>;

export const SetPrimaryMediafile: Story = {
  args: {
    label: "contextMenu.contextMenuGeneralAction.setPrimaryMediafile",
    icon: DamsIcons.Image,
    action: ContextMenuGeneralActionEnum.SetPrimaryMediafile,
    entityId: "mediafile-1",
    parentEntityId: "manifestation-1",
  },
};

export const SetPrimaryThumbnail: Story = {
  args: {
    label: "contextMenu.contextMenuGeneralAction.setPrimaryThumbnail",
    icon: DamsIcons.ImagePlus,
    action: ContextMenuGeneralActionEnum.SetPrimaryThumbnail,
    entityId: "mediafile-1",
    parentEntityId: "manifestation-1",
  },
};
