import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementHierarchyListViewer from "./EntityElementHierarchyListViewer.vue";
import type { HierarchyListElement } from "@/generated-types/queries";

// The hierarchy is resolved by walking relation values on the parent entity's
// form and fetching each ancestor. Without a backend the walk cannot start,
// so the story renders the element in its loading state (header + spinner).
const hierarchyElement = (
  overrides: Partial<HierarchyListElement> = {},
): HierarchyListElement =>
  ({
    __typename: "HierarchyListElement",
    label: "Storage location hierarchy",
    isCollapsed: false,
    customQuery: "GetEntityById",
    hierarchyRelationList: [],
    entityTypeAsCenterPoint: null,
    centerCoordinatesKey: null,
    ...overrides,
  }) as unknown as HierarchyListElement;

const meta: Meta<typeof EntityElementHierarchyListViewer> = {
  title: "EntityElements/EntityElementHierarchyListViewer",
  component: EntityElementHierarchyListViewer,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-3xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementHierarchyListViewer>;

export const Loading: Story = {
  args: {
    element: hierarchyElement(),
    entityId: "asset-storybook-1",
  },
};

export const Collapsed: Story = {
  args: {
    element: hierarchyElement({ isCollapsed: true }),
    entityId: "asset-storybook-1",
  },
};
