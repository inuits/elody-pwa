import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MediaViewerPreview from "./MediaViewerPreview.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

// Preview pane that hosts the media viewer for an entity's mediafiles. The
// viewer itself streams IIIF/audio/video from the backend, so the stories
// cover the loading and empty shells.
const meta: Meta<typeof MediaViewerPreview> = {
  title: "Previews/MediaViewerPreview",
  component: MediaViewerPreview,
  tags: ["autodocs"],
  render: (args) => ({
    components: { MediaViewerPreview },
    setup: () => {
      // MediaViewerNew reads the shared mediafile selection state for its
      // (default) viewer context; register it so the empty state renders.
      useEntityMediafileSelector().addMediafileSelectionStateContext("");
      return { args };
    },
    template:
      '<div class="w-[720px] p-4"><MediaViewerPreview v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof MediaViewerPreview>;

export const Loading: Story = {
  args: {
    mediafiles: [],
    mediafilesLoading: true,
    entityId: "entity-1",
    cropMediafileCoordinatesKey: "",
  },
};

export const NoMediafiles: Story = {
  args: {
    mediafiles: [],
    mediafilesLoading: false,
    entityId: "entity-1",
    cropMediafileCoordinatesKey: "",
  },
};
