import type { Meta, StoryObj } from "@storybook/vue3-vite";

// The design-system toast anatomy (feedback.md): inverted surface, 10px
// radius, toast shadow. Status toasts are `role="status"` and may carry the
// undo action; error toasts are `role="alert"` and never auto-dismiss. The
// live markup is App.vue's <notifications> body template — this story renders
// the same anatomy statically so every state is visible side by side.
// Manifest id `components-toast--undo`.
const meta: Meta = {
  title: "Components/Toast",
  tags: ["autodocs"],
  parameters: {
    a11y: { test: "error" },
  },
};
export default meta;

type Story = StoryObj;

export const Undo: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-md flex-col gap-3 p-4">
        <div class="vue-notification success" role="status">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="notification-title">Relatie verwijderd</div>
              <div>Auteur "E. Pedersen" is losgekoppeld.</div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <button type="button" class="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-[#7DE3EA] underline decoration-dotted hover:text-neutral-white">
                Ongedaan maken
              </button>
              <button type="button" aria-label="Sluiten" class="cursor-pointer border-none bg-transparent p-0 text-neutral-white/70 hover:text-neutral-white">✕</button>
            </div>
          </div>
        </div>

        <div class="vue-notification error" role="alert">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="notification-title">Opslaan mislukt</div>
              <div>De server gaf een foutmelding. Probeer het opnieuw.</div>
            </div>
            <button type="button" aria-label="Sluiten" class="cursor-pointer border-none bg-transparent p-0 text-neutral-white/70 hover:text-neutral-white">✕</button>
          </div>
        </div>

        <div class="vue-notification warn" role="status">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="notification-title">Gedeeltelijk gelukt</div>
              <div>2 van 5 bestanden konden niet worden verwerkt.</div>
            </div>
            <button type="button" aria-label="Sluiten" class="cursor-pointer border-none bg-transparent p-0 text-neutral-white/70 hover:text-neutral-white">✕</button>
          </div>
        </div>

        <!-- Audit entry row: who changed what, when — shown under a saved
             field (see InlineFieldEditor). -->
        <div class="flex items-center gap-2 rounded-[5px] border border-neutral-30 bg-neutral-0 px-3 py-1.5 text-hint text-text-subtle">
          <span class="font-bold text-text-muted">gewijzigd</span>
          <span>Titel: "De ontdekking van de hemel"</span>
          <span class="ml-auto">14-08-2026 · j.doe</span>
        </div>
      </div>
    `,
  }),
};
