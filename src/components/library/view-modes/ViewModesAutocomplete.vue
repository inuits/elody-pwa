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
    :canCreateOption="metadataKeyToGetOptionsFor === 'keyword'"
    @add-tag="addNewTag"
  />
</template>

<script lang="ts" setup>
import type {
  DropdownOption,
  Entitytyping,
  AdvancedFilterInput,
  EntityInput,
} from "@/generated-types/queries";
import { onMounted, ref } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { getEntityIdFromRoute } from "@/helpers";

//new imports to create new entity
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";

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
  }>(),
  {
    selectType: "multi",
    label: "",
    metadataKeyToGetOptionsFor: "no-key",
    mode: "edit",
    formId: undefined,
    autoSelectable: false,
    disabled: false,
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
const { loadDocument } = useImport();
const addNewTag = async (option: any) => {
  isCreatingEntity.value = true;

  // call to create new entity & normalize response to the dropdown option
  const newEntity = await createEntity(option.label);
  const normalizedOption = {
    value: newEntity?.data?.CreateEntity?.uuid,
    label: option.label,
  };

  // handle selected option
  setTimeout(() => {
    handleSelect([...selectedDropdownOptions.value, normalizedOption]);
    isCreatingEntity.value = false;
  }, 350);
};

const createEntityFromFormInput = (
  entityType: Entitytyping,
  title: string
): EntityInput => {
  let entity: EntityInput = { type: entityType };
  entity.metadata = [{ key: "title", value: title }];
  entity.relations = [];
  return entity;
};

const getQuery = async (queryName: string = "CreateEntity") => {
  // queryName should be in graphql
  return await loadDocument(queryName);
};

const createEntity = async (title: string) => {
  const query = await getQuery();
  const response = await performCreatingEnty(
    query,
    createEntityFromFormInput(
      props.metadataKeyToGetOptionsFor as Entitytyping,
      title
    )
  );
  return response;
};

const performCreatingEnty = async (
  queryDocument: any,
  entity: EntityInput
): Promise<any> => {
  return await apolloClient.mutate({
    mutation: queryDocument,
    variables: { entity },
  });
};
</script>
