import type { Entitytyping, ActionsOnResult } from "@/generated-types/queries";
import { ref } from "vue";

const acceptedTypes = ref<Entitytyping[]>([]);
const entityUuid = ref<string>("");
const entityId = ref<string>("");
const parentEntityType = ref<Entitytyping[]>([]);
const refetchEntitiesFunction = ref<Function | undefined>(undefined);
const relationType = ref<string | "no-type-set">("no-type-set");
const customGetEntitiesQuery = ref<string>("");
const customGetEntitiesFiltersQuery = ref<string>("");
const isCropModeEnabled = ref<boolean>(false);
const cropCoordinatesKey = ref<string>("");
const actionsOnResult = ref<ActionsOnResult | undefined>(undefined);

const useEntityPickerModal = () => {
  const setAcceptedTypes = (types: Entitytyping[]) => {
    acceptedTypes.value = types;
  };

  const setEntityId = (id: string) => {
    entityId.value = id;
  };

  const setEntityUuid = (id: string) => {
    entityUuid.value = id;
  };

  const setParentEntityType = (parentEntityTypes: Entitytyping[]) => {
    parentEntityType.value = parentEntityTypes;
  };

  const setRefetchEntitiesFunction = (refetchEntities: Function) => {
    refetchEntitiesFunction.value = refetchEntities;
  };

  const setRelationType = (type: string) => {
    relationType.value = type;
  };

  const setCustomGetEntitiesQuery = (query: string) => {
    customGetEntitiesQuery.value = query;
  };

  const setCustomGetEntitiesFiltersQuery = (query: string) => {
    customGetEntitiesFiltersQuery.value = query;
  };

  const setCropMode = (state: boolean) => {
    isCropModeEnabled.value = state;
  };

  const setCropCoordinatesKey = (value: string) => {
    cropCoordinatesKey.value = value;
  };

  const setActionsOnResult = (value: string) => {
    actionsOnResult.value = value;
  };

  const getAcceptedTypes = () => acceptedTypes.value;
  const getEntityUuid = () => entityUuid.value;
  const getEntityId = () => entityId.value;
  const getParentEntityType = () => parentEntityType.value;
  const getRefetchEntitiesFunction = () => refetchEntitiesFunction.value;
  const getRelationType = () => relationType.value;
  const getCustomGetEntitiesQuery = () => customGetEntitiesQuery.value;
  const getCustomGetEntitiesFiltersQuery = () =>
    customGetEntitiesFiltersQuery.value;
  const getIsCropModeEnabled = () => isCropModeEnabled.value;
  const getCropCoordinatesKey = () => cropCoordinatesKey.value;
  const getActionsOnResult = () => actionsOnResult.value;

  return {
    getAcceptedTypes,
    getEntityUuid,
    getEntityId,
    getParentEntityType,
    getRefetchEntitiesFunction,
    getRelationType,
    setAcceptedTypes,
    setEntityUuid,
    setParentEntityType,
    setRefetchEntitiesFunction,
    setRelationType,
    getCustomGetEntitiesQuery,
    getCustomGetEntitiesFiltersQuery,
    setCustomGetEntitiesQuery,
    setCustomGetEntitiesFiltersQuery,
    setEntityId,
    getIsCropModeEnabled,
    setCropMode,
    setCropCoordinatesKey,
    getCropCoordinatesKey,
    setActionsOnResult,
    getActionsOnResult,
  };
};

export default useEntityPickerModal;
