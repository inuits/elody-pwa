import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseProgressStep from "./BaseProgressStep.vue";
import { ProgressStepStatus } from "@/generated-types/queries";

const meta: Meta<typeof BaseProgressStep> = {
  title: "Base/ProgressStep/BaseProgressStep",
  component: BaseProgressStep,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "select", options: Object.values(ProgressStepStatus) },
  },
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseProgressStep>;

export const Empty: Story = {
  args: {
    label: "upload-fields.labels.upload",
    showLabel: true,
    status: ProgressStepStatus.Empty,
  },
};

export const Loading: Story = {
  args: {
    label: "upload-fields.labels.upload",
    showLabel: true,
    status: ProgressStepStatus.Loading,
  },
};

export const Complete: Story = {
  args: {
    label: "upload-fields.labels.upload",
    showLabel: true,
    status: ProgressStepStatus.Complete,
  },
};

export const Failed: Story = {
  args: {
    label: "upload-fields.labels.upload",
    showLabel: true,
    status: ProgressStepStatus.Failed,
  },
};

export const IconOnly: Story = {
  args: {
    showLabel: false,
    status: ProgressStepStatus.Complete,
  },
};
