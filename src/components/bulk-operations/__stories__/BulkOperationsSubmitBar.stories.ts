import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BulkOperationsSubmitBar from "../BulkOperationsSubmitBar.vue";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta<typeof BulkOperationsSubmitBar> = {
  title: "BulkOperations/BulkOperationsSubmitBar",
  component: BulkOperationsSubmitBar,
  parameters: {
    docs: {
      description: {
        component:
          "The footer of the bulk edit and CSV export modals: the commit " +
          "button and Cancel. While the action cannot run yet, the button is " +
          "disabled and a question mark explains why.",
      },
    },
  },
  argTypes: {
    buttonIcon: { control: "select", options: Object.values(DamsIcons) },
    tooltipLabel: {
      control: "select",
      options: ["save", "export-csv", "submit", "upload", "updateMetadata"],
    },
    onSubmit: { action: "submit" },
    onCancel: { action: "cancel" },
    onDelete: { action: "delete" },
  },
};

export default meta;
type Story = StoryObj<typeof BulkOperationsSubmitBar>;

export const Default: Story = {
  args: {
    buttonLabel: "",
    tooltipLabel: "save",
    buttonIcon: DamsIcons.Edit,
    disabled: false,
    loading: false,
    showDeleteButton: false,
    selectedItemsCount: 3,
  },
};

export const States: Story = {
  render: () => ({
    components: { BulkOperationsSubmitBar },
    setup: () => ({ DamsIcons }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:560px">
        <bulk-operations-submit-bar :selected-items-count="3" />
        <bulk-operations-submit-bar button-label="Export to CSV" :button-icon="DamsIcons.DocumentInfo" tooltip-label="export-csv" disabled />
        <bulk-operations-submit-bar button-label="Save" :button-icon="DamsIcons.Save" loading />
      </div>`,
  }),
};
