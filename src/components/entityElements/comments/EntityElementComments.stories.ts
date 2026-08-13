import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementComments from "./EntityElementComments.vue";
import { setIgnorePermissions } from "@/composables/usePermissions";
import {
  Entitytyping,
  WysiwygExtensions,
  type CommentsElement,
} from "@/generated-types/queries";

// Comments are fetched per parent entity and gated on comment permissions.
// The story bypasses the permission mappings (no backend) and the mock
// Apollo client returns no comments, so the element renders its empty state.
const commentsElement = {
  __typename: "CommentsElement",
  label: "Comments",
  parentEntityFilterKey: "elody:1|relations.hasComment.key",
  composer: {
    __typename: "WysiwygElement",
    label: "comments.new-thread",
    metadataKey: "body",
    extensions: [WysiwygExtensions.StarterKit],
  },
} as unknown as CommentsElement;

const meta: Meta<typeof EntityElementComments> = {
  title: "EntityElements/Comments/EntityElementComments",
  component: EntityElementComments,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityElementComments },
    setup: () => {
      setIgnorePermissions(true);
      return { args };
    },
    template:
      '<div class="max-w-2xl p-4"><EntityElementComments v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityElementComments>;

export const Empty: Story = {
  args: {
    element: commentsElement,
    id: "asset-storybook-1",
    entityType: Entitytyping.Manifestation,
  },
};
