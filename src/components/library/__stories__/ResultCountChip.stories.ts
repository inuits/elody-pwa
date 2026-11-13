import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ResultCountChip from "../ResultCountChip.vue";

const meta: Meta<typeof ResultCountChip> = {
  title: "Library/ResultCountChip",
  component: ResultCountChip,
  parameters: {
    docs: {
      description: {
        component:
          "The white count chip on the results band, the single place a list shows its total. " +
          'Above the listing cap it reads "1,000+ results" and becomes a button that loads the exact count.',
      },
    },
  },
  argTypes: {
    exactCount: { control: "number" },
    onRevealExactCount: { action: "revealExactCount" },
  },
};

export default meta;
type Story = StoryObj<typeof ResultCountChip>;

export const Default: Story = {
  args: { count: 642, exactCount: null, exactCountLoading: false },
};

export const States: Story = {
  render: () => ({
    components: { ResultCountChip },
    setup: () => ({
      rows: [
        { note: "one result", props: { count: 1 } },
        { note: "many results", props: { count: 642 } },
        {
          note: "capped: click to load the exact count",
          props: { count: 1001 },
        },
        {
          note: "loading the exact count",
          props: { count: 1001, exactCountLoading: true },
        },
        {
          note: "exact count revealed",
          props: { count: 1001, exactCount: 12587 },
        },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:auto 1fr;gap:12px 24px;align-items:center;background:var(--color-surface-panel-header);padding:16px">
        <template v-for="row in rows" :key="row.note">
          <span style="font-size:var(--text-label);color:var(--color-text-secondary)">{{ row.note }}</span>
          <span><result-count-chip v-bind="row.props" /></span>
        </template>
      </div>`,
  }),
};
