import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseResizableTextarea from "./BaseResizableTextarea.vue";

const meta: Meta<typeof BaseResizableTextarea> = {
  title: "Base/BaseResizableTextarea",
  component: BaseResizableTextarea,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseResizableTextarea>;

export const Default: Story = {
  args: {
    modelValue: "Beschrijving van het object.",
  },
};

export const LongContent: Story = {
  args: {
    modelValue:
      "Dit schilderij werd in 1954 verworven uit een private collectie. " +
      "Het doek toont een zelfportret van de kunstenaar met strohoed, " +
      "geschilderd tijdens zijn verblijf in Parijs. De lijst is origineel " +
      "en werd in 2019 gerestaureerd door het atelier van het museum. " +
      "Het werk maakt deel uit van de vaste collectie en wordt bewaard " +
      "in depot B, rek 12.",
  },
};

export const Empty: Story = {
  args: {
    modelValue: "",
  },
};
