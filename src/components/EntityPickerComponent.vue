<template>
  <div class="flex flex-col w-full h-full overflow-hidden">
    <BaseLibrary
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
      :confirm-selection-button="true"
      :enable-navigation="false"
      :enable-bulk-operations="true"
      :disable-new-entity-previews="true"
      :use-other-query="newQuery"
      :parent-entity-identifiers="[entityUuid]"
      list-item-route-name="SingleEntity"
      @confirm-selection="
        async (selectedItems) => {
          emit('deleteSelectedItems', selectedItems);
          dequeueAllItemsForBulkProcessing(getContext());
        }
      "
    />
  </div>
</template>

<script lang="ts" setup>
import { Entitytyping, SearchInputType } from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { ref, onMounted } from "vue";
import { useCustomQuery } from "@/composables/useCustomQuery";

const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { loadDocument, getDocument } = useCustomQuery();

const emit = defineEmits<{
  (event: "deleteSelectedItems", selectedItems: InBulkProcessableItem[]): void;
}>();

const props = withDefaults(
  defineProps<{
    entityUuid: string;
    acceptedTypes: string[];
    customQuery: string;
    customFiltersQuery: string;
    relationType: string;
  }>(),
  {}
);

const ignoreCustomQuery = ref<boolean>(false);
const newQuery = ref<object | undefined>(undefined);
const queryLoaded = ref<boolean>(false);

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

onMounted(async () => {
  if (props.customQuery && props.customFiltersQuery) await getCustomQuery();
  else ignoreCustomQuery.value = true;
});
</script>
