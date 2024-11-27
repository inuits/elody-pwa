<template>
  <div class="flex flex-col w-full overflow-hidden">
    <BaseLibrary
      class="overflow-auto"
      :class="baseLibraryHeight"
      v-if="queryLoaded || ignoreCustomQuery"
      :bulk-operations-context="getContext()"
      :entity-type="acceptedTypes?.[0]"
      :search-input-type-on-drawer="
        acceptedTypes.length > 0
          ? acceptedTypes[0] !== Entitytyping.Mediafile
            ? SearchInputType.AdvancedInputType
            : SearchInputType.AdvancedInputMediaFilesType
          : SearchInputType.AdvancedInputType
      "
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
      @confirm-selection="
        async (selectedItems) => {
          confirmSelection(selectedItems);
        }
      "
    />
  </div>
</template>

<script lang="ts" setup>
import {
  type BaseRelationValuesInput,
  Collection,
  type Entity,
  EntityPickerMode,
  Entitytyping,
  MutateEntityValuesDocument,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { ref, onMounted, inject, unref } from "vue";
import { useSubmitForm } from "vee-validate";
import { useMutation } from "@vue/apollo-composable";
import { useI18n } from "vue-i18n";
import { useCustomQuery } from "@/composables/useCustomQuery";
import { useBaseModal } from "@/composables/useBaseModal";
import { type EntityValues, useFormHelper } from "@/composables/useFormHelper";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import useEditMode from "@/composables/useEdit";
import {
  useNotification,
  NotificationType,
} from "@/components/base/BaseNotification.vue";
import { getChildrenOfHomeRoutes } from "@/helpers";

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
    customFiltersQuery: string;
    showButton: boolean;
    enableBulkOperations: boolean;
    enableAdvancedFilters: boolean;
    entityPickerMode: EntityPickerMode;
    baseLibraryHeight?: string;
    enableNonSelectableEntities?: boolean;
  }>(),
  {
    entityPickerMode: EntityPickerMode.Emit,
    baseLibraryHeight: "h-[95vh]",
    enableNonSelectableEntities: true,
  },
);

const { t } = useI18n();
const { loadDocument, getDocument } = useCustomQuery();
const { closeModal } = useBaseModal();
const { addRelations } = useFormHelper();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { getEntityUuid, getRelationType } = useEntityPickerModal();
const { save, addSaveCallback, clearSaveCallbacks } = useEditMode();
const { getForm } = useFormHelper();
const { parseFormValuesToFormInput } = useFormHelper();
const { createNotification } = useNotification();

const childRoutes = getChildrenOfHomeRoutes(config).map(
  (route: any) => route.meta,
);

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

const form = getForm(getEntityUuid());
const ignoreCustomQuery = ref<boolean>(false);
const newQuery = ref<object | undefined>(undefined);
const queryLoaded = ref<boolean>(false);

const emitUpdatedEntities = (numberOfEntities: number) => {
  if (props.entityPickerMode === EntityPickerMode.Save) return;

  emit("entitiesUpdated", numberOfEntities);
};

const confirmSelection = (selectedItems: InBulkProcessableItem[]) => {
  if (props.entityPickerMode === EntityPickerMode.Emit) return;
  addRelations(selectedItems, getRelationType(), getEntityUuid(), true);
  dequeueAllItemsForBulkProcessing(getContext());
  addSaveHandler();
  save(true);
  closeModal(TypeModals.DynamicForm);
};

const getCustomQuery = async () => {
  await loadDocument(props.customQuery, props.customFiltersQuery);
  newQuery.value = getDocument();
  queryLoaded.value = true;
};

const getContext = () => {
  if (props.acceptedTypes.length > 0) {
    if (props.acceptedTypes[0] !== Entitytyping.Mediafile) {
      return BulkOperationsContextEnum.EntityElementListEntityPickerModal;
    } else {
      return BulkOperationsContextEnum.EntityElementMediaEntityPickerModal;
    }
  } else {
    return BulkOperationsContextEnum.EntityElementListEntityPickerModal;
  }
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
    formInput: parseFormValuesToFormInput(props.entityUuid, unref(form.values)),
    collection,
  });

  if (!result?.data?.mutateEntityValues) return;
  const mutatedEntity: Entity = result.data.mutateEntityValues as Entity;
  setValues({
    intialValues: mutatedEntity.intialValues,
    relationValues: mutatedEntity.relationValues,
  });
  createNotification({
    displayTime: 10,
    type: NotificationType.default,
    title: t("notifications.success.entityUpdated.title"),
    description: t("notifications.success.entityUpdated.description"),
    shown: true,
  });
  form.resetForm({ values: form.values });
});

const addSaveHandler = () => {
  clearSaveCallbacks();
  addSaveCallback(submit, "first");
};

onMounted(async () => {
  if (props.customQuery && props.customFiltersQuery) await getCustomQuery();
  else ignoreCustomQuery.value = true;
});
</script>
