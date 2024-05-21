<template>
  <base-input-autocomplete
    :autocomplete-style="!disabled ? 'defaultWithBorder' : 'readOnly'"
    :options="!disabled ? entityDropdownOptions : selectedDropdownOptions"
    :select-type="selectType"
    :model-value="selectedDropdownOptions"
    :disabled="disabled"
    :loading="entitiesLoading || relatedEntitiesLoading || isCreatingEntity"
    @search-change="
      (value: string) => {
        getAutocompleteOptions(value);
      }
    "
    @update:model-value="
      (value: DropdownOption[] | undefined) => {
        handleSelect(value);
      }
    "
    :can-create-option="canCreateOption"
    @add-option="handleCreatingFromTag"
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
    relationType: string;
    fromRelationType: string;
    mode: "edit" | "create";
    formId: string | undefined;
    autoSelectable: boolean;
    disabled: boolean;
    canCreateOption: boolean;
    metadataKeyToCreateEntityFromOption?: string;
  }>(),
  {
    selectType: "multi",
    label: "",
    metadataKeyToGetOptionsFor: "no-key",
    mode: "edit",
    formId: undefined,
    autoSelectable: false,
    disabled: false,
    canCreateOption: false,
  }
);

const isCreatingEntity = ref<boolean>(false);
const selectedDropdownOptions = ref<DropdownOption[]>([]);
const { replaceRelationsFromSameType, addRelations } = useFormHelper();
const entityId = getEntityIdFromRoute();
const {
  initialize,
  entityDropdownOptions,
  entitiesLoading,
  getAutocompleteOptions,
  createEntity,
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
  await initialize();
  if (entityId && props.fromRelationType && props.mode !== "create") {
    await relatedEntitiesInitialize();
  }

  if (
    props.autoSelectable &&
    entityDropdownOptions.value.length === 1 &&
    relatedEntitiesOptions.value.length === 0
  ) {
    populateSelectedOptions(entityDropdownOptions.value);
    handleSelect(entityDropdownOptions.value);
  } else {
    populateSelectedOptions(relatedEntitiesOptions.value);
  }
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

// what possibly we need to create an entity from tag
const handleCreatingFromTag = async (option: any) => {
  if (!props.metadataKeyToCreateEntityFromOption || !props.canCreateOption)
    return;
  isCreatingEntity.value = true;

  // call to create new entity & normalize response to the dropdown option
  const newEntity = await createEntity({
    key: props.metadataKeyToCreateEntityFromOption,
    value: option.label,
  });
  const normalizedOption = {
    value: newEntity.uuid,
    label: option.label,
  };

  // handle selected option
  handleSelect([...selectedDropdownOptions.value, normalizedOption]);
  isCreatingEntity.value = false;
};
</script>
