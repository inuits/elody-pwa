import { ref } from "vue";

const entityUuid = ref<string>();
const entityType = ref<string>();

const useEntitySingle = () => {
  const setEntityUuid = (id: string) => {
    entityUuid.value = id;
  };

  const setEntityType = (type: string) => {
    entityType.value = type;
  };

  const getEntityUuid = () => entityUuid.value;
  const getEntityType = () => entityType.value;

  return { setEntityUuid, getEntityUuid, setEntityType, getEntityType };
};

export default useEntitySingle;
