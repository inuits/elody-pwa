import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MediaViewerNew from "../MediaViewerNew.vue";
import {
  mediafileListMapping,
  mediafileOptions,
  stubMediafileFetch,
  withMediafileContext,
} from "./mediafileFixtures";

const meta: Meta<typeof MediaViewerNew> = {
  title: "Base/MediaViewerNew",
  component: MediaViewerNew,
  decorators: [withMediafileContext("story-media-viewer-new")],
  beforeEach: stubMediafileFetch,
  argTypes: {
    mediafiles: {
      control: "select",
      options: mediafileOptions,
      mapping: mediafileListMapping,
    },
    onTogglePreviewComponent: { action: "togglePreviewComponent" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The media viewer used in previews and single-media panels: it picks the viewer from the mimetype, frames or links out to external urls, offers a download for unsupported types and shows previous / next arrows when there is more than one file. " +
          "Text and PDF render from sample files; images need a live IIIF image server and audio/video need the collection API.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MediaViewerNew>;

export const Default: Story = {
  args: {
    mediafiles: "pdf" as never,
    loading: false,
    hideNavigation: false,
    cropMediafileCoordinatesKey: "",
  },
  render: (args) => ({
    components: { MediaViewerNew },
    setup: () => ({ args }),
    template: `<div style="height:520px"><media-viewer-new v-bind="args" /></div>`,
  }),
};
