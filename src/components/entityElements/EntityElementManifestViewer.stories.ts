import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementManifestViewer from "./EntityElementManifestViewer.vue";
import type { ManifestViewerElement } from "@/generated-types/queries";

// The actual IIIF viewer (tify/mirador) is lazy-loaded only when a
// manifestUrl is present; without one the element renders its header,
// collection actions and the "no manifest" empty state.
const manifestElement = (
  overrides: Partial<ManifestViewerElement> = {},
): ManifestViewerElement =>
  ({
    __typename: "ManifestViewerElement",
    label: "IIIF viewer",
    isCollapsed: false,
    manifestUrl: "",
    manifestVersion: 2,
    ...overrides,
  }) as ManifestViewerElement;

const meta: Meta<typeof EntityElementManifestViewer> = {
  title: "EntityElements/EntityElementManifestViewer",
  component: EntityElementManifestViewer,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-3xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementManifestViewer>;

export const NoManifest: Story = {
  args: {
    element: manifestElement(),
  },
};

export const Collapsed: Story = {
  args: {
    element: manifestElement({ isCollapsed: true }),
  },
};
