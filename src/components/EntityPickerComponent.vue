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
      :enable-bulk-operations="enableBulkOperations"
      :enable-advanced-filters="enableAdvancedFilters"
      :disable-new-entity-previews="true"
      :use-other-query="newQuery"
      :parent-entity-identifiers="
        entityPickerMode === EntityPickerMode.Emit ? [entityUuid] : undefined
      "
      :ids-of-non-selectable-entities="getAlreadySelectedEntityIds()"
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
  EntityPickerMode,
  Entitytyping,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { ref, onMounted } from "vue";
import { useCustomQuery } from "@/composables/useCustomQuery";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import useEditMode from "@/composables/useEdit";
import { useForm } from "vee-validate";

const { loadDocument, getDocument } = useCustomQuery();
const { closeModal } = useBaseModal();
const { addRelations } = useFormHelper();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { getEntityUuid, getRelationType } = useEntityPickerModal();
const { save } = useEditMode();
const { getForm } = useFormHelper();

const emit = defineEmits<{
  (event: "entitiesUpdated", numberOfEntities: number): void;
}>();

const props = withDefaults(
  defineProps<{
    entityUuid: string;
    acceptedTypes: string[];
    customQuery: string;
    customFiltersQuery: string;
    showButton: boolean;
    enableBulkOperations: boolean;
    enableAdvancedFilters: boolean;
    entityPickerMode: EntityPickerMode;
    baseLibraryHeight?: string;
  }>(),
  {
    entityPickerMode: EntityPickerMode.Emit,
    baseLibraryHeight: "h-[95vh]",
  }
);

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
  save();
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
  const form = getForm(getEntityUuid());
  if (!form) return [];
  const relationValues = form?.values.relationValues;
  const normalizedRelationIds = Object.keys(relationValues)
    .filter((relationKey: string) => Array.isArray(relationValues[relationKey]))
    .map((relationKey: string) =>
      relationValues[relationKey].map(
        (relation: BaseRelationValuesInput) => relation
      )
    )
    .flat();

  const filteredRelationIds = normalizedRelationIds
    .filter((relation: BaseRelationValuesInput) => !relation.editStatus)
    .map((relation: BaseRelationValuesInput) => relation.key);

  return filteredRelationIds;
};

onMounted(async () => {
  if (props.customQuery && props.customFiltersQuery) await getCustomQuery();
  else ignoreCustomQuery.value = true;
});
</script>
