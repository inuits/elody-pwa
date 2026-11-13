import type { Meta, StoryObj } from "@storybook/vue3-vite";
import HistoryRelationDiff from "../HistoryRelationDiff.vue";

const meta: Meta<typeof HistoryRelationDiff> = {
  title: "History/HistoryRelationDiff",
  component: HistoryRelationDiff,
  parameters: {
    docs: {
      description: {
        component:
          "One relation field in a history version: its label over the " +
          'relation chips of that version, or "No items" when the version ' +
          "had none.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HistoryRelationDiff>;

export const Default: Story = {
  args: {
    label: "Makers",
    items: [
      { key: "maker-1", label: "Marie Vermeulen", status: "unchanged" },
      { key: "maker-2", label: "Jan Persoon", status: "added" },
      { key: "maker-3", label: "Lotte De Smet", status: "removed" },
    ],
  },
};

export const Empty: Story = {
  args: { label: "Makers", items: [] },
};
