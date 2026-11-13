import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RelationDiffList from "../RelationDiffList.vue";

const meta: Meta<typeof RelationDiffList> = {
  title: "History/RelationDiffList",
  component: RelationDiffList,
  parameters: {
    docs: {
      description: {
        component:
          "The relations of one version as chips. Added relations are green, " +
          "removed ones red and unchanged ones neutral; a renamed relation " +
          "shows its previous name in red and its current name in green, " +
          "both marked renamed. Added and removed chips also say so to " +
          "screen readers, so colour is never the only signal.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RelationDiffList>;

export const Default: Story = {
  args: {
    items: [
      { key: "maker-1", label: "Marie Vermeulen", status: "unchanged" },
      { key: "maker-2", label: "Jan Persoon", status: "added" },
      { key: "maker-3", label: "Lotte De Smet", status: "removed" },
    ],
  },
};

export const States: Story = {
  render: () => ({
    components: { RelationDiffList },
    setup: () => ({
      rows: [
        {
          name: "Unchanged",
          items: [{ key: "a", label: "Marie Vermeulen", status: "unchanged" }],
        },
        {
          name: "Added",
          items: [{ key: "b", label: "Jan Persoon", status: "added" }],
        },
        {
          name: "Removed",
          items: [{ key: "c", label: "Lotte De Smet", status: "removed" }],
        },
        {
          name: "Renamed, previous version",
          items: [
            {
              key: "d",
              label: "Stadsarchief",
              status: "renamed",
              variant: "previous",
            },
          ],
        },
        {
          name: "Renamed, current version",
          items: [
            {
              key: "d",
              label: "FelixArchief",
              status: "renamed",
              variant: "current",
            },
          ],
        },
      ],
    }),
    template: `
      <table style="border-collapse:separate;border-spacing:12px 8px">
        <tr v-for="row in rows" :key="row.name">
          <td style="font-size:var(--text-label);color:var(--color-text-secondary)">{{ row.name }}</td>
          <td><relation-diff-list :items="row.items" /></td>
        </tr>
      </table>`,
  }),
};
