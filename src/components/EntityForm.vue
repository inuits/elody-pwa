<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import {
  MutateEntityValuesDocument,
  TypeModals,
  type BaseRelationValuesInput,
  type Entity,
  type IntialValues,
  type MetadataValuesInput,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import {
  useNotification,
  NotificationType,
} from "@/components/base/BaseNotification.vue";
import {
  inject,
  onMounted,
  onUnmounted,
  unref,
  watch,
  computed,
  provide,
} from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper, type EntityValues } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useMutation } from "@vue/apollo-composable";
import { onBeforeRouteLeave } from "vue-router";
import { useSubmitForm } from "vee-validate";

const props = defineProps<{
  intialValues: IntialValues;
  relationValues: { [key: string]: any };
  uuid: string;
  type: string;
}>();

const config: any = inject("config");
const {
  initializeConfirmModal,
  performRoute,
  setPathToNavigate,
  deletePathToNavigate,
  pathToNavigate,
} = useConfirmModal();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const {
  isEdit,
  addSaveCallback,
  save,
  refetchFn,
  disableEditMode,
  setDisableState,
  clearSaveCallbacks,
} = useEditMode();
const {
  createForm,
  parseIntialValuesForFormSubmit,
  parseRelationValuesForFormSubmit,
  parseRelationMetadataForFormSubmit,
} = useFormHelper();
const { createNotification } = useNotification();
const { closeModal, openModal } = useBaseModal();
const { t } = useI18n();
const childRoutes = config.routerConfig[0].children.map(
  (route: any) => route.meta
);

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

let form = createForm(props.uuid, {
  intialValues: unref(props.intialValues),
  relationValues: unref(props.relationValues),
});
let mutatedEntity: Entity | undefined;
const formContainsErrors = computed((): boolean => !form?.meta.value.valid);

const { setValues } = form;

const parseFormValuesToFormInput = (values: EntityValues) => {
  let metadata: MetadataValuesInput[] = [];
  let relations: BaseRelationValuesInput[] = [];

  if (values.intialValues)
    metadata = parseIntialValuesForFormSubmit(values.intialValues, props.uuid);
  if (values.relationValues)
    relations = parseRelationValuesForFormSubmit(values.relationValues);
  if (values.relationMetadata && relations)
    relations = parseRelationMetadataForFormSubmit(
      values.relationMetadata,
      relations,
      props.uuid
    );

  return { metadata, relations };
};

const submit = useSubmitForm<EntityValues>(async () => {
  const collection = childRoutes.find(
    (route: any) => route.entityType?.toLowerCase() === props.type.toLowerCase()
  ).type;

  if (!collection) throw Error("Could not determine collection for submit");

  const result = await mutate({
    id: props.uuid,
    formInput: parseFormValuesToFormInput(unref(form.values)),
    collection,
  });

  if (!result?.data?.mutateEntityValues) return;
  mutatedEntity = result.data.mutateEntityValues as Entity;
  setValues({
    intialValues: mutatedEntity.intialValues,
    relationValues: mutatedEntity.relationValues,
  });
  createNotification({
    displayTime: 10,
    type: NotificationType.default,
    title: t("notifications.success.entityCreated.title"),
    description: t("notifications.success.entityCreated.description"),
    shown: true,
  });
  form.resetForm({ values: form.values });
  disableEditMode();
});

provide("submitForm", submit);

const callRefetchFn = () => {
  const refetch = refetchFn.value;
  if (refetch) refetch();
};

onMounted(async () =>
  document.addEventListener("discardEdit", () => callRefetchFn)
);
onUnmounted(() =>
  document.removeEventListener("discardEdit", () => callRefetchFn)
);

watch(isEdit, () => {
  if (isEdit.value) {
    clearSaveCallbacks();
    addSaveCallback(submit, "first");
  }
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementListEntityPickerModal
  );
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementMediaEntityPickerModal
  );
  mutatedEntity = undefined;
});

watch(
  () => props.intialValues,
  () => {
    setValues({
      intialValues: props.intialValues,
      relationValues: props.relationValues,
    });
  }
);

watch(
  () => form.values,
  async () => {
    await form.validate();
    setDisableState(formContainsErrors.value);
  },
  { deep: true }
);

onBeforeRouteLeave((to, from, next) => {
  if (!isEdit.value || !form.meta.value.dirty) return next();
  if (pathToNavigate.value != undefined) {
    deletePathToNavigate();
    return next();
  }
  openNavigationModal();
  setPathToNavigate(to.path);
  return false;
});

const openNavigationModal = () => {
  initializeConfirmModal(
    () => {
      performRoute();
      closeModal(TypeModals.Confirm);
    },
    async () => {
      await save();
      performRoute();
      deletePathToNavigate();
      closeModal(TypeModals.Confirm);
    },
    () => {
      deletePathToNavigate();
      closeModal(TypeModals.Confirm);
    },
    "discard-edit"
  );
  openModal(TypeModals.Confirm, undefined, "center");
};
</script>
