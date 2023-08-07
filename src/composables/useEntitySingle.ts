import { ref } from "vue";

const entityUuid = ref<string>();

const useEntitySingle = () => {
  const setEntityUuid = (id: string) => {
    entityUuid.value = id;
  };

  const getEntityUuid = () => entityUuid.value;

  return { setEntityUuid, getEntityUuid };
};

export default useEntitySingle;
