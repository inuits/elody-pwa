import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import BaseSearchPill from "../BaseSearchPill.vue";

const meta: Meta<typeof BaseSearchPill> = {
  title: "Base/BaseSearchPill",
  component: BaseSearchPill,
  argTypes: {
    modelValue: { control: "text" },
    label: { control: "text" },
    placeholder: { control: "text" },
    autofocus: { control: "boolean" },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Pill-shaped search input used in the search bar and the library " +
          "bar. The label is the accessible name; the pill itself carries " +
          "the focus ring.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseSearchPill>;

export const Default: Story = {
  args: {
    modelValue: "",
    label: "Search assets",
    placeholder: "Search…",
    autofocus: false,
  },
  render: (args) => ({
    components: { BaseSearchPill },
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
    template: `<div style="max-width:360px"><base-search-pill :label="args.label" :placeholder="args.placeholder" :autofocus="args.autofocus" :model-value="value" @update:model-value="update" /></div>`,
  }),
};
