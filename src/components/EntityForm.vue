<template><slot></slot></template>

<script lang="ts" setup>
import type {
  EntityFormInput,
  IntialValues,
  KeyValue,
  MetadataValuesInput,
  RelationValuesInput,
  UpdateRelationsAndMetadataMutation,
  UpdateRelationsAndMetadataMutationVariables,
} from "@/generated-types/queries";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { asString } from "@/helpers";
import { computed, onMounted, onUnmounted, watch } from "vue";
import { UpdateRelationsAndMetadataDocument } from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { useForm, useSubmitForm } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useMutation } from "@vue/apollo-composable";
import { useRoute } from "vue-router";

const props = defineProps<{
  intialValues: Omit<IntialValues, "keyValue">;
}>();

const { addSaveCallback, isEdit } = useEditMode();
const { addForm } = useFormHelper();
const { refetchFn } = useEditMode();
const entityId = computed(() => asString(useRoute().params["id"]));
const { t } = useI18n();

const form = computed(() => {
  const values = props.intialValues;
  return useForm<Omit<IntialValues, "keyValue">>({
    initialValues: values,
  });
});

const { setValues } = form.value;

const { mutate } = useMutation<
  UpdateRelationsAndMetadataMutation,
  UpdateRelationsAndMetadataMutationVariables
>(UpdateRelationsAndMetadataDocument);

const parseIntialValues = (
  values: IntialValues | KeyValue
): EntityFormInput => {
  const relations: RelationValuesInput[] = [];
  const metadata: MetadataValuesInput[] = [];

  Object.values(values).forEach((value, index) => {
    if (Object.keys(values)[index] == "relatie" && Array.isArray(value)) {
      value.forEach((relationValue) => {
        // temporary fix for digipolis mediafiles (sorry, i know it's ugly)
        if (typeof relationValue === "string") {
          relations.push({
            label: "hasMediafile",
            id: relationValue,
            relationType: "hasMediafile",
            metaData: [],
            toBeDeleted: false,
          });
        } else {
          relationValue &&
            relations.push({
              label: Object.keys(values)[index],
              id: relationValue.id,
              relationType: relationValue.relationType,
              metaData: relationValue.metaData
                ? parseIntialValues(relationValue.metaData).metadata
                : [],
              toBeDeleted: relationValue.toBeDeleted,
            });
        }
      });
    } else if (typeof value === "string" || typeof value === "object") {
      metadata.push({
        key: Object.keys(values)[index],
        value,
      });
    }
  });

  return {
    relations,
    metadata,
  };
};

const submit = useSubmitForm<IntialValues>(async (values) => {
  const resultMutate = await mutate({
    id: entityId.value,
    data: parseIntialValues(values),
  });
  //Find better way to check if Intialvalues is present
  if (
    resultMutate?.data?.updateRelationsAndMetadata &&
    resultMutate?.data?.updateRelationsAndMetadata.__typename === "Asset"
  ) {
    useNotification().createNotificationOverwrite(
      NotificationType.default,
      t("notifications.success.entityCreated.title"),
      t("notifications.success.entityCreated.description")
    );
    setValues(resultMutate?.data?.updateRelationsAndMetadata.intialValues);
  }
});

const callRefetchFn = () => {
  const refetch = refetchFn.value;
  if (refetch) refetch();
};

onMounted(() => document.addEventListener("discardEdit", () => callRefetchFn));
onUnmounted(() => document.removeEventListener("discardEdit", () => callRefetchFn));

watch(
  () => form.value,
  () => {
    addForm(entityId.value, form.value);
  },
  { immediate: true }
);

watch(isEdit, (value) => {
  if (value) {
    addSaveCallback(submit, "first");
  }
});
</script>
