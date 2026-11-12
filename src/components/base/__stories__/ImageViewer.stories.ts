import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImageViewer from "../ImageViewer.vue";

const meta: Meta<typeof ImageViewer> = {
  title: "Base/ImageViewer",
  component: ImageViewer,
  argTypes: { onError: { action: "error" } },
  parameters: {
    docs: {
      description: {
        component:
          "Lazy thumbnail image: it loads once it scrolls into view, shows a pulsing placeholder meanwhile and emits error when the image cannot load. " +
          "With mediaIsLink the url is used as-is; otherwise it is fetched and shown as a blob, so authenticated mediafile urls work.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImageViewer>;

export const Default: Story = {
  args: {
    url: "/logo.svg",
    mediaIsLink: true,
    heightClass: "h-24",
    widthClass: "w-24",
  },
};
