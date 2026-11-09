import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CommentItem from "../CommentItem.vue";

const meta: Meta<typeof CommentItem> = {
  // Story id components-comments--thread, per MANIFEST.md.
  title: "Components/Comments",
  component: CommentItem,
  parameters: {
    docs: {
      description: {
        component:
          "Thread rows: author 12.5px bold over an 11px subtle timestamp, " +
          "the body below, and per-thread status as a chip on the " +
          "panel-header pair — never mint-on-white. A clickable card opens " +
          "its thread from the keyboard too, and the edit action carries the " +
          "author and time in its accessible name. Replies indent one level; " +
          "resolved threads collapse to a muted line with a check.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommentItem>;

const comment = (author: string, at: string, body: string) => ({
  id: "c1",
  intialValues: { author_name: author, created_at: at, body },
});

export const Thread: Story = {
  render: () => ({
    components: { CommentItem },
    setup: () => ({
      open: comment(
        "Marie Vermeulen",
        "2026-08-18T09:14:00",
        "<p>De uitgever klopt niet — dit is de heruitgave van 1994.</p>",
      ),
      reply: comment(
        "Jan Persoon",
        "2026-08-18T10:02:00",
        "<p>Klopt, ik pas het aan.</p>",
      ),
      resolved: comment(
        "Marie Vermeulen",
        "2026-08-12T15:40:00",
        "<p>Ontbrekend ISBN aangevuld.</p>",
      ),
    }),
    template: `
      <div role="log" aria-label="Opmerkingen"
           style="display:flex;flex-direction:column;gap:8px;max-width:520px">
        <comment-item :comment="open" status="open" :reply-count="1" :clickable="true" :can-edit="true" />
        <div style="margin-left:12px;border-left:1px solid var(--color-border-subtle);padding-left:12px">
          <comment-item :comment="reply" />
        </div>
        <comment-item :comment="resolved" status="resolved" />
      </div>`,
  }),
};
