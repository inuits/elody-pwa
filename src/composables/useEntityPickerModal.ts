import {
  Collection,
  type Entity,
  type Entitytyping,
  type MutateEntityValuesMutation,
  TypeModals,
} from "@/generated-types/queries";
import { ref, unref, inject } from "vue";
import {
  type BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { type EntityValues, useFormHelper } from "@/composables/useFormHelper";
import { useSubmitForm } from "vee-validate";
import { getChildrenOfHomeRoutes } from "@/helpers";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { apolloClient } from "@/main";

const { dequeueAllItemsForBulkProcessing, getEnqueuedItems } =
  useBulkOperations();
const { parseFormValuesToFormInput } = useFormHelper();
const { addRelations, getForm } = useFormHelper();
const { closeModal } = useBaseModal();
const { createNotification } = useNotification();
const config: any = inject("config");

const acceptedTypes = ref<Entitytyping[]>([]);
const entityUuid = ref<string>("");
const entityId = ref<string>("");
const parentEntityType = ref<Entitytyping[]>([]);
const relationType = ref<String | "no-type-set">("no-type-set");
const customGetEntitiesQuery = ref<string>("");
const customGetEntitiesFiltersQuery = ref<string>("");

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

  const setRelationType = (type: string) => {
    relationType.value = type;
  };

  const setCustomGetEntitiesQuery = (query: string) => {
    customGetEntitiesQuery.value = query;
  };

  const setCustomGetEntitiesFiltersQuery = (query: string) => {
    customGetEntitiesFiltersQuery.value = query;
  };

  const submit = useSubmitForm<EntityValues>(async (entityUuid: string) => {
    console.log("here");
    const form = getForm(entityUuid);
    const childRoutes = getChildrenOfHomeRoutes(config).map(
      (route: any) => route.meta,
    );
    const { setValues } = form;
    const collection =
      childRoutes.find(
        (route: any) =>
          route.entityType?.toLowerCase() ===
          props.parentEntityType.toLowerCase(),
      )?.type || Collection.Entities;
    console.log(collection);
    if (!collection) throw Error("Could not determine collection for submit");
    const result = await apolloClient.mutate({
      mutation: MutateEntityValuesMutation,
      variables: {
        id: entityUuid,
        formInput: parseFormValuesToFormInput(
          entityUuid,
          unref(form.values),
          true,
        ),
        collection,
      },
    });

    if (!result?.data?.mutateEntityValues) return;
    const mutatedEntity: Entity = result.data.mutateEntityValues as Entity;
    setValues({
      intialValues: mutatedEntity.intialValues,
      relationValues: mutatedEntity.relationValues,
    });
    createNotification({
      displayTime: 10,
      type: NotificationType.default,
      title: t("notifications.success.entityUpdated.title"),
      description: t("notifications.success.entityUpdated.description"),
      shown: true,
    });
    form.resetForm({ values: form.values });
  });

  const confirmSelection = async (
    parentEntityId: string,
    relationType: string,
    context: BulkOperationsContextEnum,
    modalToClose: TypeModals,
  ) => {
    const selectedEntities = getEnqueuedItems(context);
    addRelations(selectedEntities, relationType, parentEntityId, true);
    dequeueAllItemsForBulkProcessing(context);
    await submit(parentEntityId);
    console.log("saved");
    closeModal(modalToClose);
  };

  const getAcceptedTypes = () => acceptedTypes.value;
  const getEntityUuid = () => entityUuid.value;
  const getEntityId = () => entityId.value;
  const getParentEntityType = () => parentEntityType.value;
  const getRelationType = () => relationType.value;
  const getCustomGetEntitiesQuery = () => customGetEntitiesQuery.value;
  const getCustomGetEntitiesFiltersQuery = () =>
    customGetEntitiesFiltersQuery.value;

  return {
    getAcceptedTypes,
    getEntityUuid,
    getEntityId,
    getParentEntityType,
    getRelationType,
    setAcceptedTypes,
    setEntityUuid,
    setParentEntityType,
    setRelationType,
    getCustomGetEntitiesQuery,
    getCustomGetEntitiesFiltersQuery,
    setCustomGetEntitiesQuery,
    setCustomGetEntitiesFiltersQuery,
    setEntityId,
    confirmSelection,
  };
};

export default useEntityPickerModal;
