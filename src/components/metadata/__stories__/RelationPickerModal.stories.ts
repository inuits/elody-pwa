import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, provide, ref } from "vue";
import RelationPickerModal from "../RelationPickerModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { registerQueryFixture } from "@/main";

const company = (id: string, name: string, city: string) => ({
  __typename: "BaseEntity",
  id,
  uuid: id,
  type: "company",
  intialValues: { __typename: "IntialValues", name, city },
});

const companies = [
  company("c-1", "Harbour Press", "Ghent"),
  company("c-2", "North Sea Publishers", "Ostend"),
  company("c-3", "Lighthouse Books", "Bruges"),
  company("c-4", "Scheldt & Sons", "Antwerp"),
  company("c-5", "Polder Prints", "Leuven"),
];

const registerResults = (results: unknown[]) =>
  registerQueryFixture("getEntities", {
    Entities: {
      __typename: "EntitiesResults",
      count: results.length,
      limit: 20,
      facets: [],
      results,
    },
  });

const optionsConfig = {
  entityType: "company",
  parent: ref("fetchAll"),
  searchFilterInput: { type: "text", key: ["name"], value: "*" },
  optionLabelKeys: ["name", "city"],
};

const modal = () => document.querySelector<HTMLElement>("dialog[open]");
const waitFor = async (find: () => HTMLElement | null | undefined) => {
  for (let i = 0; i < 40 && !find(); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  return find();
};

const render = (single: boolean, canCreate = false) => () => ({
  components: { RelationPickerModal },
  setup() {
    provide("config", { features: {} });
    onMounted(async () => {
      await nextTick();
      useBaseModal().openModal(TypeModals.RelationPicker, ModalStyle.Center);
    });
    return { optionsConfig, single, canCreate };
  },
  template: `<relation-picker-modal accepted-type="company" :options-config="optionsConfig" :single="single" :can-create="canCreate" />`,
});

const meta: Meta<typeof RelationPickerModal> = {
  title: "Modals/RelationPicker",
  component: RelationPickerModal,
  parameters: {
    docs: {
      description: {
        component:
          "The modal behind Browse… under a relation field: search entities " +
          "of the field's type and pick one (single) or several (multiple).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RelationPickerModal>;

export const Single: Story = {
  beforeEach: () => registerResults(companies),
  render: render(true),
};

export const Multiple: Story = {
  beforeEach: () => registerResults(companies),
  render: render(false),
  play: async () => {
    await waitFor(() => modal()?.querySelector("[role='option']"));
    const rows = modal()!.querySelectorAll<HTMLElement>("[role='option']");
    rows[0].click();
    rows[2].click();
    modal()?.querySelector("input")?.focus();
  },
};

export const NoResults: Story = {
  name: "No results",
  beforeEach: () => registerResults([]),
  render: render(false, true),
  play: async () => {
    const input = await waitFor(() => modal()?.querySelector("input"));
    if (!input) return;
    (input as HTMLInputElement).value = "Dune Press";
    input.dispatchEvent(new Event("input"));
  },
};
