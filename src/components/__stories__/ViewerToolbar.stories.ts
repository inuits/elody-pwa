import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewerToolbar from "../ViewerToolbar.vue";

const SAMPLE_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccbe6"/><stop offset="1" stop-color="#e7f1f6"/></linearGradient></defs>
    <rect width="640" height="260" fill="url(#sky)"/>
    <circle cx="470" cy="120" r="38" fill="#f6d77a"/>
    <rect y="250" width="640" height="150" fill="#2f6f8f"/>
    <path d="M0 262 Q80 252 160 262 T320 262 T480 262 T640 262 V275 H0Z" fill="#3d86a8"/>
    <path d="M220 238 h120 l-18 16 h-86z" fill="#5b4636"/><rect x="276" y="168" width="4" height="70" fill="#5b4636"/>
    <path d="M280 172 l44 58 h-44z" fill="#f4efe6"/>
  </svg>`,
)}`;

const meta: Meta<typeof ViewerToolbar> = {
  title: "Components/MediaViewer",
  component: ViewerToolbar,
  parameters: {
    docs: {
      description: {
        component:
          "The toolbar every media viewer shares. Image mode is wired to " +
          "OpenSeadragon in the app; Storybook has no IIIF image server, so " +
          "the image under the toolbar here is a plain sample image.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewerToolbar>;

const viewport = (inner: string, body = "") => `
  <div class="checkboard" style="position:relative;height:300px;overflow:hidden">
    ${inner}
    ${body}
  </div>`;

export const WithToolbar: Story = {
  render: () => ({
    components: { ViewerToolbar },
    setup: () => ({ image: SAMPLE_IMAGE }),
    template: viewport(
      `<viewer-toolbar mediafile-id="m1" original-filename="north-sea.jpg" image-filename="north-sea.jpg" />`,
      `<img :src="image" alt="Sample image" style="position:absolute;inset:0;width:100%;height:100%;padding:var(--viewer-toolbar-height) 0;box-sizing:border-box;object-fit:contain" />`,
    ),
  }),
};

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
