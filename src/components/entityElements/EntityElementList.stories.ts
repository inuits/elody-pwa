import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementList from "./EntityElementList.vue";
import { BaseLibraryModes, Entitytyping } from "@/generated-types/queries";

// The list element wraps BaseLibrary for a relation of the parent entity.
// The mock Apollo client answers every query with empty data, so the story
// shows the element chrome (header, library bar) with an empty result list.
const baseArgs = {
  isCollapsed: false,
  enableAdvancedFilters: false,
  enableNavigation: true,
  types: [Entitytyping.Manifestation] as string[],
  label: "Related assets",
  // No custom query: the element then falls back to the default entity query.
  customQuery: undefined as unknown as string,
  customQueryRelationType: undefined as unknown as string,
  customQueryFilters: undefined as unknown as string,
  searchInputType: "AdvancedInputType",
  entityList: [],
  identifiers: ["asset-storybook-1"],
  relationType: "components",
  entityId: "asset-storybook-1",
  entityType: Entitytyping.Manifestation,
  id: "asset-storybook-1",
};

const meta: Meta<typeof EntityElementList> = {
  title: "EntityElements/EntityElementList",
  component: EntityElementList,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-4xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementList>;

export const EmptyLibrary: Story = {
  args: { ...baseArgs },
};

export const Collapsed: Story = {
  args: { ...baseArgs, isCollapsed: true },
};

export const BasicModeWithBorder: Story = {
  args: {
    ...baseArgs,
    baseLibraryMode: BaseLibraryModes.BasicBaseLibraryWithBorder,
    disableLibraryBar: true,
  },
};
