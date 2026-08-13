import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementMetadata from "./EntityElementMetadata.vue";
import { BaseLibraryModes } from "@/generated-types/queries";

const meta: Meta<typeof EntityElementMetadata> = {
  title: "Metadata/EntityElementMetadata",
  component: EntityElementMetadata,
  tags: ["autodocs"],
  argTypes: {
    baseLibraryMode: {
      control: "select",
      options: Object.values(BaseLibraryModes),
    },
  },
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementMetadata>;

export const Text: Story = {
  args: {
    label: "Title",
    value: "Portrait of a Lady with a Fan",
  },
};

export const MultipleValues: Story = {
  args: {
    label: "Materials",
    value: ["oil paint", "canvas", "gilded wood"],
  },
};

export const Link: Story = {
  args: {
    label: "Source",
    value: "https://www.example-museum.org/collection/SK-A-1234",
    linkText: "View in online collection",
  },
};

export const Coordinates: Story = {
  args: {
    label: "Find spot",
    value: { latitude: 51.0543, longitude: 3.7174 },
  },
};

export const EmptyValue: Story = {
  args: {
    label: "Description",
    value: "",
  },
};
