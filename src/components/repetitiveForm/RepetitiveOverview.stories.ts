import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RepetitiveOverview from "./RepetitiveOverview.vue";
import type { RepetitiveStep } from "@/generated-types/queries";
import type { RepetitiveBranch } from "@/composables/useRepetitiveForm";

// The steps of a guided flow (e.g. VLACC's "add author": pick/create a person,
// then pick/create the work-level relation).
const steps = [
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
] as unknown as RepetitiveStep[];

// One branch = one completed pass through the steps, staged for commit.
const branches: RepetitiveBranch[] = [
  {
    entities: {
      author: [
        {
          key: "author",
          id: "person-1",
          type: "person" as any,
          label: "Tove Jansson",
          isNew: false,
          details: [
            { label: "metadata.labels.birth-year", value: "1914" },
            { label: "metadata.labels.nationality", value: "Finnish" },
          ],
        },
      ],
      function: [
        {
          key: "function",
          id: "function-1",
          type: "function" as any,
          label: "Author",
          isNew: false,
        },
      ],
    },
    pendingHostRelations: [],
  },
  {
    entities: {
      author: [
        {
          key: "author",
          id: "person-2",
          type: "person" as any,
          label: "Lars Jansson",
          isNew: true,
          details: [{ label: "metadata.labels.birth-year", value: "1926" }],
        },
      ],
      function: [
        {
          key: "function",
          id: "function-2",
          type: "function" as any,
          label: "Illustrator",
          isNew: true,
        },
      ],
    },
    pendingHostRelations: [],
  },
];

const meta: Meta<typeof RepetitiveOverview> = {
  title: "RepetitiveForm/RepetitiveOverview",
  component: RepetitiveOverview,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="w-[720px] p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof RepetitiveOverview>;

export const Empty: Story = {
  args: {
    branches: [],
    steps,
    repeatable: true,
  },
};

export const WithStagedBranches: Story = {
  args: {
    branches,
    steps,
    repeatable: true,
  },
};

// A non-repeatable flow hides "add another" once one branch is staged.
export const NonRepeatable: Story = {
  args: {
    branches: [branches[0]],
    steps,
    repeatable: false,
  },
};

export const Finishing: Story = {
  args: {
    branches,
    steps,
    repeatable: true,
    finishing: true,
  },
};
