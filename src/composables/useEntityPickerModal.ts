import type { Entitytyping } from "@/generated-types/queries";
import { ref } from "vue";

const acceptedTypes = ref<Entitytyping[]>([]);
const relationType = ref<String | "no-type-set">("no-type-set");

const useEntityPickerModal = () => {
  const setAcceptedTypes = (types: Entitytyping[]) => {
    acceptedTypes.value = types;
  };

  const setRelationType = (type: string) => {
    relationType.value = type;
  };

  const getAcceptedTypes = () => acceptedTypes.value;
  const getRelationType = () => relationType.value;

  return {
    setAcceptedTypes,
    getAcceptedTypes,
    getRelationType,
    setRelationType,
  };
};

export default useEntityPickerModal;
