import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseToast from "../BaseToast.vue";

const meta: Meta<typeof BaseToast> = {
  // Story id components-toast--undo, per MANIFEST.md.
  title: "Components/Toast",
  component: BaseToast,
  parameters: {
    docs: {
      description: {
        component:
          "One toast surface: inverted, white 12.5px, 10px radius, bottom " +
          "left. Severity is an accent bar, not a different box. Status " +
          "toasts are polite and dismiss after 6s; errors are alerts and " +
          "stay until dismissed. The undo action exists only on removal " +
          "toasts — after a save the undo lives inline next to the value, " +
          "because the row is still there to carry it.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseToast>;

export const Undo: Story = {
  render: () => ({
    components: { BaseToast },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;max-width:460px">
        <base-toast
          type="success"
          text="Relatie 'Jan Persoon' verwijderd"
          action-label="Ongedaan maken"
        />
        <base-toast
          type="warn"
          title="Gedeeltelijk geïmporteerd"
          text="3 van 5 bestanden geïmporteerd"
        />
        <base-toast
          type="error"
          title="Opslaan mislukt"
          text="De server accepteerde de wijziging niet"
        />

        <p style="font-size:var(--text-label);color:var(--color-text-secondary);margin-top:10px">
          audit entry — the trail row the history panel uses
        </p>
        <div role="log" style="border:1px solid var(--color-border-subtle);border-radius:var(--radius-card);padding:10px 14px">
          <p style="font-size:var(--text-micro);letter-spacing:.4px;text-transform:uppercase;color:var(--color-text-secondary)">
            Marie Vermeulen · 18-08-2026 14:02
          </p>
          <p style="font-size:var(--text-table)">
            Uitgever: Lannoo → Standaard Uitgeverij
          </p>
        </div>
      </div>`,
  }),
};
