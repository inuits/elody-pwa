import {
  Collection,
  EditStatus,
  type BaseRelationValuesInput,
  type Entity,
  MutateEntityValuesDocument,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";

export const mutateEntityRelations = async (
  entity: Entity,
  relationType: string,
  mapRelation: (relation: BaseRelationValuesInput) => BaseRelationValuesInput,
): Promise<void> => {
  const relationValues = (entity.relationValues ?? {}) as Record<
    string,
    BaseRelationValuesInput[]
  >;
  // The backend's PUT /relations replaces the entity's ENTIRE relations array with
  // whatever is sent, so every type must be included here or untouched types get wiped.
  const relations = Object.entries(relationValues).flatMap(([type, rels]) =>
    (rels ?? []).map((relation) =>
      type === relationType
        ? mapRelation(relation)
        : { ...relation, editStatus: EditStatus.Unchanged },
    ),
  );
  await apolloClient.mutate({
    mutation: MutateEntityValuesDocument,
    variables: {
      id: entity.id,
      formInput: { metadata: [], relations },
      collection: Collection.Entities,
    },
  });
};

export const findInverseRelationType = (
  entity: Entity,
  targetKey: string,
): string | undefined => {
  const relationValues = (entity.relationValues ?? {}) as Record<string, any[]>;
  return Object.keys(relationValues).find((relationType) =>
    relationValues[relationType]?.some((relation) => relation.key === targetKey),
  );
};
