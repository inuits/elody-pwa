<template>
  <base-input-autocomplete
    v-show="
      selectedDropdownOptions.length > 0 ||
      isEdit ||
      mode === 'create' ||
      isLoading
    "
    :autocomplete-style="autocompleteStyle"
    :options="
      !disabled
        ? allEntitiesHelper.entityDropdownOptions
        : selectedDropdownOptions
    "
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
    :create-option-config="{
      canCreateOption,
      createPromptTranslationKey: 'actions.labels.create-entity-from-dropdown',
    }"
    :displayInputForTag="metadataOnRelationConfig?.enabled"
    :initial-tag-input-values="tagInputValues"
    @update:tag-input-values="
      (values: Map<string | number, string>) => (tagInputValues = values)
    "
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
  MetadataOnRelationFieldConfig,
} from "@/generated-types/queries";
import { GetEntityByIdDocument } from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { apolloClient } from "@/main";
import {
  extractTagInputValuesFromRelations,
  mapDropdownOptionsToBulkProcessableItem,
  toPreselectId,
} from "./mapDropdownOptionsToBulkProcessableItem";
import { dequal as isEqual } from "dequal";
import debounce from "lodash.debounce";
import useEntitySingle from "@/composables/useEntitySingle";
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { getEntityIdFromRoute, getEntityTitle, looksLikeEntityId } from "@/helpers";
import { getFormattersSettings, goToEntityPageById } from "@/helpers";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { useManageEntities } from "@/composables/useManageEntities";
import { useRouter } from "vue-router";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import { useGetDropdownOptionsState } from "@/composables/useGetDropdownOptionsState";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";

defineOptions({ inheritAttrs: false });

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
    dependsOn?: string;
    mode: "edit" | "create";
    formId: string;
    autoSelectable: boolean;
    disabled: boolean;
    canCreateOption?: boolean;
    metadataKeyToCreateEntityFromOption?: string;
    isReadOnly?: boolean;
    isMetadataField?: boolean;
    metadataOnRelationConfig?: MetadataOnRelationFieldConfig | null;
    readOnlyValueAsPlainText?: boolean;
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
const { confirm } = useConfirmModal();
const { t } = useI18n();
const selectedDropdownOptions = ref<DropdownOption[]>([]);
const tagInputValues = ref<Map<string | number, string>>(new Map());
const { createEntity } = useManageEntities();
const { isEdit } = useEditMode(useEntitySingle().getEntityUuid());
const { replaceRelationsFromSameType, addRelations, getRelationsBasedOnType } =
  useFormHelper();

const autocompleteStyle = computed(() => {
  if (props.disabled && props.readOnlyValueAsPlainText)
    return "readOnlyAsPlainText";
  if (props.disabled) return "readOnly";
  return "defaultWithBorder";
});

const debouncedGetAutocompleteOptions = debounce((value: string) => {
  allEntitiesHelper.value.getAutocompleteOptions(value);
}, 250);

const debouncedUpdateRelationsWithMetadata = debounce(() => {
  if (selectedDropdownOptions.value.length > 0) {
    handleSelect(selectedDropdownOptions.value);
  }
}, 250);

onBeforeUnmount(() => {
  debouncedGetAutocompleteOptions.cancel();
  debouncedUpdateRelationsWithMetadata.cancel();
});

const isLoading = computed(() => {
  return (
    allEntitiesHelper.value.entitiesLoading.value ||
    relatedEntitiesHelper.value.entitiesLoading.value ||
    isCreatingEntity.value
  );
});

onBeforeMount(() => {
  allEntitiesHelper.value = useGetDropdownOptions(
    `${props.formId}-${props.relationType}-fetchAll`,
    "get",
  );
  relatedEntitiesHelper.value = useGetDropdownOptions(
    `${props.formId}-${props.relationType}-fetchRelations`,
    "get",
  );
});

