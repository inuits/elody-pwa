import { computed, ref } from "vue";
import { apolloClient } from "@/main";
import {
  AdvancedFilterTypes,
  EditStatus,
  Entitytyping,
  GetEntitiesDocument,
  SearchInputType,
  type BaseRelationValuesInput,
  type TaggableEntityConfiguration,
} from "@/generated-types/queries";
import { useManageEntities } from "@/composables/useManageEntities";
import { useAuth } from "@/composables/useAuth";

export type CommentStatus = "open" | "resolved";

export type Comment = {
  id: string;
  uuid: string;
  type: string;
  intialValues: {
    body?: string;
    status?: string;
    author_name?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
  };
  relationValues?: Record<string, { key: string; type?: string }[]>;
};

export type CommentThread = {
  subject: Comment;
  replies: Comment[];
  replyCount: number;
  status: CommentStatus;
};

/** ponytail: flat cap. Paginate subjects and lazy-load replies past this. */
const COMMENT_FETCH_LIMIT = 200;

const RELATION_PARENT_ENTITY = "refParentEntity";
const RELATION_SUBJECT = "refSubject";

/**
 * Groups a flat comment list into threads.
 *
 * A comment with no `refSubject` relation is a thread subject; everything else is a
 * reply to the subject it points at. Both facts live on the comment document, so one
 * query answers the whole page — see the module docstring on the fetch below.
 */
export const groupComments = (comments: Comment[]): CommentThread[] => {
  const isSubject = (comment: Comment) =>
    !comment.relationValues?.[RELATION_SUBJECT]?.length;

  const repliesBySubjectId = new Map<string, Comment[]>();
  comments.filter((comment) => !isSubject(comment)).forEach((reply) => {
    const subjectId = reply.relationValues![RELATION_SUBJECT][0].key;
    const existing = repliesBySubjectId.get(subjectId) ?? [];
    existing.push(reply);
    repliesBySubjectId.set(subjectId, existing);
  });

  const byCreationDate = (a: Comment, b: Comment) =>
    String(a.intialValues?.created_at ?? "").localeCompare(
      String(b.intialValues?.created_at ?? ""),
    );

  return comments
    .filter(isSubject)
    .sort((a, b) => byCreationDate(b, a)) // newest thread first
    .map((subject) => {
      const replies = (repliesBySubjectId.get(subject.id) ?? []).sort(
        byCreationDate,
      );
      return {
        subject,
        replies,
        replyCount: replies.length,
        // A subject created before the status property existed reads as open.
        status: (subject.intialValues?.status as CommentStatus) ?? "open",
      };
    });
};

/**
 * Reads the tagged entities back out of the composed HTML and turns them into
 * relations.
 *
 * The relation IS the notification trigger: `@` configurations carry a different
 * `relationType` than `#` ones, so "notify" versus "link only" is pure configuration
 * and there is no notify flag anywhere in the frontend.
 *
 * Derived from the HTML rather than the editor document on purpose: it is the exact
 * string being stored, so the relations can never disagree with the saved body, and
 * the caller needs no access to the editor instance. Matching is on the rendered
 * element name (`elody-<tag>`), which is a stabler contract than the internal node
 * type name.
 */
export const extractTaggedRelations = (
  html: string,
  configurations: TaggableEntityConfiguration[],
): BaseRelationValuesInput[] => {
  const relationTypeByElementName = new Map(
    configurations
      .filter((configuration) => configuration.tag)
      .map((configuration) => [
        `elody-${configuration.tag!.toLowerCase()}`,
        configuration.relationType,
      ]),
  );
  if (!relationTypeByElementName.size || !html) return [];

  const container = new DOMParser().parseFromString(
    `<div>${html}</div>`,
    "text/html",
  );

  // Keyed by relationType|entityId so the same user tagged twice yields one relation.
  const relations = new Map<string, BaseRelationValuesInput>();

  container.querySelectorAll("[data-entity-id]").forEach((element) => {
    const relationType = relationTypeByElementName.get(
      element.tagName.toLowerCase(),
    );
    const entityId = element.getAttribute("data-entity-id");
    if (!relationType || !entityId) return;
    relations.set(`${relationType}|${entityId}`, {
      key: entityId,
      type: relationType,
      editStatus: EditStatus.New,
    });
  });

  return [...relations.values()];
};

