import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementSingleMedia from "./EntityElementSingleMedia.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import type { SingleMediaFileElement } from "@/generated-types/queries";

// The component reads its selected mediafile from the shared mediafile
// selection state under the "SingleMediaFileElement" context (normally seeded
// by the mediafile page). The story seeds that state itself. The image has no
// transcode (display_filename) yet, so the viewer shows its processing state
// instead of contacting a IIIF server.
const mediafile = {
  id: "mediafile-storybook-1",
  uuid: "mediafile-storybook-1",
  type: "mediafile",
  intialValues: {
    filename: "delftware-vase-front.jpg",
    original_filename: "delftware-vase-front.jpg",
    mimetype: "image/jpeg",
  },
} as any;

const element = {
  __typename: "SingleMediaFileElement",
  label: "Mediafile viewer",
  isCollapsed: false,
} as unknown as SingleMediaFileElement;

const meta: Meta<typeof EntityElementSingleMedia> = {
  title: "EntityElements/EntityElementSingleMedia",
  component: EntityElementSingleMedia,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityElementSingleMedia },
    setup: () => {
      const { mediafileSelectionState } = useEntityMediafileSelector();
      mediafileSelectionState.value["SingleMediaFileElement"] = {
        mediafiles: [mediafile],
        selectedMediafile: mediafile,
      } as any;
      return { args };
    },
    template:
      '<div class="max-w-4xl p-4"><EntityElementSingleMedia v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityElementSingleMedia>;

export const ProcessingImage: Story = {
  args: { element },
};

export const Collapsed: Story = {
  args: {
    element: {
      ...element,
      isCollapsed: true,
    } as unknown as SingleMediaFileElement,
  },
};
