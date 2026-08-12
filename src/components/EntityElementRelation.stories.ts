import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementRelation from "./EntityElementRelation.vue";
import type { PanelRelation } from "@/generated-types/queries";

const meta: Meta<typeof EntityElementRelation> = {
  title: "Components/EntityElementRelation",
  component: EntityElementRelation,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementRelation>;

export const Default: Story = {
  args: {
    relation: {
      label: "Vervaardiger",
      value: "Michaelina Wautier (1604–1689)",
    } as PanelRelation,
  },
};

export const Collection: Story = {
  args: {
    relation: {
      label: "Deelcollectie",
      value: "Barokschilderkunst — Museum voor Schone Kunsten Gent",
    } as PanelRelation,
  },
};

export const EmptyValueRendersNothing: Story = {
  args: {
    relation: { label: "Vervaardiger", value: "" } as PanelRelation,
  },
};
