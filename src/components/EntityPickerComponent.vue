<template>
  <div
    class="flex flex-col w-full overflow-hidden"
    :class="searchMode === EntityPickerSearchMode.Search ? baseLibraryHeight : undefined"
  >
    <SearchBar
      v-if="searchMode === EntityPickerSearchMode.Search"
      :input-enabled="true"
      @search="onSearch"
    />
    <BaseLibrary
      class="overflow-auto"
      :class="searchMode === EntityPickerSearchMode.Search ? 'flex-1 min-h-0' : baseLibraryHeight"
      v-if="queryLoaded || ignoreCustomQuery"
      :bulk-operations-context="getContext()"
      :entity-type="acceptedTypes?.[0]"
      :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
      :filters="allFilters"
      :show-button="showButton"
      :confirm-selection-button="true"
      :enable-navigation="false"
      :enable-advanced-filters="searchMode !== EntityPickerSearchMode.Search && enableAdvancedFilters"
      :enable-bulk-operations="enableBulkOperations"
      :selectionEnabled="true"
      :disable-new-entity-previews="true"
      :use-other-query="newQuery"
      :parent-entity-identifiers="
        entityPickerMode === EntityPickerMode.Emit ? [entityUuid] : undefined
      "
      :ids-of-non-selectable-entities="
        enableNonSelectableEntities ? alreadySelectedEntityIdsFetched : []
      "
      :actions-on-result="getActionsOnResult()"
      list-item-route-name="SingleEntity"
      @entities-updated="
        (numberOfEntities) => emitUpdatedEntities(numberOfEntities)
      "
      :should-use-state-for-route="shouldUseStateForRoute"
      @confirm-selection="saveRelations"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Entity } from "@/generated-types/queries";
import {
  type BaseEntity,
  type AdvancedFilterInput,
  type BaseRelationValuesInput,
  Collection,
  EntityPickerMode,
  EntityPickerSearchMode,
  Entitytyping,
  MutateEntityValuesDocument,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import { buildEntityPickerSearchFilters, buildEntityPickerTypeFilter } from "@/composables/useEntityPickerSearch";
import SearchBar from "@/components/SearchBar.vue";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import {
  computed,
  inject,
  onBeforeMount,
  onMounted,
  onUnmounted,
  provide,
  ref,
  unref,
} from "vue";
import { useMutation } from "@vue/apollo-composable";
import { useI18n } from "vue-i18n";
import { useCustomQuery } from "@/composables/useCustomQuery";
import { useBaseModal } from "@/composables/useBaseModal";
import type { EntityValues } from "@/composables/useFormHelper";
import { useFormHelper } from "@/composables/useFormHelper";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useEditMode } from "@/composables/useEdit";
import { getChildrenOfHomeRoutes } from "@/helpers";
import { useSubmitForm } from "vee-validate";
import { useModalActions } from "@/composables/useModalActions";
import { buildItemsWithRelationMetadata } from "@/composables/entityPickerRelationMetadata";
import { dequal } from "dequal";
const { addMediafileSelectionStateContext } = useEntityMediafileSelector();
const emit = defineEmits<{
  (event: "entitiesUpdated", numberOfEntities: number): void;
  (event: "entitiesSelected", items: InBulkProcessableItem[]): void;
}>();
const config: any = inject("config");

const props = withDefaults(
  defineProps<{
    entityUuid: string;
    parentEntityType?: string;
    acceptedTypes: string[];
    customQuery: string;
    customFiltersQuery?: string;
    computedFilters?: AdvancedFilterInput[];
    context?: BulkOperationsContextEnum;
    showButton: boolean;
    enableBulkOperations: boolean;
    enableAdvancedFilters: boolean;
    entityPickerMode: EntityPickerMode;
    baseLibraryHeight?: string;
    enableNonSelectableEntities?: boolean;
    shouldUseStateForRoute?: boolean;
    selectionLimit?: number; // max selectable entities (0/absent = unlimited)
    searchMode?: EntityPickerSearchMode;
    searchMetadataKeys?: string[];
    searchAcceptedTypes?: string[];
  }>(),
  {
    entityPickerMode: EntityPickerMode.Emit,
    baseLibraryHeight: "h-[95vh]",
    enableNonSelectableEntities: true,
    context: BulkOperationsContextEnum.EntityElementListEntityPickerModal,
    shouldUseStateForRoute: true,
    selectionLimit: 0,
    searchMode: EntityPickerSearchMode.Filters,
    searchMetadataKeys: () => [],
    searchAcceptedTypes: () => [],
  },
);

