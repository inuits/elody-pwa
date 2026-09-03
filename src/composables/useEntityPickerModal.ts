import type {
  ActionsOnResult,
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
// Extra filter variables, set by whoever opens the picker (e.g. the pipeline
// view handing the clicked output port's shape IRIs to a declared
// "$portShapeIris" filter). The picker's own query declares the filter; only
// the values travel here. Cleared on every normal initialization so a scope
// never leaks into the next picker.
const additionalFilterVariables = ref<Record<string, unknown>>({});

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

  const setAdditionalFilterVariables = (variables: Record<string, unknown>) => {
    additionalFilterVariables.value = variables;
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
  const getAdditionalFilterVariables = () => additionalFilterVariables.value;

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
    additionalFilterVariables.value = {};
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
    setAdditionalFilterVariables,
    getAdditionalFilterVariables,
  };
};

export default useEntityPickerModal;
