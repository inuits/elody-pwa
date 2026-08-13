import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewerToolbar from "./ViewerToolbar.vue";

// The toolbar positions itself absolutely above the IIIF viewer, so the
// stories give it a relative container.
const meta: Meta<typeof ViewerToolbar> = {
  title: "Components/ViewerToolbar",
  component: ViewerToolbar,
  tags: ["autodocs"],
  render: (args) => ({
    components: { ViewerToolbar },
    setup: () => ({ args }),
    template:
      '<div class="relative h-16 w-full"><ViewerToolbar v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof ViewerToolbar>;

export const Default: Story = {
  args: {
    mediafileId: "mediafile-001",
    originalFilename: "1902-C-14_voorzijde.tiff",
    imageFilename: "1902-C-14_voorzijde.jpg",
    dimensions: { width: 4800, height: 6000 },
  },
};

export const WithSelectionTools: Story = {
  args: {
    mediafileId: "mediafile-001",
    originalFilename: "1902-C-14_voorzijde.tiff",
    imageFilename: "1902-C-14_voorzijde.jpg",
    dimensions: { width: 4800, height: 6000 },
    enableSelection: true,
  },
};

export const WithoutMediafile: Story = {
  args: {},
};
