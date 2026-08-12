import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseToggleGroup from "./BaseToggleGroup.vue";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta<typeof BaseToggleGroup> = {
  title: "Base/BaseToggleGroup",
  component: BaseToggleGroup,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseToggleGroup>;

// A view-mode switcher as used above entity listings (list / grid / table).
export const ViewModes: Story = {
  args: {
    toggles: [
      { isOn: true, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
      { isOn: false, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
      { isOn: false, iconOn: DamsIcons.Table, iconOff: DamsIcons.Table },
    ] as any,
  },
};

export const TwoToggles: Story = {
  args: {
    toggles: [
      { isOn: true, iconOn: DamsIcons.Eye, iconOff: DamsIcons.Eye },
      { isOn: false, iconOn: DamsIcons.Edit, iconOff: DamsIcons.Edit },
    ] as any,
  },
};
