import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementMedia from "./EntityElementMedia.vue";
import {
  MediaFileElementTypes,
  type MediaFileElement,
} from "@/generated-types/queries";

// The media element renders a BaseLibrary of mediafiles related to the parent
// entity. With the mock Apollo client every query resolves empty, so the
// story shows the element with an empty mediafile library.
const mediaElement = (
  overrides: Partial<MediaFileElement> = {},
): MediaFileElement =>
  ({
    __typename: "MediaFileElement",
    label: "Media",
    isCollapsed: false,
    type: MediaFileElementTypes.Media,
    ...overrides,
  }) as MediaFileElement;

const meta: Meta<typeof EntityElementMedia> = {
  title: "EntityElements/EntityElementMedia",
  component: EntityElementMedia,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-4xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof EntityElementMedia>;

export const EmptyLibrary: Story = {
  args: {
    element: mediaElement(),
    identifiers: ["asset-storybook-1"],
    relationType: "hasMediafile",
    entityId: "asset-storybook-1",
  },
};

export const Collapsed: Story = {
  args: {
    element: mediaElement({ isCollapsed: true }),
    identifiers: ["asset-storybook-1"],
    relationType: "hasMediafile",
    entityId: "asset-storybook-1",
  },
};
