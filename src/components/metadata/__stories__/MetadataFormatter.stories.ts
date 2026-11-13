import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import MetadataFormatter from "../MetadataFormatter.vue";

const meta: Meta<typeof MetadataFormatter> = {
  title: "Metadata/MetadataFormatter",
  component: MetadataFormatter,
  parameters: {
    docs: {
      description: {
        component:
          "Renders a value through the formatter the field declares: " +
          "`link|<type>` as a link, `pill` as a status or relation chip, " +
          "`regexpMatch` as plain text. An empty value reads as the muted " +
          '"No value".',
      },
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        provide("config", {
          routerConfig: [{ name: "Home", children: [] }],
        });
      },
      template: "<story />",
    }),
  ],
  argTypes: {
    formatter: {
      control: "select",
      options: ["link|production", "pill", "pill|auto", "regexpMatch"],
    },
    label: { control: "text", type: { name: "string", required: false } },
    unit: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataFormatter>;

export const Default: Story = {
  args: {
    formatter: "pill",
    label: "published",
    link: "/productions/1",
    openInNewTab: false,
    translationKey: "",
    unit: "",
  },
};

export const Variants: Story = {
  render: () => ({
    components: { MetadataFormatter },
    setup: () => ({
      rows: [
        {
          note: "link",
          formatter: "link|production",
          label: "Tales from the North Sea",
          link: "/productions/1",
        },
        { note: "status pill", formatter: "pill", label: "published" },
        { note: "relation pill", formatter: "pill|auto", label: "Jan Persoon" },
        {
          note: "regexp match",
          formatter: "regexpMatch",
          label: "ISBN 978-90-12345-67-8",
        },
        { note: "empty", formatter: "pill", label: "" },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:140px auto;gap:12px 16px;align-items:center">
        <template v-for="row in rows" :key="row.note">
          <span style="font-size:var(--text-label);color:var(--color-text-secondary)">{{ row.note }}</span>
          <div><metadata-formatter :formatter="row.formatter" :label="row.label" :link="row.link" /></div>
        </template>
      </div>`,
  }),
};
