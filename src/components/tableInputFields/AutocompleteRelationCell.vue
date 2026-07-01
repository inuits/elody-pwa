<template>
  <BaseInputAutocomplete
    autocomplete-style="defaultWithBorder"
    :options="allEntitiesHelper?.entityDropdownOptions ?? []"
    select-type="single"
    :model-value="selectedOptions"
    :disabled="disabled"
    :loading="isLoading"
    :create-option-config="{ canCreateOption: inputField.canCreateEntityFromOption ?? false }"
    :disable-virtual-keyboard-context="true"
    @search-change="debouncedSearch"
    @update:model-value="handleSelect"
    @add-option="handleCreateFromTag"
  />
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, toRef, watch } from "vue";
import debounce from "lodash.debounce";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import {
  type DropdownOption,
  type Entitytyping,
  type InputField,
  GetEntityByIdDocument,
} from "@/generated-types/queries";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import { useManageEntities } from "@/composables/useManageEntities";
import { apolloClient } from "@/main";
import { getEntityTitle, looksLikeEntityId } from "@/helpers";

const props = defineProps<{
  modelValue: string | undefined;
  inputField: InputField;
  formId: string;
  cellKey?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
}>();

const allEntitiesHelper = ref<ReturnType<typeof useGetDropdownOptions>>();
const selectedOptions = ref<DropdownOption[]>([]);
const isCreatingEntity = ref(false);
const { createEntity } = useManageEntities();

const isLoading = computed(
  () => allEntitiesHelper.value?.entitiesLoading.value || isCreatingEntity.value,
);

const stateKey = computed(
  () =>
    `${props.formId}-${props.inputField.relationType}-${props.cellKey ?? ""}-fetchAll`,
);

const handleSelect = (options: DropdownOption[] | DropdownOption | undefined) => {
  if (!options) {
    selectedOptions.value = [];
    emit("update:modelValue", undefined);
    return;
  }
  const arr = Array.isArray(options) ? options : [options];
  selectedOptions.value = arr;
  emit("update:modelValue", arr[0]?.value as string | undefined);
};

const syncSelectedFromModelValue = async () => {
  const key = Array.isArray(props.modelValue)
    ? props.modelValue[0]
    : props.modelValue;
  if (!key) {
    selectedOptions.value = [];
    return;
  }
  if (
    selectedOptions.value[0]?.value === key &&
    selectedOptions.value[0]?.label &&
    selectedOptions.value[0]?.label !== key
  )
    return;

  const label = await resolveEntityLabel(key);
  selectedOptions.value = [{ label, value: key }];
};

const resolveEntityLabel = async (key: string): Promise<string> => {
  const entityType = props.inputField.entityType as Entitytyping | undefined;
  if (!entityType) return key;
  if (!looksLikeEntityId(key)) return key;
  try {
    const result = await apolloClient.query({
      query: GetEntityByIdDocument,
      variables: { id: key, type: entityType },
      fetchPolicy: "no-cache",
    });
    const entity = result.data?.Entity;
    return entity ? getEntityTitle(entity) : key;
  } catch {
    return key;
  }
};

const debouncedSearch = debounce((query: string) => {
  allEntitiesHelper.value?.getAutocompleteOptions(query);
}, 250);

const handleCreateFromTag = async (option: DropdownOption) => {
  if (!props.inputField.canCreateEntityFromOption) return;
  isCreatingEntity.value = true;
  try {
    const newEntity = await createEntity({
      entityType: props.inputField.entityType as any,
      metadata: props.inputField.metadataKeyToCreateEntityFromOption
        ? [{ key: props.inputField.metadataKeyToCreateEntityFromOption, value: option.label }]
        : [],
    });
    const newOption: DropdownOption = { value: newEntity.uuid, label: option.label, icon: undefined };
    selectedOptions.value = [newOption];
    emit("update:modelValue", newEntity.uuid);
  } finally {
    isCreatingEntity.value = false;
  }
};


onBeforeMount(() => {
  allEntitiesHelper.value = useGetDropdownOptions(
    stateKey.value,
    "get",
    props.inputField.entityType as any,
    toRef("fetchAll"),
    props.inputField.relationType ?? "",
    "",
    props.inputField.advancedFilterInputForSearchingOptions ?? undefined,
    props.inputField.advancedFilterInputForRetrievingAllOptions?.length
      ? (props.inputField.advancedFilterInputForRetrievingAllOptions as any)
      : (props.inputField.advancedFilterInputForRetrievingOptions as any),
    props.formId,
  );
});

onMounted(async () => {
  if (!props.disabled) await allEntitiesHelper.value?.initialize();
  syncSelectedFromModelValue();
});

onBeforeUnmount(() => {
  debouncedSearch.cancel();
});

watch(() => props.modelValue, syncSelectedFromModelValue);
</script>
