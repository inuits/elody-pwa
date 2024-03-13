<template>
  <base-input-autocomplete
    :autocomplete-style="editMode ? 'defaultWithBorder' : 'readOnly'"
    :options="entityDropdownOptions"
    :select-type="selectType"
    :model-value="selectedDropdownOptions"
    :disabled="!editMode"
    :loading="entitiesLoading"
    @search-change="
      (value) => {
        setSearchInput(value);
      }
    "
    @update:model-value="(value) => {
      addRelations(
        mapDropdownOptionsToBulkProcessableItem([...value]),
        relationType as string,
      );
      selectedDropdownOptions = [...value];
    }"
  />
</template>

<script lang="ts" setup>
import type { DropdownOption, Entitytyping } from "@/generated-types/queries";
import { computed, onMounted, ref, watch } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { getEntityIdFromRoute } from "@/helpers";

const props = withDefaults(
  defineProps<{
    modelValue: string[] | string | undefined;
    metadataKeyToGetOptionsFor?: string | "no-key";
    selectType?: "multi" | "single";
    options: DropdownOption[];
    relationType: string;
    editMode: boolean;
  }>(),
  {
    selectType: "multi",
    label: "",
    metadataKeyToGetOptionsFor: "no-key",
    editMode: true,
  }
);

const selectedDropdownOptions = ref<DropdownOption[]>([]);
const { replaceRelationsFromSameType, addRelations } = useFormHelper();
const entityId = getEntityIdFromRoute();
const { initialize, entityDropdownOptions, entitiesLoading, setSearchInput } =
  useGetDropdownOptions(
    props.metadataKeyToGetOptionsFor as Entitytyping,
    "fetchAll"
  );
const entityDropdownOption = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  entityId,
  props.relationType
);

onMounted(async () => {
  await initialize();
  await entityDropdownOption.initialize();
  getSelectedOptions(entityDropdownOptions.value);
});

const mapDropdownOptionsToBulkProcessableItem = (
  dropdownOptions: DropdownOption[]
): InBulkProcessableItem[] => {
  const inBulkProcessableItems: InBulkProcessableItem[] = [];
  dropdownOptions.forEach((dropdownOption: DropdownOption) => {
    inBulkProcessableItems.push({
      id: dropdownOption.value,
      value: dropdownOption.label,
    });
  });
  return inBulkProcessableItems;
};

const getSelectedOptions = (options: DropdownOption[]) => {
  if (typeof props.modelValue !== "string") return;

  let selectedOptionIds: string[];
  let selectedOptions: DropdownOption[] = [];
  if (Array.isArray(props.modelValue)) {
    selectedOptionIds = props.modelValue;
  } else {
    selectedOptionIds = props.modelValue.split(",");
  }

  // fetch only selected options
  options.forEach((option: DropdownOption) => {
    if (selectedOptionIds.includes(option.value)) {
      selectedOptions.push(option);
    }
  });

  selectedDropdownOptions.value = selectedOptions;
};

watch(
  () => selectedDropdownOptions.value,
  () => {
    // const dropdownValues = selectedDropdownOptions.value.map((dropdownItem: DropdownOption) => dropdownItem.value);
    // emit('update:modelValue', dropdownValues.length === 0 ? '' : dropdownValues.join(','));
  }
);
</script>
