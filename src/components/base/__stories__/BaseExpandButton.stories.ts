import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseExpandButton from "../BaseExpandButton.vue";

const meta: Meta<typeof BaseExpandButton> = {
  title: "Base/BaseExpandButton",
  component: BaseExpandButton,
  argTypes: {
    orientation: { control: "inline-radio", options: ["left", "right"] },
    isHidden: { control: "boolean" },
    onExpandMediaList: { action: "expandMediaList" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Arrow tab on the edge of the entity and history windows that " +
          "widens or narrows the media column. Each click flips the arrow " +
          "and emits the new expanded state.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseExpandButton>;

export const Default: Story = {
  args: { orientation: "right", isHidden: false },
};
