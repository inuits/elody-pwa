import { apolloClient } from "@/main";
import type {
  Entitytyping,
  BaseRelationValuesInput,
  BaseEntity,
} from "@/generated-types/queries";
import {
  type GetEntityByIdQueryVariables,
  GetEntityByIdDocument,
} from "@/generated-types/queries";
import { extractValueFromObject } from "@/helpers";

export const useInheritedRelations = () => {
  const getEntityById = (
    entityType: Entitytyping,
    id: string,
  ): Promise<BaseEntity> => {
    const variables: GetEntityByIdQueryVariables = {
      id: id,
      type: entityType,
    };
    return apolloClient
      .query({
        query: GetEntityByIdDocument,
        variables: variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        return result.data.Entity;
      });
  };

  const extractInheritedValue = async ({
    entityType,
    relationKey,
    valueKey,
    relations,
  }: {
    entityType: Entitytyping;
    relationKey: string;
    valueKey: string;
    relations: BaseRelationValuesInput[];
  }): Promise<string | null> => {
    const relation = relations.find((rel) => {
      return rel.type === relationKey;
    });
    if (!relation) return null;

    try {
      const entity = await getEntityById(entityType, relation?.key);
      const key = extractValueFromObject(entity, valueKey) as string[];
      return key?.[0] || null;
    } catch (e: any) {
      return null;
    }
  };

  return {
    extractInheritedValue,
  };
};
