import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImageViewer from "./ImageViewer.vue";

// Inline SVG stand-in for a museum thumbnail so no backend is needed.
const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#e8eef0"/>
      <circle cx="100" cy="80" r="40" fill="#003a52"/>
      <rect x="40" y="140" width="120" height="20" rx="4" fill="#9db4bf"/>
    </svg>`,
  );

const meta: Meta<typeof ImageViewer> = {
  title: "Base/ImageViewer",
  component: ImageViewer,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ImageViewer>;

export const DirectLink: Story = {
  args: {
    url: placeholderImage,
    mediaIsLink: true,
    heightClass: "h-40",
    widthClass: "w-40",
  },
};

// Non-link URLs are fetched through the mediafile API; without a backend the
// loading skeleton is what renders.
export const LoadingSkeleton: Story = {
  args: {
    url: "/api/mediafile/mediafile-123",
    mediaIsLink: false,
    heightClass: "h-40",
    widthClass: "w-40",
  },
};
