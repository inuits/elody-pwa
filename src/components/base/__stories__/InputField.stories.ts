import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import InputField from "../InputField.vue";
import { Unicons } from "@/types";
import { InputFieldTypes } from "@/generated-types/queries";

const meta: Meta<typeof InputField> = {
  title: "Base/InputField",
  component: InputField,
  argTypes: {
    label: { control: "text" },
    modelValue: { control: "text" },
    debounce: { control: "boolean" },
    debounceWait: { control: "number" },
    icon: {
      control: "select",
      options: [undefined, ...Object.values(Unicons).map((icon) => icon.name)],
    },
    bgColor: { control: "text" },
    name: { control: "text" },
    isDisabled: { control: "boolean" },
    type: { control: "select", options: Object.values(InputFieldTypes) },
    accept: { control: "text" },
    step: { control: "number" },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Older labelled input with an optional leading icon and optional " +
          "debounced updates. New forms use BaseInputTextNumberDatetime.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputField>;

export const Default: Story = {
  args: {
    label: "Title",
    modelValue: "Self-portrait with fur cap",
    debounce: false,
    debounceWait: 400,
    icon: undefined,
    bgColor: "neutral-0",
    name: "",
    isDisabled: false,
    type: InputFieldTypes.Text,
    accept: "",
    step: undefined,
  },
  render: (args) => ({
    components: { InputField },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (next) => (value.value = next),
      );
      const update = (next: string) => {
        value.value = next;
        args["onUpdate:modelValue"]?.(next);
      };
      return { args, value, update };
    },
    template: `
      <div style="max-width:360px">
        <input-field
          :key="String(args.debounce) + args.debounceWait"
          :label="args.label"
          :debounce="args.debounce"
          :debounce-wait="args.debounceWait"
          :icon="args.icon"
          :bg-color="args.bgColor"
          :name="args.name"
          :is-disabled="args.isDisabled"
          :type="args.type"
          :accept="args.accept"
          :step="args.step"
          :model-value="value"
          @update:model-value="update"
        />
      </div>`,
  }),
};
