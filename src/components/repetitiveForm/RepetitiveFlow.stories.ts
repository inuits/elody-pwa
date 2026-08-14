import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RepetitiveFlow from "./RepetitiveFlow.vue";
import type { RepetitiveForm } from "@/generated-types/queries";

// A minimal non-linear, repeatable flow config as baseGraphql would return it
// (GetRepetitiveForm). Non-linear flows open on the overview, so the story
// renders the staging screen without needing the entity picker's backend.
const flowConfig = {
  label: "repetitiveForm.add-authors",
  repeatable: true,
  linear: false,
  steps: [
    {
      key: "author",
      label: "repetitiveForm.steps.author",
      entityType: "person",
      createForm: "GetPersonCreateForm",
      pickerQuery: "GetPersonsPickerQuery",
    },
    {
      key: "function",
      label: "repetitiveForm.steps.function",
      entityType: "function",
      createForm: "GetFunctionCreateForm",
      pickerQuery: "GetFunctionsPickerQuery",
    },
  ],
} as unknown as RepetitiveForm;

const meta: Meta<typeof RepetitiveFlow> = {
  title: "RepetitiveForm/RepetitiveFlow",
  component: RepetitiveFlow,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof RepetitiveFlow>;

// Opens on the overview ("no entities yet" + add/finish buttons). Clicking
// "add another" moves to the first step, which needs a real picker backend, so
// the story is meant for the overview stage of the flow.
export const OverviewStage: Story = {
  args: {
    open: true,
    config: flowConfig,
  },
};
