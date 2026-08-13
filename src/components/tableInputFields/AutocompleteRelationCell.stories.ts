import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AutocompleteRelationCell from "./AutocompleteRelationCell.vue";
import { InputFieldTypes, type InputField } from "@/generated-types/queries";

// A relation dropdown cell as baseGraphql would declare it: the cell searches
// entities of entityType and stores the picked entity id as the relation key.
// With the mock Apollo client every search resolves to an empty option list,
// so the stories show the cell's idle/empty states.
const relationInputField = {
  type: InputFieldTypes.DropdownSingleselectRelations,
  entityType: "person",
  relationType: "hasAuthor",
  canCreateEntityFromOption: false,
} as unknown as InputField;

const creatableInputField = {
  type: InputFieldTypes.DropdownSingleselectRelations,
  entityType: "genre",
  relationType: "hasGenre",
  canCreateEntityFromOption: true,
  deferEntityCreation: true,
  metadataKeyToCreateEntityFromOption: "name",
} as unknown as InputField;

const meta: Meta<typeof AutocompleteRelationCell> = {
  title: "TableInputFields/AutocompleteRelationCell",
  component: AutocompleteRelationCell,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-80 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof AutocompleteRelationCell>;

export const Empty: Story = {
  args: {
    modelValue: undefined,
    inputField: relationInputField,
    formId: "storybook-form",
    cellKey: "contributors[0].key",
  },
};

// A non-id model value (e.g. a plain label imported from CSV) is shown as-is
// as the selected option.
export const WithLabelValue: Story = {
  args: {
    modelValue: "Jazz",
    inputField: creatableInputField,
    formId: "storybook-form",
    cellKey: "genres[0].key",
  },
};

export const Disabled: Story = {
  args: {
    modelValue: undefined,
    inputField: relationInputField,
    formId: "storybook-form",
    disabled: true,
  },
};
