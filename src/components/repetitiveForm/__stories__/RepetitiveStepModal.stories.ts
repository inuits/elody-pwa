import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RepetitiveStepModal from "../RepetitiveStepModal.vue";
import BaseButton from "@/components/base/BaseButton.vue";

const meta: Meta<typeof RepetitiveStepModal> = {
  // Story id repetitiveform-stepmodal--step, per MANIFEST.md.
  title: "RepetitiveForm/StepModal",
  component: RepetitiveStepModal,
  parameters: {
    docs: {
      description: {
        component:
          "The guided flow's dialog: the shared panel-shell header on the " +
          "overlay radius, a step strip on top, one step card per step on " +
          "the group-form surface, and the created-so-far log. The flow " +
          "logic lives in RepetitiveFlow and its composable; this story " +
          "shows the chrome those steps live in.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RepetitiveStepModal>;

export const Step: Story = {
  render: () => ({
    components: { RepetitiveStepModal, BaseButton },
    template: `
      <repetitive-step-modal :open="true" title="Auteur toevoegen">
        <ol style="display:flex;align-items:center;gap:8px;margin-bottom:18px;font-size:var(--text-ui)">
          <li aria-current="step" style="display:flex;align-items:center;gap:6px">
            <span style="width:24px;height:24px;border-radius:50%;background:var(--color-accent-accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700">1</span>
            <strong>Persoon</strong>
          </li>
          <li aria-hidden="true">›</li>
          <li style="display:flex;align-items:center;gap:6px;color:var(--color-text-secondary)">
            <span style="width:24px;height:24px;border-radius:50%;background:var(--color-surface-muted);display:inline-flex;align-items:center;justify-content:center;font-weight:700">2</span>
            Functie
          </li>
        </ol>

        <div style="background:var(--color-surface-group-form);border-radius:var(--radius-card);padding:16px;max-width:460px">
          <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Naam</p>
          <input class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" value="Jan Persoon" />
        </div>

        <h2 style="font-size:var(--text-micro);letter-spacing:.4px;text-transform:uppercase;color:var(--color-text-secondary);margin:18px 0 6px">
          Aangemaakt in deze sessie
        </h2>
        <ul role="log" style="max-width:460px">
          <li style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--color-border-subtle);border-radius:var(--radius-input);font-size:var(--text-table)">
            <span aria-hidden="true" style="color:var(--color-success)">✓</span>
            Marie Vermeulen
          </li>
        </ul>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px">
          <base-button button-style="ghost" button-size="sm" label="Vorige" style="width:auto" />
          <base-button button-style="primary" button-size="sm" label="Volgende" style="width:auto" />
        </div>
      </repetitive-step-modal>`,
  }),
};
