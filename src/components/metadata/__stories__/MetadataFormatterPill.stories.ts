import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataFormatterPill from "../MetadataFormatterPill.vue";

const meta: Meta<typeof MetadataFormatterPill> = {
  title: "Metadata/MetadataFormatterPill",
  component: MetadataFormatterPill,
  parameters: {
    docs: {
      description: {
        component:
          "Two chips share this component. The relation chip is a design " +
          "decision — one fill, from the tokens — and means the value " +
          "navigates when clicked. The status chips are tenant config: their " +
          "colours come from the client's formatter settings, so they are the " +
          "one place a colour legitimately arrives from outside the system. " +
          "A value the client declared no colour for stays plain text.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataFormatterPill>;

export const Chips: Story = {
  render: () => ({
    components: { MetadataFormatterPill },
    template: `
      <div style="display:grid;grid-template-columns:190px auto;gap:10px 14px;
                  align-items:center;font-size:var(--text-label)">
        <span>relation chip — navigates</span>
        <metadata-formatter-pill formatter="pill|auto" label="Jan Persoon" />

        <span>configured — concept</span>
        <metadata-formatter-pill formatter="pill" label="concept" />

        <span>configured — gepubliceerd</span>
        <metadata-formatter-pill formatter="pill" label="gepubliceerd" />

        <span>configured — vervallen</span>
        <metadata-formatter-pill formatter="pill" label="vervallen" />

        <span>no colour configured</span>
        <metadata-formatter-pill formatter="pill" label="onbekende status" />

        <span>no group configured</span>
        <metadata-formatter-pill formatter="badge" label="concept" />
      </div>`,
  }),
};

/**
 * The lg size is the column heading in MultiEntityColumn, not a list chip; it
 * keeps the heading type scale it sits beside.
 */
export const Large: Story = {
  render: () => ({
    components: { MetadataFormatterPill },
    template: `
      <div style="display:flex;gap:12px;align-items:center">
        <metadata-formatter-pill formatter="pill|auto" size="lg" label="Verhalen uit de Noordzee" />
        <metadata-formatter-pill formatter="pill" size="lg" label="gepubliceerd" />
      </div>`,
  }),
};
