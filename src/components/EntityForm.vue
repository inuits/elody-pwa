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
  DeleteQueryOptions,
  Collection,
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
  deleteQueryOptions?: DeleteQueryOptions;
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
  resetButtonClicked,
  buttonClicked,
} = useEditMode();
const {
  createForm,
  parseIntialValuesForFormSubmit,
  parseRelationValuesForFormSubmit,
  parseRelationMetadataForFormSubmit,
} = useFormHelper();
const { createNotification } = useNotification();
const { closeModal, openModal, updateDeleteQueryOptions } = useBaseModal();
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
  relationMetadata: {},
  relatedEntityData: {},
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
  const collection =
    childRoutes.find(
      (route: any) =>
        route.entityType?.toLowerCase() === props.type.toLowerCase()
    )?.type || Collection.Entities;

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

onMounted(async () => {
  document.addEventListener("discardEdit", () => callRefetchFn);
  updateDeleteQueryOptions(props.deleteQueryOptions);
});
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
    await validateAndSetDisableState();
    if (!formContainsErrors.value && buttonClicked.value) resetButtonClicked();
  },
  { deep: true }
);
watch(
  () => buttonClicked.value,
  async () => {
    if (!buttonClicked.value) return;
    await validateAndSetDisableState();
  }
);

const validateAndSetDisableState = async () => {
  await form.validate();
  setDisableState(formContainsErrors.value);
};

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
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        performRoute();
        closeModal(TypeModals.Confirm);
      },
    },
    secondaryConfirmButton: {
      buttonCallback: async () => {
        await save();
        performRoute();
        deletePathToNavigate();
        closeModal(TypeModals.Confirm);
      },
      buttonStyle: "accentAccent",
    },
    declineButton: {
      buttonCallback: () => {
        deletePathToNavigate();
        closeModal(TypeModals.Confirm);
      },
    },
    translationKey: "discard-edit",
  });
  openModal(TypeModals.Confirm, undefined, "center");
};
</script>
