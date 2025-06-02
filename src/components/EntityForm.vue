<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import {
  MutateEntityValuesDocument,
  TypeModals,
  type Entity,
  type IntialValues,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  type DeleteQueryOptions,
  Collection,
  ModalStyle,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useBaseNotification } from "@/composables/useBaseNotification";
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
import { getChildrenOfHomeRoutes, deepToRaw } from "@/helpers";

const props = defineProps<{
  intialValues: IntialValues;
  relationValues: { [key: string]: any };
  uuid: string;
  id: string;
  type: string;
  deleteQueryOptions?: DeleteQueryOptions;
  locale: string;
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
const useEditHelper = useEditMode(props.id);
const { createForm, parseFormValuesToFormInput } = useFormHelper();
const { displaySuccessNotification } = useBaseNotification();
const { closeModal, openModal, updateDeleteQueryOptions } = useBaseModal();
const { t } = useI18n();
const childRoutes = getChildrenOfHomeRoutes(config).map(
  (route: any) => route.meta,
);

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

let form = createForm(props.id, {
  intialValues: structuredClone(deepToRaw(props.intialValues)),
  relationValues: structuredClone(deepToRaw(props.relationValues)),
  relationMetadata: {},
  relatedEntityData: {},
  uuid: props.uuid,
});
let mutatedEntity: Entity | undefined;
const formContainsErrors = computed((): boolean => !form?.meta.value.valid);

const { setValues } = form;

const submit = useSubmitForm<EntityValues>(async () => {
  const collection =
    childRoutes.find(
      (route: any) =>
        route.entityType?.toLowerCase() === props.type.toLowerCase(),
    )?.type || Collection.Entities;

  if (!collection) throw Error("Could not determine collection for submit");

  const result = await mutate({
    id: props.id,
    formInput: parseFormValuesToFormInput(
      props.id,
      unref(form.values),
      false,
      props.locale,
    ),
    collection,
    preferredLanguage: config.features.multilanguage
      ?.supportsMultilingualMetadataEditing
      ? props.locale
      : undefined,
  });

  if (!result?.data?.mutateEntityValues) return;
  mutatedEntity = result.data.mutateEntityValues as Entity;
  setValues({
    intialValues: mutatedEntity.intialValues,
    relationValues: mutatedEntity.relationValues,
  });
  displaySuccessNotification(
    t("notifications.success.entityUpdated.title"),
    t("notifications.success.entityUpdated.description"),
  );

  form.resetForm({ values: form.values });
  useEditHelper.disableEditMode();
});

provide("entityFormData", {
  id: props.id,
  type: props.type,
  collection:
    childRoutes.find(
      (route: any) =>
        route.entityType?.toLowerCase() === props.type.toLowerCase(),
    )?.type || Collection.Entities,
});

const callRefetchFn = () => {
  const refetch = useEditHelper.refetchFn;
  if (refetch) refetch();
};

onMounted(async () => {
  document.addEventListener("discardEdit", () => callRefetchFn);
  updateDeleteQueryOptions(props.deleteQueryOptions);
});
onUnmounted(() => {
  document.removeEventListener("discardEdit", () => callRefetchFn);
});

watch(useEditHelper, () => {
  if (useEditHelper.isEdit) {
    useEditHelper.setSubmitFunction(submit);
  }

  const contextsToReset: BulkOperationsContextEnum[] = [
    BulkOperationsContextEnum.EntityElementListEntityPickerModal,
    BulkOperationsContextEnum.EntityElementMediaEntityPickerModal,
  ];
  contextsToReset.forEach((context: BulkOperationsContextEnum) =>
    dequeueAllItemsForBulkProcessing(context),
  );

  mutatedEntity = undefined;
});

watch(
  () => props.intialValues,
  () => {
    setValues({
      intialValues: structuredClone(deepToRaw(props.intialValues)),
      relationValues: structuredClone(deepToRaw(props.relationValues)),
    });
  },
);

watch(
  () => form.values,
  async () => {
    await validateAndSetDisableState();
    if (!formContainsErrors.value && useEditHelper.buttonClicked)
      useEditHelper.resetButtonClicked();
  },
  { deep: true },
);
watch(
  () => useEditHelper.buttonClicked,
  async (buttonClicked: boolean) => {
    if (!buttonClicked) return;
    await validateAndSetDisableState();
  },
);

const validateAndSetDisableState = async () => {
  await form.validate();
  useEditHelper.setDisableState(formContainsErrors.value);
};

onBeforeRouteLeave((to, from, next) => {
  if (!useEditHelper.isEdit || !form.meta.value.dirty) return next();
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
        await useEditHelper.save();
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
  openModal(TypeModals.Confirm, ModalStyle.Center);
};
</script>
