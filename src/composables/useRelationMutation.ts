import {
  Collection,
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
  const currentRelations = ((entity.relationValues as Record<string, any>)?.[
    relationType
  ] ?? []) as BaseRelationValuesInput[];
  await apolloClient.mutate({
    mutation: MutateEntityValuesDocument,
    variables: {
      id: entity.id,
      formInput: { metadata: [], relations: currentRelations.map(mapRelation) },
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
