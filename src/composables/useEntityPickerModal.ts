import type { Entitytyping } from "@/generated-types/queries";
import { ref } from "vue";

const acceptedTypes = ref<Entitytyping[]>([]);

const useEntityPickerModal = () => {
  const setAcceptedTypes = (types: Entitytyping[]) => {
    acceptedTypes.value = types;
  };

  const getAcceptedTypes = () => acceptedTypes.value;

  return { setAcceptedTypes, getAcceptedTypes };
};

export default useEntityPickerModal;
