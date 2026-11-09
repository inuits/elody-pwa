import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import AdvancedDropdown from "../AdvancedDropdown.vue";

const meta: Meta<typeof AdvancedDropdown> = {
  // Story id components-advanceddropdown--multi-search, per MANIFEST.md.
  title: "Components/AdvancedDropdown",
  component: AdvancedDropdown,
  parameters: {
    docs: {
      description: {
        component:
          "The overlay listbox behind every closed-list choice. Picking never " +
          "saves — the commit is the editor's Save — so the dropdown only " +
          "ever reports a choice upward. A list past ten options gets the " +
          "search field; a shorter one is read at a glance without it, and " +
          "multi-select keeps the popup open while several values are picked.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdvancedDropdown>;

const shortOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Expired", value: "expired" },
];

const provinces = [
  "Antwerp",
  "East Flanders",
  "West Flanders",
  "Flemish Brabant",
  "Limburg",
  "Hainaut",
  "Liège",
  "Luxembourg",
  "Namur",
  "Walloon Brabant",
  "Brussels",
  "Zeeland",
].map((name) => ({ label: name, value: name.toLowerCase() }));

/**
 * The two halves of the contract side by side: a long list that earns its
 * search field, and a multi-select that stays open while picking.
 */
export const MultiSearch: Story = {
  render: () => ({
    components: { AdvancedDropdown },
    setup() {
      return {
        shortOptions,
        provinces,
        single: ref(undefined),
        searchable: ref(undefined),
        multi: ref([]),
      };
    },
    template: `
      <div style="display:grid;grid-template-columns:210px 300px;gap:20px 14px;
                  align-items:start;font-size:var(--text-label);padding-bottom:280px">
        <span>single — 3 options, no search</span>
        <advanced-dropdown v-model="single" :options="shortOptions" label="Choose a status"
                           style-type="defaultWithBorder" />

        <span>single — 12 options, search</span>
        <advanced-dropdown v-model="searchable" :options="provinces" label="Choose a province"
                           style-type="defaultWithBorder" />

        <span>multi — popup stays open</span>
        <advanced-dropdown v-model="multi" :options="provinces" label="Choose provinces"
                           style-type="defaultWithBorder" multiple />

        <span>light border</span>
        <advanced-dropdown v-model="single" :options="shortOptions" label="Choose a status"
                           style-type="defaultWithLightBorder" />

        <span>disabled</span>
        <advanced-dropdown v-model="single" :options="shortOptions" label="Choose a status"
                           style-type="defaultWithBorder" disable />
      </div>`,
  }),
};
