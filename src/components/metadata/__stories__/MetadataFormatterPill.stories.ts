import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataFormatterPill from "../MetadataFormatterPill.vue";

const meta: Meta<typeof MetadataFormatterPill> = {
  title: "Metadata/MetadataFormatterPill",
  component: MetadataFormatterPill,
  parameters: {
    docs: {
      description: {
        component:
          "Status chips, letter badges and relation chips. Status and badge " +
          "colours come from the client's pill config, preferably as a tone; " +
          "relation chips use one platform colour. A value without config " +
          "stays plain text.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataFormatterPill>;

const row = (label: string, formatter: string, value: string) => `
  <span>${label}</span>
  <metadata-formatter-pill formatter="${formatter}" label="${value}" />`;

const grid = (rows: string) => `
  <div style="display:grid;grid-template-columns:180px auto;gap:10px 14px;
              align-items:center;justify-items:start;font-size:var(--text-label)">
    ${rows}
  </div>`;

/** Status chips: colours come from the client's pill config, by tone. */
export const Chips: Story = {
  render: () => ({
    components: { MetadataFormatterPill },
    template: grid(
      row("tone", "pill", "concept") +
        row("tone with icon", "pill", "approved") +
        row("explicit colours", "pill", "published") +
        row("no config: plain text", "pill", "unknown status") +
        row("relation chip", "pill|auto", "Jan Persoon"),
    ),
  }),
};

/** Entity types as one-letter badges, named in full for screen readers. */
export const Badges: Story = {
  render: () => ({
    components: { MetadataFormatterPill },
    template: grid(
      row("tone 1", "pill", "work") +
        row("tone 2", "pill", "expression") +
        row("tone 3", "pill", "manifestation"),
    ),
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
        <metadata-formatter-pill formatter="pill|auto" size="lg" label="Tales from the North Sea" />
        <metadata-formatter-pill formatter="pill" size="lg" label="published" />
      </div>`,
  }),
};
