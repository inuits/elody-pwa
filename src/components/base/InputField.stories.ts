import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InputField from "./InputField.vue";
import GraphqlQueryPanel from "../../../.storybook/components/GraphqlQueryPanel.vue";
import {
  InputfieldFragmentDoc,
  InputFieldTypes,
} from "@/generated-types/queries";

const meta: Meta<typeof InputField> = {
  title: "Base/InputField",
  component: InputField,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: Object.values(InputFieldTypes) },
  },
};
export default meta;

type Story = StoryObj<typeof InputField>;

export const Text: Story = {
  args: {
    label: "Title",
    type: InputFieldTypes.Text,
    modelValue: "",
  },
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};

// The Elody UI is GraphQL-driven: input fields are not hardcoded in the PWA
// but declared by baseGraphql as InputField objects. This story renders the
// component side by side with the fragment that declares it.
export const WithGraphqlDefinition: Story = {
  args: {
    label: "Title",
    type: InputFieldTypes.Text,
    modelValue: "",
  },
  parameters: { layout: "fullscreen" },
  render: (args) => ({
    components: { InputField, GraphqlQueryPanel },
    setup: () => ({ args, InputfieldFragmentDoc }),
    template: `
      <div class="p-6">
        <GraphqlQueryPanel
          :document="InputfieldFragmentDoc"
          title="inputfield fragment — the baseGraphql declaration this component renders"
        >
          <InputField v-bind="args" />
        </GraphqlQueryPanel>
      </div>
    `,
  }),
};
