import type { Entitytyping } from "@/generated-types/queries";
import { ref } from "vue";

const acceptedTypes = ref<Entitytyping[]>([]);
const entityUuid = ref<string>("");
const relationType = ref<String | "no-type-set">("no-type-set");

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

  const getAcceptedTypes = () => acceptedTypes.value;
  const getEntityUuid = () => entityUuid.value;
  const getRelationType = () => relationType.value;

  return {
    getAcceptedTypes,
    getEntityUuid,
    getRelationType,
    setAcceptedTypes,
    setEntityUuid,
    setRelationType,
  };
};

export default useEntityPickerModal;
