import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BasePanelShell from "../BasePanelShell.vue";
import BaseButton from "../BaseButton.vue";

const meta: Meta<typeof BasePanelShell> = {
  // Story id entityelements-entityelementwindow--default, per MANIFEST.md:
  // this is the chrome that page names, now that it is one component.
  title: "EntityElements/EntityElementWindow",
  component: BasePanelShell,
  parameters: {
    docs: {
      description: {
        component:
          "The one panel chrome in the system: an 8px card with a 1px panel " +
          "border and no shadow — panels never float, only overlays do — " +
          "topped by an accent-light header with the title and an actions " +
          "slot. Detail panels, the preview beside a list and pickers all " +
          "wear it, so a panel looks the same wherever it turns up.\n\n" +
          "Both header colours are client-themed. Switch tenant in the " +
          "toolbar: the pale-accent clients keep dark ink, while podiumnet, " +
          "damsv2 and vliz flip the title to white on their own.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BasePanelShell>;

const rows = `
  <div style="padding:14px 16px;display:grid;gap:12px">
    <div>
      <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Titel</p>
      <p style="font-size:var(--text-value)">Verhalen uit de Noordzee</p>
    </div>
    <div>
      <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Uitgever</p>
      <p style="font-size:var(--text-value)">Lannoo</p>
    </div>
  </div>`;

export const Default: Story = {
  render: () => ({
    components: { BasePanelShell, BaseButton },
    template: `
      <div style="max-width:520px;display:flex;flex-direction:column;gap:20px">
        <base-panel-shell title="Titels">${rows}</base-panel-shell>

        <base-panel-shell title="Personen">
          <template #actions>
            <base-button button-style="secondary" button-size="sm" label="Acties" />
          </template>
          ${rows}
        </base-panel-shell>
      </div>`,
  }),
};
