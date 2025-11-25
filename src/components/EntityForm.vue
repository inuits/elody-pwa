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
  type PanelMetaData,
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
  ref,
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
  fields: Record<string, PanelMetaData>;
}>();

const emit = defineEmits<{
  (event: "mutatedEntityUpdated", mutatedEntity: Entity): void;
}>();

const config: any = inject("config");
const isPreviewElement: any = inject("IsPreviewElement", false);
const {
  initializeConfirmModal,
  performRoute,
  setPathToNavigate,
  deletePathToNavigate,
  pathToNavigate,
} = useConfirmModal();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const useEditHelper = useEditMode(props.id);
const { createForm, getForm, parseFormValuesToFormInput } = useFormHelper();
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

const form = ref(
  createForm(props.id, {
    intialValues: structuredClone(deepToRaw(props.intialValues)),
    relationValues: structuredClone(deepToRaw(props.relationValues)),
    relationMetadata: {},
    relatedEntityData: {},
    uuid: props.uuid,
  }),
);
let mutatedEntity = ref<Entity | undefined>(undefined);
const formContainsErrors = computed((): boolean => !form?.value.meta.valid);

const { setValues } = form.value;
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
      unref(form.value).values,
      false,
      props.locale,
      props.fields,
    ),
    collection,
    preferredLanguage: config.features.supportsMultilingualMetadataEditing
      ? props.locale
      : undefined,
  });

  if (!result?.data?.mutateEntityValues) return;
  await useEditHelper.performRefetchFunctions();
  mutatedEntity.value = result.data.mutateEntityValues as Entity;
  emit("mutatedEntityUpdated", mutatedEntity.value);
  setValues({
    intialValues: mutatedEntity.value.intialValues,
    relationValues: mutatedEntity.value.relationValues,
  });
  displaySuccessNotification(
    t("notifications.success.entityUpdated.title"),
    t("notifications.success.entityUpdated.description"),
  );

  form.value.resetForm({ values: form.value.values });
  useEditHelper.disableEdit();
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

onMounted(async () => {
  document.addEventListener("discardEdit", () =>
    useEditHelper.performRefetchFunctions(),
  );
  if (!isPreviewElement) updateDeleteQueryOptions(props.deleteQueryOptions);
});
onUnmounted(() => {
  document.removeEventListener("discardEdit", () =>
    useEditHelper.performRefetchFunctions(),
  );
});

watch(useEditHelper, () => {
  if (useEditHelper.isEdit) {
    useEditHelper.setSubmitFunction(submit);
    mutatedEntity.value = undefined;
  }

  const contextsToReset: BulkOperationsContextEnum[] = [
    BulkOperationsContextEnum.EntityElementListEntityPickerModal,
    BulkOperationsContextEnum.EntityElementMediaEntityPickerModal,
  ];
  contextsToReset.forEach((context: BulkOperationsContextEnum) =>
    dequeueAllItemsForBulkProcessing(context),
  );

  if (!useEditHelper.isEdit) {
    const newForm = getForm(props.id);
    if (newForm) form.value = newForm;
    console.log({
      intialValues: structuredClone(deepToRaw(props.intialValues)),
      relationValues: structuredClone(deepToRaw(props.relationValues)),
    })
    form.value.setValues({
      intialValues: structuredClone(deepToRaw(props.intialValues)),
      relationValues: structuredClone(deepToRaw(props.relationValues)),
    });
  };
});

watch(
  () => [props.intialValues, props.relationValues],
  () => {
    setValues({
      intialValues: structuredClone(deepToRaw(props.intialValues)),
      relationValues: structuredClone(deepToRaw(props.relationValues)),
    });
  },
);

watch(
  () => form.value.values,
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
  await form.value.validate();
  useEditHelper.setDisableState(formContainsErrors.value);
};

onBeforeRouteLeave((to, from, next) => {
  if (!useEditHelper.isEdit || !form.value.meta.dirty) return next();
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
