import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SanitizedHtml from "./SanitizedHtml.vue";
import { SanitizeMode } from "@/generated-types/queries";

const meta: Meta<typeof SanitizedHtml> = {
  title: "Components/SanitizedHtml",
  component: SanitizedHtml,
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "select", options: Object.values(SanitizeMode) },
  },
  decorators: [() => ({ template: '<div class="w-[32rem] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof SanitizedHtml>;

export const Link: Story = {
  args: {
    mode: SanitizeMode.Link,
    content: "https://www.vlaamsekunstcollectie.be/collectie/1902-C-14",
    linkText: "Bekijk in de Vlaamse Kunstcollectie",
  },
};

export const Html: Story = {
  args: {
    mode: SanitizeMode.Html,
    content:
      "<p>Dit <strong>portret</strong> werd in <em>1902</em> verworven door het museum.</p><ul><li>Olieverf op doek</li><li>102 × 84 cm</li></ul>",
  },
};

export const HtmlWithStrippedScript: Story = {
  args: {
    mode: SanitizeMode.Html,
    content:
      '<p>Beschrijving met een verwijderde script-tag.</p><script>alert("xss")</script>',
  },
};
