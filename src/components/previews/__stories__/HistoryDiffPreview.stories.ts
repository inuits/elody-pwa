import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataFormatterPill from "@/components/metadata/MetadataFormatterPill.vue";

const meta: Meta = {
  // Story id components-historydiffpreview--two-column, per MANIFEST.md. The
  // wrapper itself resolves versions through the entity pipeline; the story
  // shows the diff's value states — which are design-owned pill variants —
  // in the two-column arrangement the docs draw.
  title: "Components/HistoryDiffPreview",
  parameters: {
    docs: {
      description: {
        component:
          "Version compare. Changed values are design-owned states, not " +
          "tenant pills: the old value struck in muted ink, the new one on " +
          "the changed tint — and the colour is never the only signal, every " +
          "diffed value carries a spoken was/nu prefix. Unchanged rows stay " +
          "plain. The docs also ask for one table with version column " +
          "headers rather than two aligned lists; that restructuring is " +
          "recorded in DESIGN_SYSTEM.md.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const TwoColumn: Story = {
  render: () => ({
    components: { MetadataFormatterPill },
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;max-width:640px;font-size:var(--text-table)">
        <p style="font-size:var(--text-micro);letter-spacing:.4px;text-transform:uppercase;color:var(--color-text-secondary)">
          Marie Vermeulen · 12-08-2026 09:14
        </p>
        <p style="font-size:var(--text-micro);letter-spacing:.4px;text-transform:uppercase;color:var(--color-text-secondary)">
          Jan Persoon · 18-08-2026 14:02
        </p>

        <template v-for="row in [
          { label: 'Titel', old: 'Verhalen uit de Noordzee', nieuw: 'Verhalen uit de Noordzee', changed: false },
          { label: 'Uitgever', old: 'Lannoo', nieuw: 'Standaard Uitgeverij', changed: true },
          { label: 'Jaar', old: '1987', nieuw: '1987', changed: false },
        ]" :key="row.label">
          <div :style="row.changed ? 'background:var(--color-accent-tint);border-radius:var(--radius-input);padding:4px 8px' : 'padding:4px 8px'">
            <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">{{ row.label }}</p>
            <metadata-formatter-pill v-if="row.changed" formatter="pill|modified" :label="row.old" />
            <p v-else style="color:var(--color-text-muted)">{{ row.old }}</p>
          </div>
          <div :style="row.changed ? 'background:var(--color-accent-tint);border-radius:var(--radius-input);padding:4px 8px' : 'padding:4px 8px'">
            <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">{{ row.label }}</p>
            <metadata-formatter-pill v-if="row.changed" formatter="pill|added" :label="row.nieuw" />
            <p v-else>{{ row.nieuw }}</p>
          </div>
        </template>
      </div>`,
  }),
};
