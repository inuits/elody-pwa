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
      (value: DropdownOption[] | DropdownOption | undefined) => {
        if (value && !Array.isArray(value)) value = [value];
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
import { computed, onMounted, ref, watch } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { getEntityIdFromRoute } from "@/helpers";
import { useManageEntities } from "@/composables/useManageEntities";
import isEqual from "lodash.isequal";

const props = withDefaults(
  defineProps<{
    modelValue: string[] | string | undefined;
    metadataKeyToGetOptionsFor?: string | "no-key";
    selectType?: "multi" | "single";
    advancedFilterInputForRetrievingOptions?: [AdvancedFilterInput];
    advancedFilterInputForSearchingOptions: AdvancedFilterInput;
    relationType: string;
    fromRelationType: string;
    dependsOn: string;
    mode: "edit" | "create";
    formId: string;
    autoSelectable: boolean;
    disabled: boolean;
    canCreateOption?: boolean;
    metadataKeyToCreateEntityFromOption?: string;
    isReadOnly?: boolean;
    isMetadataField?: boolean;
  }>(),
  {
    selectType: "multi",
    metadataKeyToGetOptionsFor: "no-key",
    mode: "edit",
    autoSelectable: false,
    disabled: false,
    canCreateOption: false,
    isMetadataField: false,
  }
);

const isCreatingEntity = ref<boolean>(false);
const selectedDropdownOptions = ref<DropdownOption[]>([]);
const { replaceRelationsFromSameType, addRelations } = useFormHelper();
const entityId = getEntityIdFromRoute();
const { createEntity } = useManageEntities();
const {
  initialize,
  entityDropdownOptions,
  entitiesLoading,
  getAutocompleteOptions,
  getFormWithRelationFieldCheck,
} = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  "fetchAll",
  undefined,
  props.advancedFilterInputForSearchingOptions,
  props.advancedFilterInputForRetrievingOptions,
  props.formId
);

const {
  initialize: relatedEntitiesInitialize,
  entityDropdownOptions: relatedEntitiesOptions,
  entitiesLoading: relatedEntitiesLoading,
} = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  entityId as string,
  props.fromRelationType,
  props.advancedFilterInputForSearchingOptions,
  props.advancedFilterInputForRetrievingOptions,
);

onMounted(async () => {
  if (props.advancedFilterInputForRetrievingOptions && props.isReadOnly) {
    if (props.isMetadataField) preSelect();
    else await initAutocompleteOption();
  } else {
    if (props.advancedFilterInputForRetrievingOptions && props.modelValue)
      preSelect();
    await initAutocompleteOption();
  }
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

const handleSelect = (
  options: DropdownOption[] | undefined,
  isPreSelect = false
) => {
  if (options === undefined) return;
  const bulkProcessableItems: InBulkProcessableItem[] =
    mapDropdownOptionsToBulkProcessableItem([...options]);

  if (props.mode === "create") {
    addRelations(bulkProcessableItems, props.relationType, props.formId);
  }

  if (props.mode === "edit" && !isPreSelect) {
    replaceRelationsFromSameType(
      bulkProcessableItems,
      props.relationType as string,
      props.formId
    );
  }

  selectedDropdownOptions.value = [...options];
};

const handleCreatingFromTag = async (option: any) => {
  if (!props.canCreateOption) return;

  if (props.metadataKeyToCreateEntityFromOption) {
    isCreatingEntity.value = true;

    const newEntity = await createEntity({
      entityType: props.metadataKeyToGetOptionsFor as Entitytyping,
      metadata: [
        {
          key: props.metadataKeyToCreateEntityFromOption,
          value: option.label,
        },
      ],
    });
    const normalizedOption = {
      value: newEntity.uuid,
      label: option.label,
    };

    handleSelect([...selectedDropdownOptions.value, normalizedOption]);
    isCreatingEntity.value = false;
  } else {
    handleSelect([...selectedDropdownOptions.value, option]);
  }
};

const preSelect = () => {
  let selection: DropdownOption[];
  if (Array.isArray(props.modelValue))
    selection = props.modelValue.map((value) => {
      return { label: value, value };
    });
  else selection = [{ label: props.modelValue || "", value: props.modelValue }];
  handleSelect(selection, true);
};

const dependentRelationValues = computed(() => {
  if (!props.dependsOn || props.disabled) return null;

  const form = getFormWithRelationFieldCheck(props.formId, props.dependsOn);
  return form ? form.values.relationValues[props.dependsOn] : null;
});

watch(
  () => dependentRelationValues.value,
  (newValue: any, oldValue: any) => {
    getAutocompleteOptions("");
    if (!Array.isArray(newValue) || !Array.isArray(oldValue)) return;

    const hasNoUpdates = isEqual(
      newValue
        .flatMap((item: { editStatus?: string }) => item.editStatus)
        .filter(Boolean),
      oldValue
        .flatMap((item: { editStatus?: string }) => item.editStatus)
        .filter(Boolean)
    );
    if (hasNoUpdates) return;

    handleSelect([]);
  },
  { deep: true }
);
</script>
