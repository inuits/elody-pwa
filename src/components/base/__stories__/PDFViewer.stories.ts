import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PDFViewer from "../PDFViewer.vue";
import { mediafile, stubMediafileFetch } from "./mediafileFixtures";

const meta: Meta<typeof PDFViewer> = {
  title: "Base/PDFViewer",
  component: PDFViewer,
  beforeEach: stubMediafileFetch,
  parameters: {
    docs: {
      description: {
        component:
          "Renders a PDF mediafile page by page with pdf.js, under the shared viewer toolbar (paging, zoom, fullscreen). " +
          "The file is fetched from /api/mediafile/{id}; the story answers that request with a one-page sample PDF.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PDFViewer>;

export const Default: Story = {
  args: { source: mediafile("pdf") as never },
  render: (args) => ({
    components: { PDFViewer },
    setup: () => ({ args }),
    template: `<div style="height:480px"><p-d-f-viewer v-bind="args" /></div>`,
  }),
};
