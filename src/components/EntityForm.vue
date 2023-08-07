<template><slot></slot></template>

<script lang="ts" setup>
import {
  EditStatus,
  MutateEntityValuesDocument,
  type BaseRelationValuesInput,
  type IntialValues,
  type MetadataValuesInput,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  type RelationValues,
} from "@/generated-types/queries";
import { asString } from "@/helpers";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useEditMode } from "@/composables/useEdit";
import { useForm, useSubmitForm } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import { useMutation } from "@vue/apollo-composable";
import { useRoute } from "vue-router";

const props = defineProps<{
  intialValues: IntialValues;
  relationValues: RelationValues;
}>();

const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { isEdit, addSaveCallback, refetchFn } = useEditMode();
const { addForm } = useFormHelper();
const entityId = computed(() => asString(useRoute().params["id"]));

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

type EntityValues = {
  intialValues: IntialValues;
  relationValues: RelationValues;
};
const form = computed(() => {
  return useForm<EntityValues>({
    initialValues: {
      intialValues: props.intialValues,
      relationValues: props.relationValues,
    },
  });
});
const { setValues } = form.value;

const parseFormValuesToFormInput = (values: EntityValues) => {
  const metadata: MetadataValuesInput[] = [];
  Object.keys(values.intialValues)
    .filter((key) => key !== "__typename")
    .forEach((key) => {
      metadata.push({ key, value: (values.intialValues as any)[key] });
    });

  const relations: BaseRelationValuesInput[] = [];
  values.relationValues.relations.forEach((relation) => {
    const relationInput: any = {};
    Object.keys(relation)
      .filter((key) => key !== "__typename")
      .forEach((key) => {
        relationInput[key] = (relation as any)[key];
      });

    if (!(relationInput as BaseRelationValuesInput).editStatus)
      (relationInput as BaseRelationValuesInput).editStatus =
        EditStatus.Unchanged;
    relations.push(relationInput);
  });

  return { metadata, relations };
};

const submit = useSubmitForm<EntityValues>(async () => {
  const result = await mutate({
    id: entityId.value,
    formInput: parseFormValuesToFormInput(form.value.values),
  });

  if (!result?.data?.mutateEntityValues) return;
  const entity = result.data.mutateEntityValues;
  setValues({
    intialValues: entity.intialValues,
    relationValues: entity.relationValues,
  });
});

const callRefetchFn = () => {
  const refetch = refetchFn.value;
  if (refetch) refetch();
};

onMounted(() => document.addEventListener("discardEdit", () => callRefetchFn));
onUnmounted(() =>
  document.removeEventListener("discardEdit", () => callRefetchFn)
);

watch(
  () => form.value,
  () => {
    addForm(entityId.value, form.value);
  },
  { immediate: true }
);
watch(isEdit, () => {
  if (isEdit.value) addSaveCallback(submit, "first");
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementListEntityPickerModal
  );
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementMediaEntityPickerModal
  );
});
</script>
