import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewerToolbar from "../ViewerToolbar.vue";

const meta: Meta<typeof ViewerToolbar> = {
  title: "Components/ViewerToolbar",
  component: ViewerToolbar,
  parameters: {
    docs: {
      description: {
        component:
          "The toolbar every media viewer shares, per mode. The full viewer " +
          "is in Base/MediaViewerNew.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewerToolbar>;

const viewport = (inner: string) => `
  <div class="checkboard" style="position:relative;height:300px;overflow:hidden">
    ${inner}
  </div>`;

export const Pdf: Story = {
  render: () => ({
    components: { ViewerToolbar },
    template: viewport(
      `<viewer-toolbar mode="pdf" :page="3" :page-count="12" mediafile-id="m1" original-filename="report.pdf" />`,
    ),
  }),
};

export const Modes: Story = {
  render: () => ({
    components: { ViewerToolbar },
    setup: () => ({
      rows: [
        { name: "image", props: { mode: "image", imageFilename: "north-sea.jpg" } },
        { name: "image, cropping allowed", props: { mode: "image", imageFilename: "north-sea.jpg", enableSelection: true } },
        { name: "image, cropped", props: { mode: "image", imageFilename: "north-sea.jpg", hasCropData: true, showingCropped: true, canRecrop: true } },
        { name: "pdf", props: { mode: "pdf", page: 1, pageCount: 12 } },
        { name: "text", props: { mode: "text" } },
        { name: "av", props: { mode: "av" } },
      ],
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div v-for="row in rows" :key="row.name">
          <code style="font-size:var(--text-label)">{{ row.name }}</code>
          <div class="checkboard" style="position:relative;height:var(--viewer-toolbar-height);overflow:hidden">
            <viewer-toolbar v-bind="row.props" mediafile-id="m1" original-filename="north-sea.jpg" />
          </div>
        </div>
      </div>`,
  }),
};
