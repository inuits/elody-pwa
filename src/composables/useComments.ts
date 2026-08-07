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

const COMMENT_FETCH_LIMIT = 200;

const RELATION_PARENT_ENTITY = "refParentEntity";
const RELATION_SUBJECT = "refSubject";

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

export const tagElementName = (tag: string): string =>
  `elody-${tag.toLowerCase()}`;

export const tagRelationTypesOf = (
  configurations: TaggableEntityConfiguration[],
): string[] => [
  ...new Set(
    configurations
      .filter((configuration) => configuration.tag)
      .map((configuration) => configuration.relationType),
  ),
];

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

const commentsByParentEntity = ref<Record<string, Comment[]>>({});
const loadingParentEntities = ref<string[]>([]);
/**
 * Where a comment stores its parent entity, which is entirely client configuration (the
 * schema prefix and the property path both differ per client).
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
