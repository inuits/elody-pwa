<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import {
  MutateEntityValuesDocument,
  type Entity,
  type IntialValues,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  type DeleteQueryOptions,
  type PanelMetaData,
  Collection,
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
import {
  getChildrenOfHomeRoutes,
  deepToRaw,
  normalizeEmptyInitialValuesByFieldType,
} from "@/helpers";
import { useErrorCodes } from "@/composables/useErrorCodes";
import { type GraphQLError } from "graphql/error";

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
const { confirm } = useConfirmModal();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const useEditHelper = useEditMode(props.id);
const { createForm, parseFormValuesToFormInput } = useFormHelper();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const { updateDeleteQueryOptions } = useBaseModal();
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
    relatedEntityData: { metadata: {}, relations: {} },
    uuid: props.uuid,
  }),
);
const mutatedEntity = ref<Entity | undefined>(undefined);
const formContainsErrors = computed((): boolean => !form?.value.meta.valid);

const { setValues } = form.value;
const submit = useSubmitForm<EntityValues>(async () => {
  const collection =
    childRoutes.find(
      (route: any) =>
        route.entityType?.toLowerCase() === props.type.toLowerCase(),
    )?.type || Collection.Entities;

  if (!collection) throw Error("Could not determine collection for submit");

  const result = await mutate(
    {
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
    },
    {
      context: {
        skipGlobalErrorHandling: true,
      },
      errorPolicy: "all",
    },
  );

  if (result?.errors) {
    const errorMessage = await useErrorCodes().handleGraphqlError(
      { response: result } as unknown as GraphQLError,
      true,
    );
    displayErrorNotification("Error", errorMessage);
    return;
  }

  await useEditHelper.performMutationCallbacks();
  await useEditHelper.performRefetchFunctions();
  mutatedEntity.value = result.data.mutateEntityValues as Entity;
  emit("mutatedEntityUpdated", mutatedEntity.value);
  setValues({
    intialValues: normalizeEmptyInitialValuesByFieldType(
      mutatedEntity.value.intialValues,
      Object.values(props.fields),
    ),
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

onBeforeRouteLeave(async () => {
  if (!useEditHelper.isEdit || !form.value.meta.dirty) return true;

  const choice = await confirm({
    title: t("confirm.discard-edit.title"),
    message: t("confirm.discard-edit.message"),
    confirmLabel: t("confirm.discard-edit.confirm"),
    cancelLabel: t("confirm.discard-edit.cancel"),
    secondaryLabel: t("confirm.discard-edit.secondary-confirm"),
    secondaryButtonStyle: "accentAccent",
  });

  if (choice === "secondary") {
    await useEditHelper.save();
    return true;
  }
  return choice === "confirm";
});
</script>
