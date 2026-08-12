import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElement from "./EntityElement.vue";
import {
  Entitytyping,
  type EntityViewElements,
} from "@/generated-types/queries";

// EntityElement is the dispatcher that renders every element of an entity
// detail column based on __typename. The story feeds it self-contained
// elements (markdown, manifest viewer) that need no backend data.
const elements = {
  curatorNotes: {
    __typename: "MarkdownViewerElement",
    label: "Curator notes",
    isCollapsed: false,
    markdownContent:
      "# Delftware vase, ca. 1690\n\n" +
      "Tin-glazed earthenware attributed to the workshop of **Adrianus Kocx**.",
  },
  manifestViewer: {
    __typename: "ManifestViewerElement",
    label: "IIIF viewer",
    isCollapsed: false,
    manifestUrl: "",
    manifestVersion: 2,
  },
} as unknown as EntityViewElements;

const meta: Meta<typeof EntityElement> = {
  title: "EntityElements/EntityElement",
  component: EntityElement,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-3xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElement>;

export const MarkdownAndManifest: Story = {
  args: {
    elements,
    identifiers: ["asset-storybook-1"],
    id: "asset-storybook-1",
    entityType: Entitytyping.Manifestation,
  },
};

export const SingleMarkdownElement: Story = {
  args: {
    elements: {
      curatorNotes: (elements as any).curatorNotes,
    } as unknown as EntityViewElements,
    identifiers: ["asset-storybook-1"],
    id: "asset-storybook-1",
    entityType: Entitytyping.Manifestation,
  },
};
