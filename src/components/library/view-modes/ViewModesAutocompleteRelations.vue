<template>
  <base-input-autocomplete
    v-show="
      selectedDropdownOptions.length > 0 ||
      isEdit ||
      mode === 'create' ||
      isLoading
    "
    :autocomplete-style="!disabled ? 'defaultWithBorder' : 'readOnly'"
    :options="!disabled ? allEntitiesHelper.entityDropdownOptions : selectedDropdownOptions"
    :relationType="relationType"
    :select-type="selectType"
    :model-value="selectedDropdownOptions"
    :disabled="disabled"
    :loading="isLoading"
    @search-change="debouncedGetAutocompleteOptions"
    @update:model-value="
      (value: DropdownOption[] | DropdownOption | undefined) => {
        if (value && !Array.isArray(value)) value = [value];
        handleSelect(value);
      }
    "
    :search-filter="
      (option: unknown) => {
        return option;
      }
    "
    :can-create-option="canCreateOption"
    @add-option="handleCreatingFromTag"
    @handle-tag-click="handleTagClick"
  />
  <p
    v-show="
      selectedDropdownOptions.length === 0 &&
      !isEdit &&
      mode !== 'create' &&
      !isLoading
    "
  >
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
import debounce from "lodash.debounce";
import useEntitySingle from "@/composables/useEntitySingle";
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { getEntityIdFromRoute } from "@/helpers";
import { getFormattersSettings, goToEntityPageById } from "@/helpers";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { useManageEntities } from "@/composables/useManageEntities";
import { useRouter } from "vue-router";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import { useGetDropdownOptionsState } from "@/composables/useGetDropdownOptionsState";

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

const allEntitiesHelper = ref<typeof useGetDropdownOptionsState>();
const relatedEntitiesHelper = ref<typeof useGetDropdownOptionsState>();
const entityId = getEntityIdFromRoute();
const isCreatingEntity = ref<boolean>(false);
const router = useRouter();
const selectedDropdownOptions = ref<DropdownOption[]>([]);
const { createEntity } = useManageEntities();
const { isEdit } = useEditMode(useEntitySingle().getEntityUuid());
const { replaceRelationsFromSameType, addRelations } = useFormHelper();

const debouncedGetAutocompleteOptions = debounce((value: string) => {
  allEntitiesHelper.value.getAutocompleteOptions(value);
}, 250);

onBeforeUnmount(() => {
  debouncedGetAutocompleteOptions.cancel();
});

const isLoading = computed(() => {
  return (
    allEntitiesHelper.value.entitiesLoading.value ||
    relatedEntitiesHelper.value.entitiesLoading.value ||
    isCreatingEntity.value
  );
});

onBeforeMount(() => {
  console.log(props.formId);
  console.log(props.relationType);
  allEntitiesHelper.value = useGetDropdownOptions(
    `${props.formId}-${props.relationType}-fetchAll`,
    "get",
  );
  console.log(allEntitiesHelper.value);
  relatedEntitiesHelper.value = useGetDropdownOptions(
    `${props.formId}-${props.relationType}-fetchRelations`,
    "get",
  );
})

onMounted(async () => {
  const dependentRelationValues = computed(() => {
    if (!props.dependsOn || props.disabled) return null;

    console.log(allEntitiesHelper.value);
    const form = allEntitiesHelper.value.getFormWithRelationFieldCheck(props.formId, props.dependsOn);
    return form ? form.values.relationValues[props.dependsOn] : null;
  });

  watch(
    () => dependentRelationValues.value,
    (newValue: any, oldValue: any) => {
      allEntitiesHelper.value.getAutocompleteOptions("");
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

  if (props.advancedFilterInputForRetrievingOptions && props.isReadOnly) {
    if (props.isMetadataField) preSelect();
    else {
      await initAutocompleteOption();
    }
  } else {
    const preSelectValue = props.modelValue;
    await initAutocompleteOption();
    if (props.advancedFilterInputForRetrievingOptions)
      if (props.isMetadataField) preSelect(preSelectValue);
  }
});

const initAutocompleteOption = async () => {
  if (props.isReadOnly) {
    if (
      (props.formId || entityId) &&
      (props.relationType || props.fromRelationType) &&
      props.mode !== "create"
    ) {
      await relatedEntitiesHelper.value.initialize();
    }
  }
  else {
    await allEntitiesHelper.value.initialize();
  }

  if (
    props.autoSelectable &&
    allEntitiesHelper.value.entityDropdownOptions.value.length === 1 &&
    relatedEntitiesHelper.value.entityDropdownOptions.value.length === 0
  ) {
    populateSelectedOptions(allEntitiesHelper.value.entityDropdownOptions);
    handleSelect(allEntitiesHelper.value.entityDropdownOptions);
  } else {
    populateSelectedOptions(relatedEntitiesHelper.value.entityDropdownOptions);
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

const preSelect = (
  preSelectValue: DropdownOption | DropdownOption[] | undefined,
) => {
  let selection: DropdownOption[] = [];
  if (preSelectValue) {
    if (Array.isArray(preSelectValue)) selection = preSelectValue;
    else selection = [preSelectValue];
  } else {
    if (Array.isArray(props.modelValue))
      selection = props.modelValue.map((value) => {
        return { label: value, value };
      });
    else if (props.modelValue)
      selection = [{ label: props.modelValue, value: props.modelValue }];
    else selection = [];
  }
  handleSelect(selection, true);
};

const handleTagClick = async (tag: DropdownOption) => {
  if (isEdit) return;
  const linkFormattersSettings = (await getFormattersSettings())?.link || {};
  const [entityType, linkSetting] =
    Object.entries(linkFormattersSettings).find(
      ([, value]) => (value as any).relationType === props.relationType,
    ) || [];
  if (entityType && linkSetting)
    goToEntityPageById(tag.value, { type: entityType }, "SingleEntity", router);
};
</script>
