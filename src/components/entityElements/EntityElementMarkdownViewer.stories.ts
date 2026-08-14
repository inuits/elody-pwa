import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementMarkdownViewer from "./EntityElementMarkdownViewer.vue";
import type { MarkdownViewerElement } from "@/generated-types/queries";

const markdownElement = (
  overrides: Partial<MarkdownViewerElement> = {},
): MarkdownViewerElement =>
  ({
    __typename: "MarkdownViewerElement",
    label: "Curator notes",
    isCollapsed: false,
    markdownContent:
      "# Delftware vase, ca. 1690\n\n" +
      "Tin-glazed earthenware attributed to the workshop of **Adrianus Kocx**.\n\n" +
      "## Condition\n\n" +
      "- Hairline crack along the neck\n" +
      "- Restored chip on the base (1987)\n\n" +
      "See the [conservation report](#) for details.",
    ...overrides,
  }) as MarkdownViewerElement;

const meta: Meta<typeof EntityElementMarkdownViewer> = {
  title: "EntityElements/EntityElementMarkdownViewer",
  component: EntityElementMarkdownViewer,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-2xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementMarkdownViewer>;

export const Default: Story = {
  args: {
    element: markdownElement(),
  },
};

export const Collapsed: Story = {
  args: {
    element: markdownElement({ isCollapsed: true }),
  },
};

export const PlainParagraph: Story = {
  args: {
    element: markdownElement({
      label: "Provenance",
      markdownContent:
        "Acquired in 1923 from the estate of J. van den Berghe, Ghent. " +
        "Transferred to the museum collection in 1956.",
    }),
  },
};
