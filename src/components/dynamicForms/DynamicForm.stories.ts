import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DynamicForm from "./DynamicForm.vue";
import { router } from "../../../.storybook/mockMain";

// The dynamic form is entirely backend-driven: tabs, field order, validation
// and the submit zone come from the GetDynamicForm query for the given
// entity type. Under Storybook's mock Apollo client no form definition
// arrives, so this story shows the loading skeleton — the tabbed state needs
// a backend-driven form definition (see DynamicFormSkeleton for the skeleton
// itself and .storybook/DESIGN_SYSTEM_TODO.md for the open fixture work).
// Manifest id `repetitiveform-dynamicform--tabs`.
const meta: Meta<typeof DynamicForm> = {
  title: "RepetitiveForm/DynamicForm",
  component: DynamicForm,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-2xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof DynamicForm>;

export const Tabs: Story = {
  args: {
    dynamicFormQuery: "GetDynamicForm",
    router,
    showFormTitle: true,
  },
};
