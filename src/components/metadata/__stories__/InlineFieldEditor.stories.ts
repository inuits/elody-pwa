import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import InlineFieldEditor from "../InlineFieldEditor.vue";

const meta: Meta<typeof InlineFieldEditor> = {
  // Story id metadata-inlinefieldeditor--editing, per MANIFEST.md.
  title: "Metadata/InlineFieldEditor",
  component: InlineFieldEditor,
  parameters: {
    docs: {
      description: {
        component:
          "The commit chrome a field row swaps to. It never mounts on its " +
          "own in the product — the row owns it — but its states are worth " +
          "pinning here, because saving is a flicker in the real app and the " +
          "error state needs a server that says no. The input arrives through " +
          "a slot, which is how every field type gets an inline editor " +
          "without re-implementing its input.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InlineFieldEditor>;

/**
 * The editor as a row opens it: the value carried over, Save not yet
 * available because nothing has changed.
 */
export const Editing: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    setup() {
      const value = ref("Tales from the North Sea");
      return { value, dirty: ref(false) };
    },
    template: `
      <div style="max-width:440px">
        <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">
          Title
        </p>
        <inline-field-editor :is-dirty="dirty">
          <input
            class="ds-input ds-input--defaultWithBorder"
            style="width:100%;font-size:var(--text-value)"
            v-model="value"
            @input="dirty = true"
          />
        </inline-field-editor>
      </div>`,
  }),
};

/**
 * The four states side by side. Pristine and dirty differ only in whether
 * Save can be pressed — that is the whole of pick-then-Save.
 */
export const States: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    template: `
      <div style="display:flex;flex-direction:column;gap:26px;max-width:440px">
        <div>
          <p style="font-size:var(--text-label);color:var(--color-text-secondary)">pristine — nothing to save yet</p>
          <inline-field-editor :is-dirty="false">
            <input class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" value="Tales from the North Sea" />
          </inline-field-editor>
        </div>

        <div>
          <p style="font-size:var(--text-label);color:var(--color-text-secondary)">dirty — Save becomes available</p>
          <inline-field-editor :is-dirty="true">
            <input class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" value="Tales from the Wadden Sea" />
          </inline-field-editor>
        </div>

        <div>
          <p style="font-size:var(--text-label);color:var(--color-text-secondary)">saving — inputs locked, spinner on Save</p>
          <inline-field-editor :is-dirty="true" :is-saving="true">
            <input class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" value="Tales from the Wadden Sea" disabled />
          </inline-field-editor>
        </div>

        <div>
          <p style="font-size:var(--text-label);color:var(--color-text-secondary)">error — the value is kept, the editor stays open</p>
          <inline-field-editor :is-dirty="true" error-message="inline-editor.save-failed">
            <input class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" value="Tales from the Wadden Sea" />
          </inline-field-editor>
        </div>
      </div>`,
  }),
};

/** A textarea keeps Enter for newlines; Ctrl+Enter commits. */
export const Multiline: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    template: `
      <div style="max-width:440px">
        <inline-field-editor :is-dirty="true" :multiline="true">
          <textarea class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" rows="3">A longer note from the cataloguer.</textarea>
        </inline-field-editor>
      </div>`,
  }),
};
