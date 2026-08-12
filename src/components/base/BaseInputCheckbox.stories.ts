import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseInputCheckbox from "./BaseInputCheckbox.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

const item = { id: "entity-42", teaserMetadata: [] } as any;

const meta: Meta<typeof BaseInputCheckbox> = {
  title: "Base/BaseInputCheckbox",
  component: BaseInputCheckbox,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseInputCheckbox>;

export const Default: Story = {
  args: {
    modelValue: false,
    label: "Selecteer dit object",
    item,
    bulkOperationsContext: undefined,
    inputStyle: "accentNormal",
    ignoreBulkOperations: true,
  },
};

export const Checked: Story = {
  args: {
    modelValue: true,
    label: "Selecteer dit object",
    item,
    bulkOperationsContext: undefined,
    inputStyle: "accentNormal",
    ignoreBulkOperations: true,
  },
};

export const Required: Story = {
  args: {
    modelValue: true,
    label: "Verplichte selectie",
    item,
    // Required checkboxes enqueue their item on mount regardless of
    // ignoreBulkOperations, so they need a real bulk-operations context.
    bulkOperationsContext: BulkOperationsContextEnum.EntityElementList,
    inputStyle: "accentNormal",
    ignoreBulkOperations: true,
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    modelValue: false,
    label: "Niet beschikbaar",
    item,
    bulkOperationsContext: undefined,
    inputStyle: "accentNormal",
    ignoreBulkOperations: true,
    disabled: true,
  },
};