const { t, locale } = useI18n();

const searchTerm = ref<string>("");
const onSearch = (term: string) => { searchTerm.value = term; };
const isSearchMode = computed<boolean>(
  () => props.searchMode === EntityPickerSearchMode.Search,
);
const searchModeFilters = computed<AdvancedFilterInput[]>(() =>
  isSearchMode.value
    ? buildEntityPickerSearchFilters(searchTerm.value, props.searchMetadataKeys ?? [])
    : [],
);
const searchModeTypeFilter = computed<AdvancedFilterInput[]>(() =>
  isSearchMode.value
    ? buildEntityPickerTypeFilter(props.searchAcceptedTypes ?? [])
    : [],
);
const allFilters = computed<AdvancedFilterInput[] | undefined>(() => {
  const filters = [
    ...(props.computedFilters ?? []),
    ...searchModeTypeFilter.value,
    ...searchModeFilters.value,
  ];
  return filters.length ? filters : undefined;
});

const { loadDocument, getDocument } = useCustomQuery();
const { closeModal, openModal, getModalInfo } = useBaseModal();
const { addRelations } = useFormHelper();
const { dequeueAllItemsForBulkProcessing, setBulkSelectionLimit } =
  useBulkOperations();
const {
  getEntityId,
  getRelationType,
  getRefetchEntitiesFunction,
  getActionsOnResult,
  setCropMode,
  setCropCoordinatesKey,
  getRelationMetadataFromFormFields,
  getDynamicFormId,
} = useEntityPickerModal();
const useEditHelper = useEditMode(getEntityId());
const { parseFormValuesToFormInput, getForm } = useFormHelper();
const { getCallbackFunctions } = useModalActions();
const { displayWarningNotification, displaySuccessNotification } =
  useBaseNotification();

provide("ParentEntityProvider", getModalInfo(TypeModals.DynamicForm).parentEntity);

provide(
  "mediafileViewerContext",
  props.customFiltersQuery ? props.customFiltersQuery : "EntityPickerComponent",
);
addMediafileSelectionStateContext(
  props.customFiltersQuery ? props.customFiltersQuery : "EntityPickerComponent",
);


const childRoutes = getChildrenOfHomeRoutes(config).map(
  (route: any) => route.meta,
);

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

const form = getForm(getEntityId());
const ignoreCustomQuery = ref<boolean>(false);
const newQuery = ref<object | undefined>(undefined);
const queryLoaded = ref<boolean>(false);
const alreadySelectedEntityIdsFetched = ref<string[]>([]);

const emitUpdatedEntities = (numberOfEntities: number) => {
  if (props.entityPickerMode === EntityPickerMode.Save) return;
  emit("entitiesUpdated", numberOfEntities);
};

const injectRelationMetadataFromForm = (
  items: InBulkProcessableItem[],
): InBulkProcessableItem[] => {
  const metadataFields = getRelationMetadataFromFormFields();
  if (metadataFields.length === 0) return items;

  const dynamicForm = getForm(getDynamicFormId());
  if (!dynamicForm) return items;

  const enriched = buildItemsWithRelationMetadata(
    items,
    metadataFields,
    (dynamicForm.values.relatedEntityData?.relations as Record<string, any>) ?? {},
  );

  if (!dequal(enriched, items)) {
    metadataFields.forEach(({ formMetadataKey }) => {
      dynamicForm.setFieldValue(
        `relatedEntityData.relations.${formMetadataKey}`,
        undefined,
      );
    });
  }

  return enriched;
};

const saveRelations = async (selectedItems: InBulkProcessableItem[]) => {
  if (props.entityPickerMode === EntityPickerMode.Emit) {
    emit("entitiesSelected", selectedItems);
    dequeueAllItemsForBulkProcessing(getContext());
    return;
  }

  if (useEditHelper?.isEdit) {
    useEditHelper.clickButton();
    await useEditHelper.save();
    if (useEditHelper.isDisabled) {
      closeModal(TypeModals.DynamicForm);
      displayWarningNotification(
        "notifications.warning.entity-not-updated.title",
        "notifications.warning.entity-not-updated.description",
      );
      return;
    }
  }

  const enrichedItems = injectRelationMetadataFromForm(selectedItems);
  addRelations(enrichedItems, getRelationType(), getEntityId(), true);
  dequeueAllItemsForBulkProcessing(getContext());
  useEditHelper.setSubmitFunction(submit);
  await useEditHelper.save(true);
};

