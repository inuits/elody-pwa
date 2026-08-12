import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CustomAction from "./CustomAction.vue";
import {
  type ContextMenuGeneralActionEnum,
  ContextMenuElodyActionEnum,
  DamsIcons,
} from "@/generated-types/queries";

// Context-menu item that calls a client-configured REST endpoint for the
// entity ($id in the endpoint URL is replaced by the entity id).
// Note: the GraphQL ContextMenuCustomAction declares its action as an
// ContextMenuElodyActionEnum (EndpointCall), while the component prop is
// typed as ContextMenuGeneralActionEnum — the value is not used by the
// component itself, hence the cast.
const endpointCall =
  ContextMenuElodyActionEnum.EndpointCall as unknown as ContextMenuGeneralActionEnum;

const meta: Meta<typeof CustomAction> = {
  title: "ContextMenuActions/CustomAction",
  component: CustomAction,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof CustomAction>;

export const StartOcr: Story = {
  args: {
    label: "contextMenu.contextMenuCustomAction.startOcr",
    icon: DamsIcons.Process,
    action: endpointCall,
    entityId: "manifestation-1",
    endpointUrl: "api/ocr/$id",
    endpointMethod: "POST",
  },
};

export const RegenerateDerivatives: Story = {
  args: {
    label: "contextMenu.contextMenuCustomAction.regenerateDerivatives",
    icon: DamsIcons.Update,
    action: endpointCall,
    entityId: "mediafile-1",
    endpointUrl: "api/mediafiles/$id/derivatives",
    endpointMethod: "POST",
  },
};
