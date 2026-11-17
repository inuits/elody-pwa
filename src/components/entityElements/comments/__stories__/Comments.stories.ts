import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted } from "vue";
import EntityElementComments from "../EntityElementComments.vue";
import CommentThreadModal from "../CommentThreadModal.vue";
import CommentComposer from "../CommentComposer.vue";
import { useEditMode } from "@/composables/useEdit";
import { useBaseModal } from "@/composables/useBaseModal";
import { useComments } from "@/composables/useComments";
import { registerQueryFixture } from "@/main";
import {
  ModalStyle,
  TypeModals,
  WysiwygExtensions,
} from "@/generated-types/queries";

const RECORD = "story-comments-book";
const FILTER_KEY = "relations.ref_parent_entity.key";

const composer = {
  __typename: "WysiwygElement",
  label: "Comment",
  metadataKey: "body",
  extensions: [WysiwygExtensions.StarterKit],
};

const element = {
  __typename: "CommentsElement",
  label: "Comments",
  parentEntityFilterKey: FILTER_KEY,
  readOnly: false,
  composer,
};

const comment = (
  id: string,
  author: { name: string; email: string },
  at: string,
  body: string,
  {
    subject,
    ...extra
  }: { subject?: string } & Record<string, string> = {},
) => ({
  __typename: "BaseEntity",
  id,
  uuid: id,
  type: "comment",
  intialValues: {
    author_name: author.name,
    created_by: author.email,
    created_at: at,
    body,
    ...extra,
  },
  relationValues: {
    ref_parent_entity: [{ key: RECORD, type: "ref_parent_entity" }],
    ...(subject
      ? { ref_subject: [{ key: subject, type: "ref_subject" }] }
      : {}),
  },
});

const marie = { name: "Marie Vermeulen", email: "marie@example.com" };
const jan = { name: "Jan Persoon", email: "jan@example.com" };
const me = { name: "Storybook User", email: "storybook@example.com" };

const comments = [
  comment(
    "c1",
    marie,
    "2026-08-18T09:14:00",
    "<p>The publisher is wrong: this is the 1994 reissue.</p>",
    { status: "open" },
  ),
  comment("c2", jan, "2026-08-12T15:40:00", "<p>Added the missing ISBN.</p>", {
    status: "resolved",
  }),
  comment("c3", jan, "2026-08-18T10:02:00", "<p>Right, I'll fix it.</p>", {
    subject: "c1",
  }),
  comment(
    "c4",
    me,
    "2026-08-18T11:30:00",
    "<p>Fixed it in the edition panel.</p>",
    { subject: "c1", edited_at: "2026-08-18T11:32:00" },
  ),
];

const registerFixtures = () => {
  registerQueryFixture("getElodyUser", { getElodyUser: null });
  registerQueryFixture("getEntities", {
    Entities: {
      __typename: "EntitiesResults",
      count: comments.length,
      limit: 200,
      results: comments,
    },
  });
};

const meta: Meta<typeof EntityElementComments> = {
  title: "Components/Comments",
  component: EntityElementComments,
  parameters: {
    docs: {
      description: {
        component:
          "The comments panel on a record: New discussion, then one card " +
          "per discussion with its status and reply count. A card opens " +
          "the discussion modal, where the replies sit indented under the " +
          "first comment and your own comments get Edit and Delete.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityElementComments>;

export const List: Story = {
  beforeEach: registerFixtures,
  render: () => ({
    components: { EntityElementComments, CommentThreadModal },
    setup: () => ({ element, id: RECORD }),
    template: `
      <div style="max-width:640px">
        <entity-element-comments :element="element" :id="id" />
        <comment-thread-modal />
      </div>`,
  }),
};

export const Thread: Story = {
  beforeEach: registerFixtures,
  render: () => ({
    components: { CommentThreadModal },
    setup() {
      const { closeModal, openModal } = useBaseModal();
      closeModal(TypeModals.CommentThread);
      onMounted(async () => {
        await useComments().load(RECORD, FILTER_KEY);
        openModal(
          TypeModals.CommentThread,
          ModalStyle.CenterWide,
          undefined,
          undefined,
          false,
          undefined,
          {
            subjectId: "c1",
            parentEntityId: RECORD,
            composer,
            createFields: [],
            canPost: true,
          },
        );
      });
      return {};
    },
    template: `<comment-thread-modal />`,
  }),
};

export const Composer: Story = {
  render: () => ({
    components: { CommentComposer },
    setup() {
      useEditMode("story-comment-composer").setPermittedEditMode({
        canUpdate: true,
      });
      return {
        composer,
        onSubmit: () => undefined,
      };
    },
    template: `
      <div style="max-width:560px;background:var(--color-surface)">
        <comment-composer
          scratch-form-id="story-comment-composer"
          :composer="composer"
          submit-label="Post"
          :cancellable="true"
          :on-submit="onSubmit"
        />
      </div>`,
  }),
};
