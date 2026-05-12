import { ref } from "vue";

const entityUuid = ref<string>();
const entityType = ref<string>();
let refetchFn: (() => void) | undefined;

const useEntitySingle = () => {
  const setEntityUuid = (id: string) => {
    entityUuid.value = id;
  };

  const setEntityType = (type: string) => {
    entityType.value = type;
  };

  const setRefetch = (fn: () => void) => {
    refetchFn = fn;
  };

  const getEntityUuid = () => entityUuid.value;
  const getEntityType = () => entityType.value;
  const getRefetch = () => refetchFn;

  return { setEntityUuid, getEntityUuid, setEntityType, getEntityType, setRefetch, getRefetch };
};

export default useEntitySingle;
