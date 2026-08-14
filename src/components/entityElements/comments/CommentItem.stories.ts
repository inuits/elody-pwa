import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CommentItem from "./CommentItem.vue";
import type { Comment } from "@/composables/useComments";

const comment = (overrides: Record<string, unknown> = {}): Comment =>
  ({
    id: "comment-1",
    uuid: "comment-1",
    type: "comment",
    intialValues: {
      author_name: "Elke Peeters",
      body:
        "<p>The attribution to the Kocx workshop looks solid, but the base " +
        "mark differs from the 1690 reference piece. Can conservation have " +
        "another look before we publish?</p>",
      created_at: "2026-05-12T09:30:00Z",
      created_by: "user-elke",
    },
    ...overrides,
  }) as unknown as Comment;

const meta: Meta<typeof CommentItem> = {
  title: "EntityElements/Comments/CommentItem",
  component: CommentItem,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof CommentItem>;

export const Default: Story = {
  args: {
    comment: comment(),
  },
};

export const OpenThreadWithReplies: Story = {
  args: {
    comment: comment(),
    status: "open",
    replyCount: 3,
    clickable: true,
  },
};

export const Resolved: Story = {
  args: {
    comment: comment(),
    status: "resolved",
    replyCount: 1,
  },
};

export const Editable: Story = {
  args: {
    comment: comment(),
    canEdit: true,
  },
};

export const UnknownAuthor: Story = {
  args: {
    comment: comment({
      intialValues: {
        body: "<p>Imported annotation without author information.</p>",
        created_at: "2019-11-02",
      },
    }),
  },
};
