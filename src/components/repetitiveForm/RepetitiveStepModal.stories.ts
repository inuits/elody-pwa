import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RepetitiveStepModal from "./RepetitiveStepModal.vue";

// The native <dialog> shell of the guided flow: a header with title + close
// button and a content slot. It renders in the browser top layer via
// showModal(), so the story mostly demonstrates the opened state.
const meta: Meta<typeof RepetitiveStepModal> = {
  title: "RepetitiveForm/RepetitiveStepModal",
  component: RepetitiveStepModal,
  tags: ["autodocs"],
  render: (args) => ({
    components: { RepetitiveStepModal },
    setup: () => ({ args }),
    template: `
      <RepetitiveStepModal v-bind="args">
        <p class="pb-2">Step content renders here.</p>
        <p class="text-text-light text-sm">
          The guided flow swaps pickers, create forms and the overview into
          this slot.
        </p>
      </RepetitiveStepModal>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof RepetitiveStepModal>;

export const Open: Story = {
  args: {
    open: true,
    title: "Step 1 of 2: Author",
  },
};

export const WithoutTitle: Story = {
  args: {
    open: true,
  },
};
