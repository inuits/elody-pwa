import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SearchBar from "../SearchBar.vue";

const meta: Meta<typeof SearchBar> = {
  title: "Components/SearchBar",
  component: SearchBar,
  parameters: {
    docs: {
      description: {
        component:
          "The search pill (entity-picker.md): one 14px-radius pill holding " +
          "the icon, the input and the submit — not an input beside a " +
          "coloured block. Pill because searching only starts something " +
          "reversible. The icon-only variant opens the search overlay and " +
          "carries an accessible name; it had none before.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Pill: Story = {
  render: () => ({
    components: { SearchBar },
    template: `<div style="max-width:520px"><search-bar :input-enabled="true" /></div>`,
  }),
};

export const TriggerOnly: Story = {
  render: () => ({
    components: { SearchBar },
    template: `<search-bar :input-enabled="false" />`,
  }),
};
