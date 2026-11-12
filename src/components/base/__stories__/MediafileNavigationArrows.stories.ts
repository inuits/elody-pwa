import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MediafileNavigationArrows from "../MediafileNavigationArrows.vue";

const meta: Meta<typeof MediafileNavigationArrows> = {
  title: "Base/MediafileNavigationArrows",
  component: MediafileNavigationArrows,
  argTypes: {
    onPrevious: { action: "previous" },
    onNext: { action: "next" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Previous / next buttons a media viewer shows when an entity has more than one mediafile. " +
          "They only emit; the viewer decides which file comes next.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MediafileNavigationArrows>;

export const Default: Story = {};
