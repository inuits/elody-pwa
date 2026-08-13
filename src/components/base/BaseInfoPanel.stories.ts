import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseInfoPanel from "./BaseInfoPanel.vue";

const meta: Meta<typeof BaseInfoPanel> = {
  title: "Base/BaseInfoPanel",
  component: BaseInfoPanel,
  tags: ["autodocs"],
  // The panel teleports to body and floats at the bottom of the viewport.
  decorators: [() => ({ template: '<div class="h-96"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseInfoPanel>;

export const Default: Story = {
  args: {
    title: "Over deze collectie",
    content:
      "<p>Deze collectie bevat de gedigitaliseerde <strong>topstukken</strong> van het museum.</p>" +
      "<ul><li>1.245 schilderijen</li><li>530 werken op papier</li><li>112 sculpturen</li></ul>",
  },
};

export const PlainText: Story = {
  args: {
    title: "Licentie",
    content: "Alle afbeeldingen in deze reeks zijn vrijgegeven als publiek domein (CC0).",
  },
};
