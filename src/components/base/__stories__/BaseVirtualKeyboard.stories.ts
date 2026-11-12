import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import BaseVirtualKeyboard from "../BaseVirtualKeyboard.vue";

const meta: Meta<typeof BaseVirtualKeyboard> = {
  title: "Base/BaseVirtualKeyboard",
  component: BaseVirtualKeyboard,
  argTypes: {
    input: { control: "text" },
    keyboardClass: { control: "text" },
    layouts: { control: "object" },
    onOnChange: { action: "onChange" },
    onOnKeyPress: { action: "onKeyPress" },
    onIsOpen: { action: "isOpen" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Keyboard icon that opens an on-screen keyboard (simple-keyboard) " +
          "for typing scripts the user's own keyboard lacks. With more than " +
          "one layout, language buttons switch between them.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseVirtualKeyboard>;

export const Default: Story = {
  args: {
    input: "",
    keyboardClass: "story-virtual-keyboard",
    layouts: {
      Greek: {
        default: [
          "; ς ε ρ τ υ θ ι ο π {bksp}",
          "α σ δ φ γ η ξ κ λ {enter}",
          "{shift} ζ χ ψ ω β ν μ , . {shift}",
          "{space}",
        ],
        shift: [
          ": Σ Ε Ρ Τ Υ Θ Ι Ο Π {bksp}",
          "Α Σ Δ Φ Γ Η Ξ Κ Λ {enter}",
          "{shift} Ζ Χ Ψ Ω Β Ν Μ < > {shift}",
          "{space}",
        ],
      },
    },
  },
  render: (args) => ({
    components: { BaseVirtualKeyboard },
    setup() {
      const text = ref(args.input);
      watch(
        () => args.input,
        (next) => (text.value = next),
      );
      const change = (next: string) => {
        text.value = next;
        args.onOnChange?.(next);
      };
      return { args, text, change };
    },
    template: `
      <div style="display:flex;gap:8px;align-items:center;max-width:360px">
        <input aria-label="Typed text" :value="text" readonly style="flex:1" />
        <base-virtual-keyboard
          :key="args.keyboardClass + JSON.stringify(args.layouts)"
          :input="text"
          :keyboard-class="args.keyboardClass"
          :layouts="args.layouts"
          @on-change="change"
          @on-key-press="args.onOnKeyPress"
          @is-open="args.onIsOpen"
        />
      </div>`,
  }),
};
