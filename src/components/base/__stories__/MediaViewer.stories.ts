import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import MediaViewer from "../MediaViewer.vue";
import { useEditMode } from "@/composables/useEdit";
import {
  mediafileListMapping,
  mediafileOptions,
  stubMediafileFetch,
  withMediafileContext,
} from "./mediafileFixtures";

const meta: Meta<typeof MediaViewer> = {
  title: "Base/MediaViewer",
  component: MediaViewer,
  decorators: [withMediafileContext("story-media-viewer")],
  beforeEach: stubMediafileFetch,
  argTypes: {
    mediafiles: {
      control: "select",
      options: mediafileOptions,
      mapping: mediafileListMapping,
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Older media viewer: a mediafile list on the left and, on the right, the viewer that fits the selected file's mimetype (IIIF image, PDF, text, audio or video). " +
          "Text and PDF render from sample files; images need a live IIIF image server and audio/video need the collection API, so those only show their chrome here.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MediaViewer>;

export const Default: Story = {
  args: { mediafiles: "text" as never, loading: false },
  render: (args) => ({
    components: { MediaViewer },
    setup() {
      useEditMode("story-media-viewer-entity");
      provide("entityFormData", { id: "story-media-viewer-entity" });
      return { args };
    },
    template: `<div style="height:480px"><media-viewer v-bind="args" /></div>`,
  }),
};
