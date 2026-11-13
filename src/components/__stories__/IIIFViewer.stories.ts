import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IIIFViewer from "../IIIFViewer.vue";

const meta: Meta<typeof IIIFViewer> = {
  title: "Components/IIIFViewer",
  component: IIIFViewer,
  argTypes: {
    onSelectArea: { action: "selectArea" },
    onClearSelection: { action: "clear-selection" },
    onToggleCropView: { action: "toggle-crop-view" },
    onOpenRecropModal: { action: "open-recrop-modal" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Deep-zoom image viewer: OpenSeadragon under the shared viewer toolbar, with area selection for cropping. " +
          "Tiles come from the IIIF image server (Cantaloupe) at /api/iiif, which Storybook does not have, so only the toolbar and an empty canvas show here.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IIIFViewer>;

export const Default: Story = {
  args: {
    imageFilename: "north-sea.jpg",
    originalFilename: "north-sea.jpg",
    mediafileId: "m1",
    isPublic: false,
    enableSelection: true,
    showCropped: true,
    canRecrop: false,
    isRecropModal: false,
  },
  render: (args) => ({
    components: { IIIFViewer },
    setup: () => ({ args }),
    template: `
      <div style="height:360px;background:var(--color-surface-inverted);border-radius:var(--radius-card);overflow:hidden">
        <i-i-i-f-viewer v-bind="args" />
      </div>`,
  }),
};
