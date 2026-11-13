import type { Meta, StoryObj } from "@storybook/vue3-vite";
import WYSIWYGInPlaceActions from "../WYSIWYGInPlaceActions.vue";

const meta: Meta<typeof WYSIWYGInPlaceActions> = {
  title: "EntityElements/WYSIWYGInPlaceActions",
  component: WYSIWYGInPlaceActions,
  argTypes: {
    onEdit: { action: "edit" },
    onSave: { action: "save" },
    onCancel: { action: "cancel" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The actions on a WYSIWYG field's label line: a pencil at rest, save and cancel while editing, and a spinner in their place while saving. " +
          "A read-only field shows nothing.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WYSIWYGInPlaceActions>;

export const Default: Story = {
  args: { label: "Description", canEdit: true, editing: false, saving: false },
};

export const States: Story = {
  render: () => ({
    components: { WYSIWYGInPlaceActions },
    setup: () => ({
      states: [
        {
          name: "resting, editable",
          canEdit: true,
          editing: false,
          saving: false,
        },
        {
          name: "resting, read-only",
          canEdit: false,
          editing: false,
          saving: false,
        },
        { name: "editing", canEdit: true, editing: true, saving: false },
        { name: "saving", canEdit: true, editing: true, saving: true },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:auto 1fr;gap:12px 24px;align-items:center;max-width:480px">
        <template v-for="state in states" :key="state.name">
          <code style="font-size:var(--text-label)">{{ state.name }}</code>
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--color-border-default);padding-bottom:4px">
            <span style="font-weight:700">Description</span>
            <w-y-s-i-w-y-g-in-place-actions label="Description" :can-edit="state.canEdit" :editing="state.editing" :saving="state.saving" />
          </div>
        </template>
      </div>`,
  }),
};
