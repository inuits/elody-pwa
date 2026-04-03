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

const syncSelectedFromModelValue = () => {
  if (!props.modelValue) {
    selectedOptions.value = [];
    return;
  }
  const options = allEntitiesHelper.value?.entityDropdownOptions.value ?? [];
  const found = options.find((o) => o.value === props.modelValue);
  selectedOptions.value = found
    ? [found]
    : [{ value: props.modelValue, label: props.modelValue, icon: undefined }];
};

watch(() => props.modelValue, syncSelectedFromModelValue);
watch(
  () => allEntitiesHelper.value?.entityDropdownOptions.value,
  () => syncSelectedFromModelValue(),
);

const debouncedSearch = debounce((query: string) => {
  allEntitiesHelper.value?.getAutocompleteOptions(query);
}, 250);

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
</script>