/**
 * Flattens an existing comment's relations back into a mutation payload.
 *
 * MutateEntityValues calls putRelations, a FULL replace, whenever `relations` is
 * present. Sending only the changed tag relations would wipe refParentEntity and
 * refSubject and orphan the comment, so every edit resends the current set with just
 * the tag relations swapped out.
 */
const flattenRelationsExceptTags = (
  comment: Comment,
  tagRelationTypes: string[],
): BaseRelationValuesInput[] =>
  Object.values(comment.relationValues ?? {})
    .flat()
    .filter((relation: any) => !tagRelationTypes.includes(relation.type))
    .map((relation: any) => ({ key: relation.key, type: relation.type }));

// Shared between the detail-page element and the globally-mounted thread modal, so
// opening a thread costs no extra request.
const parentEntityId = ref<string | undefined>(undefined);
const comments = ref<Comment[]>([]);
const isLoading = ref<boolean>(false);

export const useComments = () => {
  const { createEntity, saveEntityValues } = useManageEntities();
  const { getUserName } = useAuth();

  const threads = computed<CommentThread[]>(() => groupComments(comments.value));

  const threadFor = (subjectId: string): CommentThread | undefined =>
    threads.value.find((thread) => thread.subject.id === subjectId);

  const load = async (entityId: string): Promise<void> => {
    parentEntityId.value = entityId;
    isLoading.value = true;
    try {
      const response = await apolloClient.query({
        query: GetEntitiesDocument,
        variables: {
          type: Entitytyping.Comment,
          limit: COMMENT_FETCH_LIMIT,
          skip: 1,
          searchValue: { value: "", isAsc: true },
          advancedSearchValue: [],
          searchInputType: SearchInputType.AdvancedInputType,
          advancedFilterInputs: [
            {
              type: AdvancedFilterTypes.Type,
              value: "comment",
              match_exact: true,
            },
            {
              type: AdvancedFilterTypes.Selection,
              key: ["vlacc:1|properties.ref_parent_entity.value"],
              value: [entityId],
              match_exact: true,
            },
          ],
        },
        fetchPolicy: "no-cache",
      });
      comments.value = response.data?.Entities?.results ?? [];
    } finally {
      isLoading.value = false;
    }
  };

  const refresh = async (): Promise<void> => {
    if (parentEntityId.value) await load(parentEntityId.value);
  };

  const post = async ({
    entityId,
    subjectId,
    body,
    taggedRelations = [],
  }: {
    entityId: string;
    subjectId?: string;
    body: string;
    taggedRelations?: BaseRelationValuesInput[];
  }): Promise<void> => {
    await createEntity({
      entityType: Entitytyping.Comment,
      metadata: [
        { key: "body", value: body },
        { key: "author_name", value: getUserName() ?? "" },
        // Only a thread subject carries a status.
        ...(subjectId ? [] : [{ key: "status", value: "open" }]),
      ],
      relations: [
        {
          key: entityId,
          type: RELATION_PARENT_ENTITY,
          editStatus: EditStatus.New,
        },
        ...(subjectId
          ? [
              {
                key: subjectId,
                type: RELATION_SUBJECT,
                editStatus: EditStatus.New,
              },
            ]
          : []),
        ...taggedRelations,
      ],
    });
    await refresh();
  };

  const edit = async ({
    comment,
    body,
    taggedRelations = [],
  }: {
    comment: Comment;
    body: string;
    taggedRelations?: BaseRelationValuesInput[];
  }): Promise<void> => {
    const tagRelationTypes = [
      ...new Set(taggedRelations.map((relation) => relation.type)),
    ];
    await saveEntityValues(comment.id, {
      metadata: [{ key: "body", value: body }],
      relations: [
        ...flattenRelationsExceptTags(comment, tagRelationTypes),
        ...taggedRelations,
      ],
    });
    await refresh();
  };

  const setStatus = async (
    subject: Comment,
    status: CommentStatus,
  ): Promise<void> => {
    await saveEntityValues(subject.id, {
      metadata: [{ key: "status", value: status }],
      // Relations are untouched, but putRelations replaces whatever is sent, so the
      // current set has to travel along.
      relations: flattenRelationsExceptTags(subject, []),
    });
    await refresh();
  };

  return {
    threads,
    threadFor,
    comments,
    isLoading,
    parentEntityId,
    load,
    refresh,
    post,
    edit,
    setStatus,
  };
};
