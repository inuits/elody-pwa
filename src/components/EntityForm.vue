<template><slot></slot></template>

<script lang="ts" setup>
import {
  EditStatus,
  MutateEntityValuesDocument,
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
import { asString } from "@/helpers";
import { computed, inject, onMounted, onUnmounted, watch } from "vue";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper, type EntityValues } from "@/composables/useFormHelper";
import { useMutation } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import { useSubmitForm } from "vee-validate";

const props = defineProps<{
  intialValues: IntialValues;
  relationValues: RelationValues;
}>();

const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { isEdit, addSaveCallback, refetchFn } = useEditMode();
const { createForm, editableFields } = useFormHelper();
const entityId = computed(() => asString(useRoute().params["id"]));
const validationSchema = inject("validationSchema") as Object;

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

let form = createForm(
  entityId.value,
  {
    intialValues: props.intialValues,
    relationValues: props.relationValues,
  },
  //validationSchema
);
let mutatedEntity: Entity | undefined;

const { setValues } = form;

const parseFormValuesToFormInput = (values: EntityValues) => {
  const metadata: MetadataValuesInput[] = [];
  Object.keys(values.intialValues)
    .filter((key) => key !== "__typename")
    .forEach((key) => {
      if (!editableFields.value[entityId.value].includes(key)) return;
      metadata.push({ key, value: (values.intialValues as any)[key] });
    });

  const relations: BaseRelationValuesInput[] = [];
  values?.relationValues?.relations.forEach((relation) => {
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
    formInput: parseFormValuesToFormInput(form.values),
  });

  if (!result?.data?.mutateEntityValues) return;
  mutatedEntity = result.data.mutateEntityValues as Entity;
  setValues({
    intialValues: mutatedEntity.intialValues,
    relationValues: mutatedEntity.relationValues,
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

watch(isEdit, () => {
  if (isEdit.value) addSaveCallback(submit, "first");
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementListEntityPickerModal
  );
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.EntityElementMediaEntityPickerModal
  );
  form = createForm(
    entityId.value,
    {
      intialValues: mutatedEntity?.intialValues || props.intialValues,
      relationValues: mutatedEntity?.relationValues || props.relationValues,
    },
    //validationSchema
  );
  mutatedEntity = undefined;
});
</script>
