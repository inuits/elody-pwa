import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TextViewer from "../TextViewer.vue";
import { mediafile, stubMediafileFetch } from "./mediafileFixtures";

const meta: Meta<typeof TextViewer> = {
  title: "Base/TextViewer",
  component: TextViewer,
  beforeEach: stubMediafileFetch,
  parameters: {
    docs: {
      description: {
        component:
          "Shows a plain-text mediafile under the shared viewer toolbar, with zoom. " +
          "The file is fetched from /api/mediafile/{id}; the story answers that request with a sample text.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextViewer>;

export const Default: Story = {
  args: { source: mediafile("text") as never },
  render: (args) => ({
    components: { TextViewer },
    setup: () => ({ args }),
    template: `<div style="height:420px"><text-viewer v-bind="args" /></div>`,
  }),
};
