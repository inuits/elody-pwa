import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SpinnerLoader from "../SpinnerLoader.vue";

const meta: Meta<typeof SpinnerLoader> = {
  title: "Components/SpinnerLoader",
  component: SpinnerLoader,
  parameters: {
    docs: {
      description: {
        component:
          "One spinner: .8s rotation, commit teal. It is decorative — the " +
          "container it sits in announces the wait, so the spinner itself is " +
          "aria-hidden. Where the wait has a shape (a list, a set of options) " +
          "use a skeleton instead: a spinner says nothing about what is coming.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SpinnerLoader>;

export const Default: Story = {
  render: () => ({
    components: { SpinnerLoader },
    template: `
      <div style="display:flex;align-items:flex-end;gap:20px">
        <span v-for="size in [4, 5, 10, 16, 20]" :key="size" style="text-align:center">
          <spinner-loader :dimensions="size" />
          <code style="display:block;font-size:var(--text-hint);color:var(--color-text-secondary)">{{ size }}</code>
        </span>
      </div>`,
  }),
};

export const OnAccent: Story = {
  name: "Inherited ink",
  parameters: {
    docs: {
      description: {
        story:
          'theme="inherit" takes the surrounding ink instead of commit teal — ' +
          "how it renders inside a filled button.",
      },
    },
  },
  render: () => ({
    components: { SpinnerLoader },
    template: `
      <div style="display:flex;gap:16px">
        <span style="display:inline-flex;align-items:center;gap:6px;background:var(--color-accent);color:var(--color-text-on-accent);padding:6px 14px;border-radius:var(--radius-button);font-size:var(--text-ui);font-weight:700">
          <spinner-loader theme="inherit" :dimensions="4" /> Bezig met opslaan
        </span>
        <span style="display:inline-flex;align-items:center;gap:6px;background:var(--color-surface);border:1px solid var(--color-border-default);padding:6px 14px;border-radius:var(--radius-input);font-size:var(--text-ui)">
          <spinner-loader :dimensions="4" /> Laden
        </span>
      </div>`,
  }),
};
