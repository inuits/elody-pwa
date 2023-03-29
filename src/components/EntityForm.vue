<template><slot></slot></template>

<script lang="ts" setup>
import { useEditMode } from "../composables/useEdit";
import { useMutation } from "@vue/apollo-composable";
import { useForm, useSubmitForm } from "vee-validate";
import type {
  EntityFormInput,
  IntialValues,
  KeyValue,
  MetadataValuesInput,
  RelationValuesInput,
  UpdateRelationsAndMetadataMutation,
  UpdateRelationsAndMetadataMutationVariables,
} from "@/generated-types/queries";
import { UpdateRelationsAndMetadataDocument } from "@/generated-types/queries";
import { watch } from "vue";

const props = defineProps<{
  intialValues: Omit<IntialValues, "keyValue">;
  entityId: string;
}>();
const { addSaveCallback, isEdit } = useEditMode();

const { setValues } = useForm<Omit<IntialValues, "keyValue">>({
  initialValues: props.intialValues,
});

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
    if (Array.isArray(value)) {
      value.forEach((relationValue) => {
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
      });
    }

    if (typeof value === "string") {
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
    id: props.entityId,
    data: parseIntialValues(values),
  });
  //Find better way to check if Intialvalues is present
  if (
    resultMutate?.data?.updateRelationsAndMetadata &&
    resultMutate?.data?.updateRelationsAndMetadata.__typename === "Asset"
  ) {
    setValues(resultMutate?.data?.updateRelationsAndMetadata.intialValues);
  }
});

watch(isEdit, (value) => {
  if (value) {
    addSaveCallback(submit, "first");
  }
});
</script>
