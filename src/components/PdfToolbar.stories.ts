import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PdfToolbar from "./PdfToolbar.vue";

// The toolbar positions itself absolutely on top of the PDF viewer, so the
// stories give it a relative container to sit in.
const meta: Meta<typeof PdfToolbar> = {
  title: "Components/PdfToolbar",
  component: PdfToolbar,
  tags: ["autodocs"],
  render: (args) => ({
    components: { PdfToolbar },
    setup: () => ({ args }),
    template:
      '<div class="relative h-16 w-full"><PdfToolbar v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof PdfToolbar>;

export const Default: Story = {
  args: {
    pageNum: 3,
    pageCount: 12,
    mediafileId: "mediafile-brief-1832",
    originalFilename: "brief_aan_de_conservator_1832.pdf",
  },
};

export const WithoutDownload: Story = {
  args: {
    pageNum: 1,
    pageCount: 4,
  },
};
