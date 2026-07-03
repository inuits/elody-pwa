import { useImport } from "@/composables/useImport";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import {
  Collection,
  type EntityInput,
  type BaseEntity,
  type Entitytyping,
  type MetadataInput,
  type BaseRelationValuesInput,
} from "@/generated-types/queries";

type CreateEntityParams = {
  entityType: Entitytyping;
  metadata?: MetadataInput[];
  relations?: BaseRelationValuesInput[];
};

type AddRelationsParams = {
  entityId: string;
  relations: BaseRelationValuesInput[];
};

export const useManageEntities = () => {
  const { loadDocument } = useImport();
  const { selectedTenant } = useTenant(undefined);

  const createEntityFromInput = (
    entityType: Entitytyping,
    metadata: MetadataInput[],
    relations: BaseRelationValuesInput[] = []
  ): EntityInput => {
    const entity: EntityInput = { type: entityType };
    entity.metadata = metadata;
    entity.relations = relations;
    return entity;
  };

  const createEntity = async ({
    entityType,
    metadata = [],
    relations = [],
  }: CreateEntityParams): Promise<BaseEntity> => {
    const query = await loadDocument("CreateEntity");
    const response = await performCreatingEnty(
      query,
      createEntityFromInput(entityType, metadata, relations)
    );
    return response.data.CreateEntity;
  };

  const performCreatingEnty = async (
    queryDocument: any,
    entity: EntityInput
  ): Promise<any> => {
    return await apolloClient.mutate({
      mutation: queryDocument,
      variables: { entity, tenantId: selectedTenant.value },
    });
  };

  const addRelations = async ({
    entityId,
    relations,
  }: AddRelationsParams): Promise<void> => {
    if (relations.length === 0) return;
    const mutation = await loadDocument("AddEntityRelations");
    await apolloClient.mutate({
      mutation,
      variables: {
        id: entityId,
        relations,
        collection: Collection.Entities,
      },
    });
  };

  return {
    createEntity,
    addRelations,
  };
};
