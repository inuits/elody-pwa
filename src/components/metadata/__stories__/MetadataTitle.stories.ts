import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataTitle from "../MetadataTitle.vue";

const meta: Meta<typeof MetadataTitle> = {
  title: "Metadata/MetadataTitle",
  component: MetadataTitle,
  parameters: {
    docs: {
      description: {
        component:
          "The label line of a field row: the label, then its adornments in " +
          "a fixed order (required `*` or one-of-required `◦`, then help). " +
          "Used by MetadataWrapper above every metadata value.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataTitle>;

export const Default: Story = {
  args: {
    metadata: {
      key: "title",
      label: "Title",
      tooltip: "",
    } as never,
    isFieldRequired: false,
    isOneOfRequired: false,
    isLocked: false,
  },
};

export const Adornments: Story = {
  render: () => ({
    components: { MetadataTitle },
    setup: () => ({
      rows: [
        { note: "plain", metadata: { key: "a", label: "Title" } },
        {
          note: "required",
          metadata: { key: "b", label: "Title" },
          required: true,
        },
        {
          note: "one of required",
          metadata: { key: "c", label: "Title" },
          oneOf: true,
        },
        {
          note: "help tooltip",
          metadata: {
            key: "d",
            label: "Title",
            tooltip: "The title as printed on the cover.",
          },
        },
        {
          note: "required + help",
          metadata: {
            key: "e",
            label: "Title",
            tooltip: "The title as printed on the cover.",
          },
          required: true,
        },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:140px auto;gap:12px 16px;align-items:center">
        <template v-for="row in rows" :key="row.metadata.key">
          <span style="font-size:var(--text-label);color:var(--color-text-secondary)">{{ row.note }}</span>
          <metadata-title :metadata="row.metadata" :is-field-required="row.required" :is-one-of-required="row.oneOf" />
        </template>
      </div>`,
  }),
};
