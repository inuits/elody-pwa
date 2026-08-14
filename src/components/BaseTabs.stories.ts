import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseTabs from "./BaseTabs.vue";
import BaseTab from "./BaseTab.vue";

const meta: Meta<typeof BaseTabs> = {
  title: "Components/BaseTabs",
  component: BaseTabs,
  tags: ["autodocs"],
  render: (args) => ({
    components: { BaseTabs, BaseTab },
    setup: () => ({ args }),
    template: `
      <div class="w-[36rem] p-4">
        <BaseTabs v-bind="args">
          <BaseTab>Metadata van het object: titel, vervaardiger, datering.</BaseTab>
          <BaseTab>Gekoppelde mediafiles (scans, foto's).</BaseTab>
          <BaseTab>Herkomst- en tentoonstellingsgeschiedenis.</BaseTab>
        </BaseTabs>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof BaseTabs>;

export const Default: Story = {
  args: {
    tabs: ["Metadata", "Media", "Geschiedenis"],
    tabNavigationDisabled: false,
  },
};

export const NavigationDisabled: Story = {
  args: {
    tabs: ["Metadata", "Media", "Geschiedenis"],
    tabNavigationDisabled: true,
  },
};

export const StepStrip: Story = {
  args: {
    tabs: ["Bestanden kiezen", "Metadata invullen", "Bevestigen"],
    tabNavigationDisabled: true,
    stepStrip: true,
  },
};
