<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import {
  EditStatus,
  MutateEntityValuesDocument,
  TypeModals,
  type BaseRelationValuesInput,
  type Entity,
  type IntialValues,
  type MetadataValuesInput,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  type RelationValues,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import {
  useNotification,
  NotificationType,
} from "@/components/base/BaseNotification.vue";
import { inject, onMounted, onUnmounted, unref, watch, computed } from "vue";
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
  relationValues: RelationValues;
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
const { isEdit, addSaveCallback, refetchFn, disableEditMode, setDisableState } =
  useEditMode();
const { createForm, editableFields } = useFormHelper();
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

const linkedEntityId = (key: string) => {
  return key.slice(key.indexOf("-") + 1, key.length);
};
const fieldKeyWithoutId = (key: string) => {
  return key.slice(0, key.indexOf("-"));
};

const parseFormValuesToFormInput = (values: EntityValues) => {
  const metadata: MetadataValuesInput[] = [];
  Object.keys(values.intialValues)
    .filter((key) => key !== "__typename")
    .forEach((key) => {
      if (!editableFields.value[props.uuid]?.includes(key)) return;
      metadata.push({ key, value: (values.intialValues as any)[key] });
    });

  const relations: BaseRelationValuesInput[] = [];
  Object.keys(values?.relationValues).forEach((relationType: string) => {
    const typedRelations: BaseRelationValuesInput[] =
      values.relationValues[relationType];
    if (!Array.isArray(typedRelations)) return;

    typedRelations.forEach((relation: BaseRelationValuesInput) => {
      // TODO: Find something better to unref this
      relation = JSON.parse(JSON.stringify(relation));

      if (!relation.editStatus) relation.editStatus = EditStatus.Unchanged;
      relations.push(relation);
    });
  });

  if (values.relationValues?.relationMetadata) {
    Object.entries(values.relationValues?.relationMetadata)
      .filter((entry) => !editableFields.value[props.uuid].includes(entry.key))
      .forEach((entry) => {
        const newRelationObject = {
          key: fieldKeyWithoutId(entry[0]),
          value: entry[1],
        };
        const id = linkedEntityId(entry[0]);
        for (let i = 0; i < relations.length; i++) {
          if (relations[i].key === id) {
            if (relations[i].metadata === undefined) relations[i].metadata = [];
            relations[i].metadata.push(newRelationObject);
            if (relations[i].editStatus !== EditStatus.Deleted)
              relations[i].editStatus = EditStatus.Changed;
          }
        }
      });
  }
  return { metadata, relations };
};

const submit = useSubmitForm<EntityValues>(async () => {
  const result = await mutate({
    id: props.uuid,
    formInput: parseFormValuesToFormInput(unref(form.values)),
    collection: childRoutes.find(
      (route: any) => route.entityType === props.type
    ).type,
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
  if (isEdit.value) addSaveCallback(submit, "first");
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementListEntityPickerModal
  );
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementMediaEntityPickerModal
  );
  mutatedEntity = undefined;
  // if (isEdit && !getForm(entityId.value))
  //   createForm(entityId.value, {
  //     intialValues: props.intialValues,
  //     relationValues: props.relationValues,
  //   });
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
    undefined,
    () => {
      deletePathToNavigate();
      closeModal(TypeModals.Confirm);
    },
    "discard-edit"
  );
  openModal(TypeModals.Confirm, undefined, "center");
};
</script>
