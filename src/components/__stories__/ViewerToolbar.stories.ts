import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewerToolbar from "../ViewerToolbar.vue";

const meta: Meta<typeof ViewerToolbar> = {
  // Story ids components-mediaviewer--with-toolbar and --pdf, per MANIFEST.md.
  // The deep-zoom canvas itself is OpenSeadragon fed through Apollo, so the
  // stories show the one thing every mode shares: the toolbar over a dark
  // viewport, in image and pdf mode.
  title: "Components/MediaViewer",
  component: ViewerToolbar,
  parameters: {
    docs: {
      description: {
        component:
          "One ViewerToolbar for every viewer mode (media-viewer.md §Round " +
          "2): white glyphs on translucent dark capsules over the viewport, " +
          "26px buttons, every one of them named. PDF mode swaps in the page " +
          "‹ n/m › group and drops the image-only IIIF actions; PdfToolbar " +
          "is retired. Page changes clamp at either end rather than emitting " +
          "an invalid page.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewerToolbar>;

const viewport = (inner: string) => `
  <div style="position:relative;height:260px;background:var(--color-surface-inverted);
              border-radius:var(--radius-card);overflow:hidden">
    ${inner}
    <p style="position:absolute;bottom:12px;left:0;right:0;text-align:center;
              color:var(--color-text-on-inverted);opacity:.4;font-size:var(--text-ui)">
      viewport
    </p>
  </div>`;

export const WithToolbar: Story = {
  render: () => ({
    components: { ViewerToolbar },
    template: viewport(
      `<viewer-toolbar mediafile-id="m1" original-filename="noordzee.jpg" image-filename="noordzee.jpg" />`,
    ),
  }),
};

export const Pdf: Story = {
  render: () => ({
    components: { ViewerToolbar },
    template: viewport(
      `<viewer-toolbar mode="pdf" :page-num="3" :page-count="12" mediafile-id="m1" original-filename="verslag.pdf" />`,
    ),
  }),
};
