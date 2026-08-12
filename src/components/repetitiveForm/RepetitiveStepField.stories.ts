import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RepetitiveStepField from "./RepetitiveStepField.vue";
import type { RepetitiveStep } from "@/generated-types/queries";

// A create-only step (no pickerQuery → skipSearch) with multiple creatable
// subtypes: the component shows the type chooser before mounting the create
// form. This is the state that renders without the entity-picker backend.
const chooseTypeStep = {
  key: "manifestation",
  label: "repetitiveForm.steps.manifestation",
  entityType: "manifestation",
  createForm: "",
  creatableTypes: [
    {
      label: "types.manifestation_book",
      entityType: "manifestation_book",
      createForm: "GetManifestationBookCreateForm",
    },
    {
      label: "types.manifestation_audio",
      entityType: "manifestation_audio",
      createForm: "GetManifestationAudioCreateForm",
    },
  ],
} as unknown as RepetitiveStep;

const meta: Meta<typeof RepetitiveStepField> = {
  title: "RepetitiveForm/RepetitiveStepField",
  component: RepetitiveStepField,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="w-[720px] p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof RepetitiveStepField>;

// skipSearch + two creatable types → the "pick a type to create" view.
// (The picker view and the create form itself need the GraphQL backend.)
export const CreateOnlyTypeChooser: Story = {
  args: {
    step: chooseTypeStep,
    skipSearch: true,
  },
};