onMounted(async () => {
  const dependentRelationValues = computed(() => {
    if (!props.dependsOn || props.disabled) return null;

    const form = allEntitiesHelper.value.getFormWithRelationFieldCheck(
      props.formId,
      props.dependsOn,
    );
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
    if (props.isMetadataField) preSelectMetadata();
    else {
      await initAutocompleteOption();
    }
  } else {
    const preSelectValue = props.modelValue;
    await initAutocompleteOption();
    if (props.advancedFilterInputForRetrievingOptions)
      if (props.isMetadataField) preSelectMetadata(preSelectValue);
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
  } else {
    await allEntitiesHelper.value.initialize();
  }

  if (!props.isReadOnly && props.relationFilter) {
    if (
      (props.formId || entityId) &&
      (props.relationType || props.fromRelationType) &&
      props.mode !== "create"
    ) {
      await relatedEntitiesHelper.value.initialize();
    }
  }

  if (
    props.autoSelectable &&
    allEntitiesHelper.value.entityDropdownOptions.value?.length === 1 &&
    relatedEntitiesHelper.value.entityDropdownOptions.value?.length === 0
  ) {
    populateSelectedOptions(allEntitiesHelper.value.entityDropdownOptions);
    handleSelect(allEntitiesHelper.value.entityDropdownOptions);
  } else if (
    props.mode === "create" &&
    !props.isReadOnly &&
    props.modelValue &&
    !relatedEntitiesHelper.value.entityDropdownOptions.value?.length
  ) {
    // Pre-fill from the incoming modelValue (e.g. copyValueFromParent in a guided
    // flow) whenever there are no existing related entities. Scoped to create mode:
    // on detail-page edit the modelValue holds the existing relations, which must be
    // displayed via the resolved related entities instead of re-resolved one by one.
    await preSelectRelations();
  } else {
    populateSelectedOptions(relatedEntitiesHelper.value.entityDropdownOptions);
  }
  populateTagInputValuesFromForm();
};

const toBulkProcessableItems = (
  dropdownOptions: DropdownOption[],
): InBulkProcessableItem[] =>
  mapDropdownOptionsToBulkProcessableItem(
    dropdownOptions,
    props.metadataOnRelationConfig,
    tagInputValues.value,
  );

const populateTagInputValuesFromForm = () => {
  if (!props.metadataOnRelationConfig?.enabled || !props.formId) return;
  const relations = getRelationsBasedOnType(props.formId, props.relationType);
  if (!relations) return;
  const map = extractTagInputValuesFromRelations(
    relations,
    props.metadataOnRelationConfig.key,
  );
  if (map.size > 0) {
    tagInputValues.value = map;
  }
};

const populateSelectedOptions = (options: DropdownOption[]) => {
  if (options.length === 0 && selectedDropdownOptions.value?.length === 0)
    return;
  selectedDropdownOptions.value = options;
};

const handleSelect = (
  options: DropdownOption[] | undefined,
  isPreSelect = false,
) => {
  if (options === undefined) return;
  const bulkProcessableItems: InBulkProcessableItem[] = toBulkProcessableItems([
    ...options,
  ]);

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

  const choice = await confirm({
    title: t("confirm.create-entity-from-dropdown.title", [option.label]),
    message: t("confirm.create-entity-from-dropdown.message", [option.label]),
    confirmLabel: t("confirm.create-entity-from-dropdown.confirm"),
    cancelLabel: t("confirm.create-entity-from-dropdown.cancel"),
    confirmButtonStyle: "accentAccent",
  });
  if (choice !== "confirm") return;

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

const preSelectMetadata = (
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

const preSelectRelations = async () => {
  const selection: DropdownOption[] = [];

  const values = Array.isArray(props.modelValue)
    ? props.modelValue
    : [props.modelValue];
  for (const rawValue of values) {
    // Entries may be relation objects ({ key, type }) when the field is bound to
    // relationValues — resolve those by their key, never by the object itself.
    const value = toPreselectId(rawValue);
    if (!value) continue;
    const found = await findAutocompleteOption(value);
    if (found) selection.push(found);
    // No existing entity matches this value: keep it as a label-only chip (e.g. a
    // new genre pre-filled from an external record). It is submitted as a relation
    // whose key is the label; the backend find-or-creates the entity on save.
    else selection.push({ label: value, value });
  }

  allEntitiesHelper.value.getAutocompleteOptions();
  handleSelect(selection, true);
};

const findAutocompleteOption = async (
  value: string,
): Promise<DropdownOption | undefined> => {
  // A pre-filled value that is already an entity id is resolved by id: searching by
  // text can match the wrong entity for vocabularies whose identity needs more than a
  // label (e.g. a code_wording is unique per code + type, so resolving by code alone
  // picks the wrong one). Fall back to the text search for label-only values.
  const entityType = props.metadataKeyToGetOptionsFor;
  if (looksLikeEntityId(value) && entityType && entityType !== "no-key") {
    try {
      const result = await apolloClient.query({
        query: GetEntityByIdDocument,
        variables: { id: value, type: entityType as Entitytyping },
        fetchPolicy: "no-cache",
      });
      const entity = result.data?.Entity;
      if (entity) return { label: getEntityTitle(entity), value };
    } catch {
      // fall through to the text search below
    }
  }
  await allEntitiesHelper.value.getAutocompleteOptions(value);
  return allEntitiesHelper.value.entityDropdownOptions.value?.[0];
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

watch(
  () => relatedEntitiesHelper.value?.entityDropdownOptions,
  (dropdownOptions: DropdownOption[]) => {
    populateSelectedOptions(dropdownOptions);
  },
);

watch(
  tagInputValues,
  () => {
    if (props.metadataOnRelationConfig?.enabled) {
      debouncedUpdateRelationsWithMetadata();
    }
  },
  { deep: true },
);
</script>
