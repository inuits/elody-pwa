import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, ref } from "vue";
import BaseInputCheckbox from "../BaseInputCheckbox.vue";
import { useBulkOperations } from "@/composables/useBulkOperations";

const meta: Meta<typeof BaseInputCheckbox> = {
  title: "Base/BaseInputCheckbox",
  component: BaseInputCheckbox,
  parameters: {
    docs: {
      description: {
        component:
          "A real <input type=\"checkbox\"> with a 1.5px border and a " +
          "commit-teal check. In a list the checkbox — not the row — owns the " +
          "accent wash and the accent row shadow; the row whose preview is " +
          "open is marked by a 3px accent left border instead. The two never " +
          "collapse into one state.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseInputCheckbox>;

/** Bulk-operations wiring is out of scope here: every story opts out. */
const base = {
  item: { id: "story-item", teaserMetadata: [] },
  bulkOperationsContext: undefined,
  ignoreBulkOperations: true,
};

export const Default: Story = {
  render: () => ({
    components: { BaseInputCheckbox },
    setup() {
      const unchecked = ref(false);
      const checked = ref(true);
      const indeterminate = ref(false);
      const indeterminateBox = ref<HTMLElement>();

      onMounted(() => {
        const input = indeterminateBox.value?.querySelector("input");
        if (input) (input as HTMLInputElement).indeterminate = true;
      });

      return { base, unchecked, checked, indeterminate, indeterminateBox };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <base-input-checkbox v-bind="base" v-model="unchecked" label="Unchecked" />
        <base-input-checkbox v-bind="base" v-model="checked" label="Checked" />
        <span ref="indeterminateBox">
          <base-input-checkbox v-bind="base" v-model="indeterminate" label="Partial selection" />
        </span>
        <base-input-checkbox v-bind="base" :model-value="false" label="Disabled" disabled />
        <base-input-checkbox v-bind="base" :model-value="true" label="Disabled and checked" disabled />
        <span style="display:flex;align-items:center;gap:8px">
          <base-input-checkbox v-bind="base" :model-value="false" aria-label="Select row" />
          <span style="font-size:var(--text-hint);color:var(--color-text-secondary)">
            no visible label — carries aria-label="Select row"
          </span>
        </span>
      </div>`,
  }),
};

export const FocusRing: Story = {
  name: "Focus ring",
  parameters: {
    docs: {
      description: {
        story: "Tab to the box: 2px focus ring, 1px offset — the same ring every control uses.",
      },
    },
  },
  render: () => ({
    components: { BaseInputCheckbox },
    setup: () => ({ base }),
    template: `<base-input-checkbox v-bind="base" :model-value="false" label="Tab here" />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { BaseInputCheckbox },
    setup() {
      const { createCustomContext, setBulkSelectionLimit, enqueueItemForBulkProcessing } =
        useBulkOperations();
      const limited = createCustomContext("StoryCheckboxLimit");
      setBulkSelectionLimit(limited, 1);
      enqueueItemForBulkProcessing(limited, { id: "picked", teaserMetadata: [] });
      return { base, limited, unchecked: ref(false), checked: ref(true) };
    },
    template: `
      <table style="border-spacing:16px 10px;font-size:var(--text-label)">
        <tr><td>unchecked</td><td><base-input-checkbox v-bind="base" v-model="unchecked" label="Unchecked" /></td></tr>
        <tr><td>checked</td><td><base-input-checkbox v-bind="base" v-model="checked" label="Checked" /></td></tr>
        <tr><td>focus</td><td><base-input-checkbox v-bind="base" :model-value="false" label="Tab to me" /></td></tr>
        <tr><td>disabled</td><td><base-input-checkbox v-bind="base" :model-value="false" label="Disabled" disabled /></td></tr>
        <tr><td>required</td><td><base-input-checkbox v-bind="base" :model-value="false" label="Required" required /></td></tr>
        <tr><td>limit reached</td><td>
          <base-input-checkbox :item="{ id: 'picked', teaserMetadata: [] }" :bulk-operations-context="limited" :model-value="true" label="Selected (1 of 1)" />
          <base-input-checkbox :item="{ id: 'other', teaserMetadata: [] }" :bulk-operations-context="limited" :model-value="false" label="Not selected: limit reached" />
        </td></tr>
      </table>`,
  }),
};
