import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementCoordinateEdit from "./EntityElementCoordinateEdit.vue";
import type { InputField } from "@/generated-types/queries";

const numberInputField = { type: "number" } as InputField;

const meta: Meta<typeof EntityElementCoordinateEdit> = {
  title: "Components/EntityElementCoordinateEdit",
  component: EntityElementCoordinateEdit,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementCoordinateEdit>;

export const Default: Story = {
  args: {
    fieldKey: "location",
    label: "Vindplaats (coördinaten)",
    value: { latitude: "51.0543", longitude: "3.7174" },
    inputField: numberInputField,
    entityUuid: "asset-1902-c-14",
  },
};

export const NorthSea: Story = {
  args: {
    fieldKey: "sampling_point",
    label: "Staalnamepunt",
    value: { latitude: "51.4231", longitude: "2.8082" },
    inputField: numberInputField,
    entityUuid: "sample-vliz-0042",
  },
};
