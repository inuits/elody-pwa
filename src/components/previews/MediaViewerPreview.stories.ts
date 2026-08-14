import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MediaViewerPreview from "./MediaViewerPreview.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import ViewerToolbar from "@/components/ViewerToolbar.vue";

// Preview pane that hosts the media viewer for an entity's mediafiles. The
// viewer itself streams IIIF/audio/video from the backend, so the stories
// cover the loading and empty shells.
const meta: Meta<typeof MediaViewerPreview> = {
  title: "Components/MediaViewer",
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

/** Manifest id `components-mediaviewer--with-toolbar`: the viewer surface
 *  with the unified ViewerToolbar (zoom / home / fullscreen / rotate) as it
 *  sits over the OpenSeadragon canvas. Tiles stream from the backend, so the
 *  story composes the checkboard surface with the toolbar. */
export const WithToolbar: Story = {
  render: () => ({
    components: { ViewerToolbar },
    template: `
      <div class="checkboard relative h-[420px] w-[720px]">
        <ViewerToolbar
          mediafile-id="mediafile-001"
          original-filename="1902-C-14_voorzijde.tiff"
          image-filename="1902-C-14_voorzijde.jpg"
          :dimensions="{ width: 4800, height: 6000 }"
        />
      </div>
    `,
  }),
};

/** Manifest id `components-mediaviewer--pdf`: the viewer surface with the
 *  unified ViewerToolbar in PDF mode (page ‹n/m›, zoom, fullscreen,
 *  download). AV and text modes share the same capsule chrome. */
export const Pdf: Story = {
  render: () => ({
    components: { ViewerToolbar },
    template: `
      <div class="checkboard relative h-[420px] w-[720px]">
        <ViewerToolbar
          mode="pdf"
          :page-num="3"
          :page-count="12"
          mediafile-id="mediafile-002"
          original-filename="jaarverslag_1998.pdf"
        />
      </div>
    `,
  }),
};
