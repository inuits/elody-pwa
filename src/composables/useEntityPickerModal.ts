import type {
  ActionsOnResult,
  AdvancedFilterInput,
  Entitytyping,
} from "@/generated-types/queries";
import { ref } from "vue";

const acceptedTypes = ref<Entitytyping[]>([]);
const entityUuid = ref<string>("");
const entityId = ref<string>("");
const parentEntityType = ref<Entitytyping[]>([]);
type RefetchEntitiesFunction = () => Promise<void> | void;

const refetchEntitiesFunction = ref<RefetchEntitiesFunction | undefined>(
  undefined,
);
const relationType = ref<string | "no-type-set">("no-type-set");
const customGetEntitiesQuery = ref<string>("");
const customGetEntitiesFiltersQuery = ref<string>("");
const isCropModeEnabled = ref<boolean>(false);
const cropCoordinatesKey = ref<string>("");
const actionsOnResult = ref<ActionsOnResult | undefined>(undefined);
const replaceExistingRelations = ref<boolean>(false);
const selectionLimit = ref<number>(0);
// Whether an entity the parent is already related to can be picked again. Most
// relations want it off -- picking the same author twice is a slip. A pipeline
// step is a *use* of a component, so a component can legitimately appear twice.
const allowDuplicateRelations = ref<boolean>(false);
// Extra filters with concrete values, set by whoever opens the picker (e.g.
// the pipeline view scoping it to one output port's shape). Cleared on every
// normal initialization so a scope never leaks into the next picker.
const additionalFilters = ref<AdvancedFilterInput[]>([]);

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

  const setRefetchEntitiesFunction = (
    refetchEntities: RefetchEntitiesFunction,
  ) => {
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

  const setReplaceExistingRelations = (value: boolean) => {
    replaceExistingRelations.value = value;
  };

  const setSelectionLimit = (value: number) => {
    selectionLimit.value = value;
  };

  const setAllowDuplicateRelations = (value: boolean) => {
    allowDuplicateRelations.value = value;
  };

  const setAdditionalFilters = (filters: AdvancedFilterInput[]) => {
    additionalFilters.value = filters;
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
  const getReplaceExistingRelations = () => replaceExistingRelations.value;
  const getSelectionLimit = () => selectionLimit.value;
  const getAllowDuplicateRelations = () => allowDuplicateRelations.value;
  const getAdditionalFilters = () => additionalFilters.value;

  const resetState = () => {
    acceptedTypes.value = [];
    entityUuid.value = "";
    entityId.value = "";
    parentEntityType.value = [];
    refetchEntitiesFunction.value = undefined;
    relationType.value = "no-type-set";
    customGetEntitiesQuery.value = "";
    customGetEntitiesFiltersQuery.value = "";
    isCropModeEnabled.value = false;
    cropCoordinatesKey.value = "";
    actionsOnResult.value = undefined;
    replaceExistingRelations.value = false;
    selectionLimit.value = 0;
  };

  return {
    resetState,
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
    setReplaceExistingRelations,
    getReplaceExistingRelations,
    setSelectionLimit,
    getSelectionLimit,
    setAllowDuplicateRelations,
    getAllowDuplicateRelations,
    setAdditionalFilters,
    getAdditionalFilters,
  };
};

export default useEntityPickerModal;
