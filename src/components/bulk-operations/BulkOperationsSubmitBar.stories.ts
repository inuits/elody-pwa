import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BulkOperationsSubmitBar from "./BulkOperationsSubmitBar.vue";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta<typeof BulkOperationsSubmitBar> = {
  title: "BulkOperations/BulkOperationsSubmitBar",
  component: BulkOperationsSubmitBar,
  tags: ["autodocs"],
  argTypes: {
    buttonIcon: { control: "select", options: Object.values(DamsIcons) },
  },
  decorators: [
    () => ({ template: '<div class="max-w-2xl p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof BulkOperationsSubmitBar>;

export const Default: Story = {
  args: {
    buttonLabel: "Save",
    buttonIcon: DamsIcons.Save,
    selectedItemsCount: 3,
  },
};

// Without an explicit label the button falls back to
// "edit <count> items" built from the selected items count.
export const CountLabel: Story = {
  args: {
    buttonIcon: DamsIcons.DocumentInfo,
    selectedItemsCount: 12,
  },
};

// Disabled with a tooltipLabel shows the question-mark hint explaining why
// the action is unavailable.
export const DisabledWithTooltip: Story = {
  args: {
    buttonLabel: "Export to CSV",
    tooltipLabel: "export-csv",
    buttonIcon: DamsIcons.FileExport,
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    buttonLabel: "Saving…",
    buttonIcon: DamsIcons.Save,
    loading: true,
  },
};
