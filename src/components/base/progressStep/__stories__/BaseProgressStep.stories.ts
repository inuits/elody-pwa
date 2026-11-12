import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseProgressStep from "../BaseProgressStep.vue";
import { ProgressStepStatus } from "@/generated-types/queries";

const meta: Meta<typeof BaseProgressStep> = {
  title: "Base/BaseProgressStep",
  component: BaseProgressStep,
  argTypes: {
    label: { control: "text" },
    showLabel: { control: "boolean" },
    status: { control: "select", options: Object.values(ProgressStepStatus) },
  },
  parameters: {
    docs: {
      description: {
        component:
          "One step of the upload progress bar (validate, upload, process…). " +
          "Its colour and icon follow the step status; the label is a " +
          "translation key with a status sub-label.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseProgressStep>;

export const Default: Story = {
  args: {
    label: "actions.progress-steps.validate",
    showLabel: true,
    status: ProgressStepStatus.Loading,
  },
};

export const AllStatuses: Story = {
  render: () => ({
    components: { BaseProgressStep },
    setup: () => ({ statuses: Object.values(ProgressStepStatus) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;max-width:360px">
        <base-progress-step v-for="status in statuses" :key="status" :status="status" label="actions.progress-steps.validate" :show-label="true" />
      </div>`,
  }),
};
