import { ref } from "vue";
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
  comments
    .filter((comment) => !isSubject(comment))
    .forEach((reply) => {
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
 * The rendered element name for a configured tag.
 *
 * Lowercased because that is what the browser stores: `document.createElement` and
 * DOMPurify both normalise a custom element name, so a configuration with `tag: "User"`
 * still yields `<elody-user>` in the saved HTML. Every comparison against a live tag
 * name has to go through here or it silently stops matching.
 */
export const tagElementName = (tag: string): string =>
  `elody-${tag.toLowerCase()}`;

/**
 * The relation types this composer's tagging configuration can produce.
 *
 * Derived from the configuration and NOT from the tags a body happens to contain:
 * removing the last @mention has to leave that relation type in the exclusion list, or
 * flattenRelationsExceptTags resends the old relation and the un-tagged user stays
 * linked (and notified) forever.
 */
export const tagRelationTypesOf = (
  configurations: TaggableEntityConfiguration[],
): string[] => [
  ...new Set(
    configurations
      .filter((configuration) => configuration.tag)
      .map((configuration) => configuration.relationType),
  ),
];

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
        tagElementName(configuration.tag!),
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
 *
 * editStatus is required by BaseRelationValuesInput, so omitting it fails variable
 * coercion before the request reaches a resolver. Unchanged, because these relations
 * are exactly the ones being carried over; the resolver only special-cases Deleted
 * and strips the field before calling putRelations.
 */
export const flattenRelationsExceptTags = (
  comment: Comment,
  tagRelationTypes: string[],
): BaseRelationValuesInput[] =>
  Object.values(comment.relationValues ?? {})
    .flat()
    .filter((relation: any) => !tagRelationTypes.includes(relation.type))
    .map((relation: any) => ({
      key: relation.key,
      type: relation.type,
      editStatus: EditStatus.Unchanged,
    }));

/**
 * Shared between the detail-page element and the globally-mounted thread modal, so
 * opening a thread costs no extra request.
 *
 * Keyed by parent entity, not a single flat list: clicking a #tag opens EntityDetailModal,
 * which mounts a full EntitySingle — so a second comments element for a DIFFERENT entity
 * can be mounted at the same time as the first. One shared list meant the second mount
 * overwrote the first, and refresh() reloaded whichever entity happened to load last.
 */
const commentsByParentEntity = ref<Record<string, Comment[]>>({});
const loadingParentEntities = ref<string[]>([]);
/**
 * Where a comment stores its parent entity, which is entirely client configuration (the
 * schema prefix and the property path both differ per client). Module-level rather than
 * per-parent: it is the same value for every mount within a client, and keeping it lets
 * refresh() re-run a load whose caller is no longer in scope.
 */
let parentEntityFilterKey: string | undefined;

const parentEntityIdOf = (comment: Comment): string | undefined =>
  comment.relationValues?.[RELATION_PARENT_ENTITY]?.[0]?.key;

export const useComments = () => {
  const { createEntity, saveEntityValues } = useManageEntities();
  const { getUserName } = useAuth();

  const threadsFor = (entityId: string): CommentThread[] =>
    groupComments(commentsByParentEntity.value[entityId] ?? []);

  const isLoadingFor = (entityId: string): boolean =>
    loadingParentEntities.value.includes(entityId);

  // Scans every loaded parent: comment ids are globally unique, and the modal is opened
  // from whichever element loaded that thread.
  const threadFor = (subjectId: string): CommentThread | undefined =>
    Object.keys(commentsByParentEntity.value)
      .flatMap(threadsFor)
      .find((thread) => thread.subject.id === subjectId);

  const load = async (entityId: string, filterKey: string): Promise<void> => {
    parentEntityFilterKey = filterKey;
    loadingParentEntities.value = [...loadingParentEntities.value, entityId];
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
              key: [filterKey],
              value: [entityId],
              match_exact: true,
            },
          ],
        },
        fetchPolicy: "no-cache",
      });
      commentsByParentEntity.value = {
        ...commentsByParentEntity.value,
        [entityId]: response.data?.Entities?.results ?? [],
      };
    } finally {
      loadingParentEntities.value = loadingParentEntities.value.filter(
        (loading) => loading !== entityId,
      );
    }
  };

  // Reloads exactly the parent whose thread list changed, so the other mounted element
  // is left alone.
  const refresh = async (entityId: string | undefined): Promise<void> => {
    if (entityId && parentEntityFilterKey)
      await load(entityId, parentEntityFilterKey);
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
    await refresh(entityId);
  };

  const edit = async ({
    comment,
    body,
    taggedRelations = [],
    configurations,
  }: {
    comment: Comment;
    body: string;
    taggedRelations?: BaseRelationValuesInput[];
    /** The composer's tagging configuration — see tagRelationTypesOf. */
    configurations: TaggableEntityConfiguration[];
  }): Promise<void> => {
    await saveEntityValues(comment.id, {
      metadata: [{ key: "body", value: body }],
      relations: [
        ...flattenRelationsExceptTags(
          comment,
          tagRelationTypesOf(configurations),
        ),
        ...taggedRelations,
      ],
    });
    await refresh(parentEntityIdOf(comment));
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
    await refresh(parentEntityIdOf(subject));
  };

  return {
    threadsFor,
    threadFor,
    isLoadingFor,
    load,
    post,
    edit,
    setStatus,
  };
};
