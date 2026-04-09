<template>
  <BaseInputAutocomplete
    autocomplete-style="defaultWithBorder"
    :options="allEntitiesHelper?.entityDropdownOptions ?? []"
    select-type="single"
    :model-value="selectedOptions"
    :disabled="disabled"
    :loading="isLoading"
    :create-option-config="{ canCreateOption: inputField.canCreateEntityFromOption ?? false }"
    @search-change="debouncedSearch"
    @update:model-value="handleSelect"
    @add-option="handleCreateFromTag"
  />
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, toRef, watch } from "vue";
import debounce from "lodash.debounce";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import type { DropdownOption, InputField } from "@/generated-types/queries";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import { useManageEntities } from "@/composables/useManageEntities";

const props = defineProps<{
  modelValue: string | undefined;
  inputField: InputField;
  formId: string;
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
  () => `${props.formId}-${props.inputField.relationType}-fetchAll`,
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
  const selection: DropdownOption[] = [];

  if (Array.isArray(props.modelValue)) {
    for (const value of props.modelValue) {
      const found = await findAutocompleteOption(value);
      if (found) selection.push(found);
      else selection.push({ label: props.modelValue, value: props.modelValue })
    }
  } else if (props.modelValue) {
    const found = await findAutocompleteOption(props.modelValue);
    if (found) selection.push(found);
    else selection.push({ label: props.modelValue, value: props.modelValue })
  }

  allEntitiesHelper.value.getAutocompleteOptions();
  handleSelect(selection);
};

const findAutocompleteOption = async (value: string): Promise<DropdownOption | undefined> => {
  await allEntitiesHelper.value.getAutocompleteOptions(value);
  return allEntitiesHelper.value.entityDropdownOptions[0]
}

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
  await allEntitiesHelper.value?.initialize();
  syncSelectedFromModelValue();
});

onBeforeUnmount(() => {
  debouncedSearch.cancel();
});

watch(() => props.modelValue, syncSelectedFromModelValue);
watch(
  () => allEntitiesHelper.value?.entityDropdownOptions.value,
  () => syncSelectedFromModelValue(),
);
</script>
