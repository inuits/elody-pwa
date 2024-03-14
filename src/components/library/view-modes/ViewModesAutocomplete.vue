<template>
  <base-input-autocomplete
    :autocomplete-style="editMode ? 'defaultWithBorder' : 'readOnly'"
    :options="editMode ? entityDropdownOptions : selectedDropdownOptions"
    :select-type="selectType"
    :model-value="selectedDropdownOptions"
    :disabled="!editMode"
    :loading="entitiesLoading || relatedEntitiesLoading"
    @search-change="
      (value) => {
        setSearchInput(value);
      }
    "
    @update:model-value="(value) => {
      replaceRelationsFromSameType(
        mapDropdownOptionsToBulkProcessableItem([...value]),
        relationType as string,
      );
      selectedDropdownOptions = [...value];
    }"
  />
</template>

<script lang="ts" setup>
import type { DropdownOption, Entitytyping } from "@/generated-types/queries";
import { onMounted, ref } from "vue";
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
    fromRelationType: string;
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
const { replaceRelationsFromSameType } = useFormHelper();
const entityId = getEntityIdFromRoute();
const { initialize, 
  entityDropdownOptions, 
  entitiesLoading, 
  setSearchInput 
} = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  "fetchAll"
);

const {
  initialize: relatedEntitiesInitialize,
  entityDropdownOptions: relatedEntitiesOptions,
  entitiesLoading: relatedEntitiesLoading,
} = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  entityId,
  props.fromRelationType
);

onMounted(async () => {
  await initAutocompleteOption();
});

const initAutocompleteOption = async () => {
  if (props.editMode) { 
    await initialize();
  }
  if (entityId && props.fromRelationType) {
    await relatedEntitiesInitialize();
  }
  populateSelectedOptions(relatedEntitiesOptions.value);
}

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

const populateSelectedOptions = (options: DropdownOption[]) => {
  if (options.length === 0) return;
  selectedDropdownOptions.value = options;
};
</script>
