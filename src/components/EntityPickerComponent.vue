<template>
  <div class="flex flex-col w-full overflow-hidden">
    <BaseLibrary
      class="overflow-auto"
      :class="baseLibraryHeight"
      v-if="queryLoaded || ignoreCustomQuery"
      :bulk-operations-context="getContext()"
      :entity-type="acceptedTypes?.[0]"
      :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
      :filters="computedFilters || undefined"
      :show-button="showButton"
      :confirm-selection-button="true"
      :enable-navigation="false"
      :enable-advanced-filters="enableAdvancedFilters"
      :enable-bulk-operations="enableBulkOperations"
      :selectionEnabled="true"
      :disable-new-entity-previews="true"
      :use-other-query="newQuery"
      :parent-entity-identifiers="
        entityPickerMode === EntityPickerMode.Emit ? [entityUuid] : undefined
      "
      :ids-of-non-selectable-entities="
        enableNonSelectableEntities ? getAlreadySelectedEntityIds() : []
      "
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
  type AdvancedFilterInput,
  type BaseRelationValuesInput,
  Collection,
  EntityPickerMode,
  Entitytyping,
  MutateEntityValuesDocument,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { inject, onMounted, provide, ref, unref } from "vue";
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
const { addMediafileSelectionStateContext } = useEntityMediafileSelector();

const emit = defineEmits<{
  (event: "entitiesUpdated", numberOfEntities: number): void;
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
  }>(),
  {
    entityPickerMode: EntityPickerMode.Emit,
    baseLibraryHeight: "h-[95vh]",
    enableNonSelectableEntities: true,
    context: BulkOperationsContextEnum.EntityElementListEntityPickerModal,
    shouldUseStateForRoute: true,
  },
);

provide(
  "mediafileViewerContext",
  props.customFiltersQuery ? props.customFiltersQuery : "EntityPickerComponent",
);
addMediafileSelectionStateContext(
  props.customFiltersQuery ? props.customFiltersQuery : "EntityPickerComponent",
);

const { t, locale } = useI18n();
const { loadDocument, getDocument } = useCustomQuery();
const { closeModal } = useBaseModal();
const { addRelations } = useFormHelper();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { getEntityId, getRelationType } = useEntityPickerModal();
const useEditHelper = useEditMode(getEntityId());
const { getForm } = useFormHelper();
const { parseFormValuesToFormInput } = useFormHelper();
const { displaySuccessNotification } = useBaseNotification();
const { getCallbackFunction } = useModalActions();

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

const emitUpdatedEntities = (numberOfEntities: number) => {
  if (props.entityPickerMode === EntityPickerMode.Save) return;
  emit("entitiesUpdated", numberOfEntities);
};

const saveRelations = (selectedItems: InBulkProcessableItem[]) => {
  if (props.entityPickerMode === EntityPickerMode.Emit) return;
  addRelations(selectedItems, getRelationType(), getEntityId(), true);
  dequeueAllItemsForBulkProcessing(getContext());
  useEditHelper.setSubmitFunction(submit);
  useEditHelper.save(true);
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

  if (!result?.data?.mutateEntityValues) return;
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
  const callback = getCallbackFunction();
  if (callback) await callback();
  closeModal(TypeModals.DynamicForm);
});

onMounted(async () => {
  if (props.customQuery && props.customFiltersQuery) await getCustomQuery();
  else ignoreCustomQuery.value = true;
});
</script>
