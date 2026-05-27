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
  mapRelation: (r: BaseRelationValuesInput) => BaseRelationValuesInput,
): Promise<void> => {
  const current = ((entity.relationValues as Record<string, any>)?.[
    relationType
  ] ?? []) as BaseRelationValuesInput[];
  await apolloClient.mutate({
    mutation: MutateEntityValuesDocument,
    variables: {
      id: entity.id,
      formInput: { metadata: [], relations: current.map(mapRelation) },
      collection: Collection.Entities,
    },
  });
};

export const findInverseRelationType = (
  entity: Entity,
  targetKey: string,
): string | undefined => {
  const rv = (entity.relationValues ?? {}) as Record<string, any[]>;
  return Object.keys(rv).find((type) =>
    rv[type]?.some((r) => r.key === targetKey),
  );
};
