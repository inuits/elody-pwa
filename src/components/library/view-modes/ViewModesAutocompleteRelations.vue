<template>
  <base-input-autocomplete
    v-show="selectedDropdownOptions.length > 0 || isEdit || mode === 'create' || isLoading"
    :autocomplete-style="!disabled ? 'defaultWithBorder' : 'readOnly'"
    :options="!disabled ? entityDropdownOptions : selectedDropdownOptions"
    :relationType="relationType"
    :select-type="selectType"
    :model-value="selectedDropdownOptions"
    :disabled="disabled"
    :loading="isLoading"
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
  <p v-show="selectedDropdownOptions.length === 0 && !isEdit && mode !== 'create' && !isLoading">
    {{ "-" }}
  </p>
</template>

<script lang="ts" setup>
import type {
  AdvancedFilterInput,
  DropdownOption,
  Entitytyping,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import isEqual from "lodash.isequal";
import useEntitySingle from "@/composables/useEntitySingle";
import { computed, onMounted, ref, watch } from "vue";
import { getEntityIdFromRoute } from "@/helpers";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import { useManageEntities } from "@/composables/useManageEntities";

const props = withDefaults(
  defineProps<{
    modelValue: string[] | string | undefined;
    metadataKeyToGetOptionsFor?: string | "no-key";
    selectType?: "multi" | "single";
    advancedFilterInputForRetrievingOptions?: [AdvancedFilterInput];
    advancedFilterInputForRetrievingRelatedOptions?: [AdvancedFilterInput];
    advancedFilterInputForRetrievingAllOptions?: [AdvancedFilterInput];
    advancedFilterInputForSearchingOptions: AdvancedFilterInput;
    relationFilter: AdvancedFilterInput;
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
  },
);


const isCreatingEntity = ref<boolean>(false);
const selectedDropdownOptions = ref<DropdownOption[]>([]);
const { replaceRelationsFromSameType, addRelations } = useFormHelper();
const entityId = getEntityIdFromRoute();
const { createEntity } = useManageEntities();
const { isEdit } = useEditMode(useEntitySingle().getEntityUuid());

const advancedFilterInputForRetrievingAllOptions = computed(() => {
  if (props.advancedFilterInputForRetrievingAllOptions.length > 0)
    return props.advancedFilterInputForRetrievingAllOptions;
  return props.advancedFilterInputForRetrievingOptions;
});
const advancedFilterInputForRetrievingRelatedOptions = computed(() => {
  if (props.advancedFilterInputForRetrievingRelatedOptions.length > 0)
    return props.advancedFilterInputForRetrievingRelatedOptions;
  return props.advancedFilterInputForRetrievingOptions;
});

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
  undefined,
  props.advancedFilterInputForSearchingOptions,
  advancedFilterInputForRetrievingAllOptions.value,
  props.formId,
);

const {
  initialize: relatedEntitiesInitialize,
  entityDropdownOptions: relatedEntitiesOptions,
  entitiesLoading: relatedEntitiesLoading,
} = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  props.formId as string ?? entityId as string,
  props.relationType,
  props.fromRelationType,
  props.advancedFilterInputForSearchingOptions,
  advancedFilterInputForRetrievingRelatedOptions.value,
  props.formId,
  props.relationFilter,
);

const isLoading = computed(() => {
  return entitiesLoading.value || relatedEntitiesLoading.value || isCreatingEntity.value;
});

onMounted(async () => {
  if (props.advancedFilterInputForRetrievingOptions && props.isReadOnly) {
    if (props.isMetadataField) preSelect();
    else await initAutocompleteOption();
  } else {
    const preSelectValue = props.modelValue
    await initAutocompleteOption();
    if (props.advancedFilterInputForRetrievingOptions)
      if (props.isMetadataField) preSelect(preSelectValue);
  }
});

const initAutocompleteOption = async () => {
  await initialize();
  if (
    (props.formId || entityId) &&
    (props.relationType || props.fromRelationType) &&
    props.mode !== "create"
  ) {
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
  dropdownOptions: DropdownOption[],
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
  isPreSelect = false,
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
      props.formId,
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

const preSelect = (preSelectValue: DropdownOption | DropdownOption[] | undefined) => {
  let selection: DropdownOption[] = []
  if (preSelectValue) {
    if (Array.isArray(preSelectValue))
      selection = preSelectValue;
    else selection = [preSelectValue];
  } else {
    if (Array.isArray(props.modelValue))
      selection = props.modelValue.map((value) => {
        return { label: value, value };
      });
    else if (props.modelValue)
      selection = [{ label: props.modelValue, value: props.modelValue }];
    else selection = []
  }
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
        .filter(Boolean),
    );
    if (hasNoUpdates) return;

    handleSelect([]);
  },
  { deep: true },
);
</script>
