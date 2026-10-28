import type { Ref } from "vue";
import type { Entity } from "@/generated-types/queries";
import { getEntityPageRoute } from "@/helpers";

let navigationEntitiesRef: Ref<Entity[]> | undefined = undefined;
let navigationListItemRouteName: string | undefined = undefined;

export const useEntityNavigation = () => {
  const setNavigationEntities = (
    entities: Ref<Entity[]> | undefined,
    listItemRouteName: string,
  ) => {
    navigationEntitiesRef = entities;
    navigationListItemRouteName = listItemRouteName;
  };

  const findIndexById = (id: string): number => {
    if (!navigationEntitiesRef?.value?.length || !navigationListItemRouteName)
      return -1;
    return navigationEntitiesRef.value.findIndex(
      (entity) =>
        getEntityPageRoute(entity, navigationListItemRouteName as string)
          .params.id === id,
    );
  };

  const getPreviousEntity = (currentId: string): Entity | undefined => {
    const index = findIndexById(currentId);
    if (index <= 0) return undefined;
    return navigationEntitiesRef?.value[index - 1];
  };

  const getNextEntity = (currentId: string): Entity | undefined => {
    const entities = navigationEntitiesRef?.value;
    const index = findIndexById(currentId);
    if (!entities || index === -1 || index === entities.length - 1)
      return undefined;
    return entities[index + 1];
  };

  const getPosition = (
    currentId: string,
  ): { index: number; total: number } | undefined => {
    const index = findIndexById(currentId);
    if (index === -1) return undefined;
    return { index: index + 1, total: navigationEntitiesRef!.value.length };
  };

  const getNavigationRoute = (entity: Entity) =>
    getEntityPageRoute(entity, navigationListItemRouteName as string);

  const hasNavigationEntities = (): boolean =>
    !!navigationEntitiesRef?.value?.length;

  return {
    setNavigationEntities,
    getPreviousEntity,
    getNextEntity,
    getPosition,
    getNavigationRoute,
    hasNavigationEntities,
  };
};
