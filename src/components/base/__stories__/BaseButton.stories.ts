import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseButton from "../BaseButtonNew.vue";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta<typeof BaseButton> = {
  // Titled after the design-system component, not the file, so the story id
  // in MANIFEST.md (base-basebutton--variants) resolves.
  title: "Base/BaseButton",
  component: BaseButton,
  argTypes: {
    buttonStyle: {
      control: "select",
      options: ["primary", "commit", "secondary", "ghost", "danger"],
    },
    buttonSize: { control: "inline-radio", options: ["md", "sm"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Rectangle, 5–6px: a button executes immediately. The pill shape " +
          "belongs to actions that only start something reversible (add, " +
          "search, breadcrumb) — never to a mutating action.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseButton>;

const variants = [
  { style: "primary", label: "Open record", note: "the one action a screen leads with" },
  { style: "commit", label: "Save", note: "writes the change" },
  { style: "secondary", label: "Cancel", note: "everything alongside" },
  { style: "ghost", label: "Show more", note: "dense toolbars" },
  { style: "danger", label: "Delete", note: "destructive, always confirmable" },
];

export const Variants: Story = {
  render: () => ({
    components: { BaseButton },
    setup: () => ({ variants, DamsIcons }),
    template: `
      <table style="border-collapse:separate;border-spacing:12px 8px">
        <thead>
          <tr style="font-size:var(--text-label);color:var(--color-text-secondary);text-align:left">
            <th>variant</th><th>md</th><th>sm</th><th>with icon</th><th>loading</th><th>disabled</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="variant in variants" :key="variant.style">
            <td style="font-size:var(--text-label);white-space:nowrap">
              <code>{{ variant.style }}</code>
              <span style="display:block;color:var(--color-text-secondary)">{{ variant.note }}</span>
            </td>
            <td><base-button :button-style="variant.style" :label="variant.label" /></td>
            <td><base-button :button-style="variant.style" button-size="sm" :label="variant.label" /></td>
            <td><base-button :button-style="variant.style" :label="variant.label" :icon="DamsIcons.Save" /></td>
            <td><base-button :button-style="variant.style" :label="variant.label" loading /></td>
            <td><base-button :button-style="variant.style" :label="variant.label" disabled /></td>
          </tr>
        </tbody>
      </table>`,
  }),
};

export const States: Story = {
  name: "States",
  parameters: {
    docs: {
      description: {
        story:
          "Hover, focus and press are live — hover the first button, Tab to " +
          "the second for the 2px focus ring, hold the third for the press " +
          "scale. A loading button keeps its label, and so its width.",
      },
    },
  },
  render: () => ({
    components: { BaseButton },
    template: `
      <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
        <span v-for="state in ['hover me','tab to me','press me']" :key="state">
          <base-button button-style="primary" :label="state" />
        </span>
        <span style="display:inline-flex;gap:6px">
          <base-button button-style="commit" label="Save" />
          <base-button button-style="commit" label="Save" loading />
        </span>
      </div>`,
  }),
};

export const IconOnly: Story = {
  name: "Icon only",
  parameters: {
    docs: {
      description: {
        story:
          "An icon-only button needs an accessible name. Pass a label and let " +
          "the container query hide it, or give the button an aria-label.",
      },
    },
  },
  render: () => ({
    components: { BaseButton },
    setup: () => ({ DamsIcons }),
    template: `
      <div style="display:flex;gap:10px">
        <base-button button-style="ghost" :icon="DamsIcons.Edit" aria-label="Edit field" />
        <base-button button-style="secondary" :icon="DamsIcons.Trash" aria-label="Delete row" />
      </div>`,
  }),
};
