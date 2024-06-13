import type { Entitytyping } from "@/generated-types/queries";
import { ref } from "vue";

const acceptedTypes = ref<Entitytyping[]>([]);
const entityUuid = ref<string>("");
const relationType = ref<String | "no-type-set">("no-type-set");
const customGetEntitiesQuery = ref<string>("");
const customGetEntitiesFiltersQuery = ref<string>("");

const useEntityPickerModal = () => {
  const setAcceptedTypes = (types: Entitytyping[]) => {
    acceptedTypes.value = types;
  };

  const setEntityUuid = (id: string) => {
    entityUuid.value = id;
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

  const getAcceptedTypes = () => acceptedTypes.value;
  const getEntityUuid = () => entityUuid.value;
  const getRelationType = () => relationType.value;
  const getCustomGetEntitiesQuery = () => customGetEntitiesQuery.value;
  const getCustomGetEntitiesFiltersQuery = () =>
    customGetEntitiesFiltersQuery.value;

  return {
    getAcceptedTypes,
    getEntityUuid,
    getRelationType,
    setAcceptedTypes,
    setEntityUuid,
    setRelationType,
    getCustomGetEntitiesQuery,
    getCustomGetEntitiesFiltersQuery,
    setCustomGetEntitiesQuery,
    setCustomGetEntitiesFiltersQuery,
  };
};

export default useEntityPickerModal;
