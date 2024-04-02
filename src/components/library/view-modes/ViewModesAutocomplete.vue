<template>
  <base-input-autocomplete
    :autocomplete-style="isEditMode ? 'defaultWithBorder' : 'readOnly'"
    :options="isEditMode ? entityDropdownOptions : selectedDropdownOptions"
    :select-type="selectType"
    :model-value="selectedDropdownOptions"
    :disabled="!isEditMode"
    :loading="entitiesLoading || relatedEntitiesLoading"
    @search-change="
      (value: string) => {
        getAutocompleteOptions(value);
      }
    "
    @update:model-value="
      (value: DropdownOption[]) => {
        handleSelect(value);
      }
    "
  />
</template>

<script lang="ts" setup>
import type {
  DropdownOption,
  Entitytyping,
  AdvancedFilterInput,
} from "@/generated-types/queries";
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
    advancedFilterInputForSearchingOptions: AdvancedFilterInput;
    options: DropdownOption[];
    relationType: string;
    fromRelationType: string;
    isEditMode: boolean;
    mode: "edit" | "create";
    formId: string | undefined;
  }>(),
  {
    selectType: "multi",
    label: "",
    metadataKeyToGetOptionsFor: "no-key",
    isEditMode: true,
    mode: "edit",
    formId: undefined,
  }
);

const selectedDropdownOptions = ref<DropdownOption[]>([]);
const { replaceRelationsFromSameType, addRelations } = useFormHelper();
const entityId = getEntityIdFromRoute();
const {
  initialize,
  entityDropdownOptions,
  entitiesLoading,
  getAutocompleteOptions,
} = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  "fetchAll",
  undefined,
  props.advancedFilterInputForSearchingOptions
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
  if (props.isEditMode) {
    await initialize();
  }
  if (entityId && props.fromRelationType && props.mode !== "create") {
    await relatedEntitiesInitialize();
  }
  populateSelectedOptions(relatedEntitiesOptions.value);
};

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

const handleSelect = (options: DropdownOption[] | undefined) => {
  if (options === undefined) return;
  const bulkProcessableItems: InBulkProcessableItem[] =
    mapDropdownOptionsToBulkProcessableItem([...options]);

  if (props.mode === "create") {
    addRelations(bulkProcessableItems, props.relationType, props.formId);
  }

  if (props.mode === "edit") {
    replaceRelationsFromSameType(
      bulkProcessableItems,
      props.relationType as string,
      props.formId
    );
  }

  selectedDropdownOptions.value = [...options];
};
</script>