const getCustomQuery = async () => {
  await loadDocument(props.customQuery, props.customFiltersQuery);
  newQuery.value = getDocument();
  queryLoaded.value = true;
};

const getContext = () => {
  if (props.acceptedTypes[0] == Entitytyping.Mediafile)
    return BulkOperationsContextEnum.EntityElementMediaEntityPickerModal;
  return props.context;
};

const getAlreadySelectedEntityIds = (): string[] => {
  if (!form) return [];
  const relationValues = form?.values.relationValues;
  const normalizedRelationIds = Object.keys(relationValues)
    .filter((relationKey: string) => Array.isArray(relationValues[relationKey]))
    .map((relationKey: string) =>
      relationValues[relationKey].map(
        (relation: BaseRelationValuesInput) => relation,
      ),
    )
    .flat();

  const filteredRelationIds = normalizedRelationIds
    .filter((relation: BaseRelationValuesInput) => !relation.editStatus)
    .map((relation: BaseRelationValuesInput) => relation.key);

  return filteredRelationIds;
};

const submit = useSubmitForm<EntityValues>(async () => {
  const { setValues } = form;
  const collection =
    childRoutes.find(
      (route: any) =>
        route.entityType?.toLowerCase() ===
        props.parentEntityType.toLowerCase(),
    )?.type || Collection.Entities;
  if (!collection) throw Error("Could not determine collection for submit");

  const savedModalInfo = getModalInfo(TypeModals.DynamicForm);
  const callbackFunctions = getCallbackFunctions();
  closeModal(TypeModals.DynamicForm);

  const result = await mutate({
    id: props.entityUuid,
    formInput: parseFormValuesToFormInput(
      props.entityUuid,
      unref(form.values),
      true,
    ),
    collection,
    preferredLanguage: config.features.supportsMultilingualMetadataEditing
      ? locale.value
      : undefined,
  });

  if (!result?.data?.mutateEntityValues) {
    openModal(
      TypeModals.DynamicForm,
      savedModalInfo.modalStyle,
      savedModalInfo.formQuery,
      savedModalInfo.deleteQueryOptions,
      savedModalInfo.closeConfirmation,
      savedModalInfo.context,
    );
    return;
  }

  const mutatedEntity: Entity = result.data.mutateEntityValues as Entity;
  setValues({
    intialValues: mutatedEntity.intialValues,
    relationValues: mutatedEntity.relationValues,
  });
  displaySuccessNotification(
    t("notifications.success.entityUpdated.title"),
    t("notifications.success.entityUpdated.description"),
  );
  if (form) form.resetForm({ values: form.values });
  for (const callback of callbackFunctions) {
    if (callback) await callback();
  }
  setCropMode(false);
  setCropCoordinatesKey("");
});

const refetchRelationsWithNoLimit = async (): string[] => {
  alreadySelectedEntityIdsFetched.value = [props.entityUuid];

  const refetchEntities = getRefetchEntitiesFunction();
  if (!refetchEntities) return;

  const relatedEntities = await refetchEntities(-1);
  if (relatedEntities?.results?.length <= 0) return;
  alreadySelectedEntityIdsFetched.value = [
    ...alreadySelectedEntityIdsFetched.value,
    ...relatedEntities.results.map((entity: BaseEntity) => entity.id),
  ];
};

onMounted(async () => {
  if (props.selectionLimit)
    setBulkSelectionLimit(getContext(), props.selectionLimit);
  if (props.customQuery && props.customFiltersQuery) await getCustomQuery();
  else ignoreCustomQuery.value = true;
});

onUnmounted(() => {
  // the bulk-operations context is shared module state: lift the limit so
  // other pickers using the same context are not constrained by it
  if (props.selectionLimit) setBulkSelectionLimit(getContext(), 0);
});

onBeforeMount(async () => {
  refetchRelationsWithNoLimit();
});
</script>
