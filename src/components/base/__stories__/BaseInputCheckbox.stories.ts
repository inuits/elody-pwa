import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, ref } from "vue";
import BaseInputCheckbox from "../BaseInputCheckbox.vue";

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
        <base-input-checkbox v-bind="base" v-model="unchecked" label="Niet aangevinkt" />
        <base-input-checkbox v-bind="base" v-model="checked" label="Aangevinkt" />
        <span ref="indeterminateBox">
          <base-input-checkbox v-bind="base" v-model="indeterminate" label="Gedeeltelijke selectie" />
        </span>
        <base-input-checkbox v-bind="base" :model-value="false" label="Uitgeschakeld" disabled />
        <base-input-checkbox v-bind="base" :model-value="true" label="Uitgeschakeld en aangevinkt" disabled />
        <span style="display:flex;align-items:center;gap:8px">
          <base-input-checkbox v-bind="base" :model-value="false" aria-label="Selecteer rij" />
          <span style="font-size:var(--text-hint);color:var(--color-text-secondary)">
            no visible label — carries aria-label="Selecteer rij"
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
    template: `<base-input-checkbox v-bind="base" :model-value="false" label="Tab hierheen" />`,
  }),
};
