import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DynamicFormUploadButton from "./DynamicFormUploadButton.vue";
import {
  ActionProgressIndicatorType,
  DamsIcons,
} from "@/generated-types/queries";

const meta: Meta<typeof DynamicFormUploadButton> = {
  title: "DynamicForms/DynamicFormUploadButton",
  component: DynamicFormUploadButton,
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "select", options: Object.values(DamsIcons) },
    progressIndicatorType: {
      control: "select",
      options: Object.values(ActionProgressIndicatorType),
    },
  },
  decorators: [
    () => ({ template: '<div class="w-[480px] p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof DynamicFormUploadButton>;

// The shared upload state (useUpload) starts as "no-upload", so the stories
// show the initial call-to-action button of an upload FormAction.
export const Default: Story = {
  args: {
    label: "actions.labels.upload",
    icon: DamsIcons.Upload,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    label: "actions.labels.upload",
    icon: DamsIcons.Upload,
    disabled: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    label: "actions.labels.upload",
    icon: DamsIcons.NoIcon,
    disabled: false,
  },
};

// A FormAction can declare a progressSteps indicator; the step strip below the
// button fills up as the shared upload progress advances.
export const WithProgressStepsIndicator: Story = {
  args: {
    label: "actions.labels.upload",
    icon: DamsIcons.Upload,
    disabled: false,
    progressIndicatorType: ActionProgressIndicatorType.ProgressSteps,
  },
};
