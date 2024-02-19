<template>
  <div>
    <entity-element-wrapper :label="label" :isCollapsed="isCollapsed">
      <template v-slot:actions>
        <div
          v-if="isEdit && relationType"
          class="flex items-center px-2 text-text-subtitle cursor-pointer"
          @click.stop="
            () => {
              setAcceptedTypes(types as Entitytyping[]);
              setRelationType(relationType);
              openModal(TypeModals.EntityPicker, undefined, 'right');
              toggleElementCollapse(label, false);
            }
          "
        >
          <unicon height="16" :name="Unicons.PlusCircle.name" />
          <p class="underline">
            {{ t("library.add") }}
          </p>
        </div>
      </template>
      <template v-slot:content>
        <div
          v-if="!requiresCustomQuery || queryLoaded"
          class="ml-1 bg-neutral-lightest"
        >
          <BaseLibrary
            v-if="type === MediaFileElementTypes.Media"
            class="flex-1"
            :bulk-operations-context="
              BulkOperationsContextEnum.EntityElementMedia
            "
            :search-input-type-on-drawer="
              SearchInputType.AdvancedInputMediaFilesType
            "
            :predefined-entities="
              entityId === mediafileSelectionState.selectedMediafile?.id ||
              entityId === mediafileSelectionState.selectedMediafile?.uuid
                ? [mediafileSelectionState.selectedMediafile]
                : undefined
            "
            :enable-preview="true"
            :enable-advanced-filters="false"
            :enable-bulk-operations="true"
            :enable-navigation="false"
            :parent-entity-identifiers="
              entityId === mediafileSelectionState.selectedMediafile?.id ||
              entityId === mediafileSelectionState.selectedMediafile?.uuid
                ? undefined
                : identifiers
            "
            :filter-type="Entitytyping.Mediafile"
            list-item-route-name="SingleEntity"
            :entity-type="Entitytyping.Mediafile"
            :relation-type="relationType"
            :use-other-query="newQuery"
            :basic-base-library="basicBaseLibrary"
          />
          <BaseLibrary
            class="flex-1"
            v-else
            :bulk-operations-context="
              createCustomContext(
                BulkOperationsContextEnum.EntityElementList + relationType
              )
            "
            :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
            :enable-advanced-filters="false"
            :enable-bulk-operations="true"
            :enable-navigation="false"
            :parent-entity-identifiers="identifiers"
            :filter-type="types[0]"
            list-item-route-name="SingleEntity"
            :relation-type="relationType"
            :has-sticky-bars="false"
            :use-other-query="newQuery"
            :basic-base-library="basicBaseLibrary"
          />
        </div>
      </template>
    </entity-element-wrapper>
  </div>
</template>

<script lang="ts" setup>
import {
  SearchInputType,
  TypeModals,
  EntityListViewMode,
  type Entity,
  Entitytyping,
  MediaFileElementTypes,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import useEditMode from "@/composables/useEdit";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import { useRoute } from "vue-router";
import { useEntityElementCollapseHelper } from "@/composables/useResizeHelper";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { watch, ref, onBeforeMount, computed } from "vue";
import { useImport } from "@/composables/useImport";
import { bulkSelectAllSizeLimit } from "@/main";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { asString } from "@/helpers";
import useEntitySingle from "@/composables/useEntitySingle";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";
import useUpload from "@/composables/useUpload";

const { addRelations } = useFormHelper();
const { createCustomContext } = useBulkOperations();
const { toggleElementCollapse } = useEntityElementCollapseHelper();
const { setAcceptedTypes, setRelationType } = useEntityPickerModal();
const { openModal } = useBaseModal();
const { loadDocument } = useImport();
const { isEdit } = useEditMode();
const { t } = useI18n();
const { mediafileSelectionState } = useEntityMediafileSelector();
const { getEntityUuid } = useEntitySingle();
const { uploadStatus } = useUpload();
const {
  setIdentifiers,
  setQueryRelationType,
  setSearchInputType,
  setEntityType,
} = useQueryVariablesFactory();

const props = withDefaults(
  defineProps<{
    isCollapsed: Boolean;
    types: string[];
    label: string;
    type: MediaFileElementTypes;
    customQuery: string;
    customQueryRelationType: string;
    customQueryFilters: String;
    searchInputType: string;
    entityList: Entity[];
    identifiers: string[];
    relationType: string;
    viewMode?: EntityListViewMode;
    basicBaseLibrary?: Boolean;
  }>(),
  {
    types: () => [],
    viewMode: EntityListViewMode.Library,
    basicBaseLibrary: false,
  }
);

watch(
  () => props.entityList,
  () => {
    if (props.entityList.length > 0) {
      updateRelationForm(props.entityList);
    }
  }
);

const entityId = computed(
  () => getEntityUuid() || asString(useRoute().params["id"])
);

const requiresCustomQuery = computed(() => props.customQuery != undefined);
const queryLoaded = ref<boolean>(false);
const newQuery = ref<object>(undefined);

onBeforeMount(async () => {
  if (requiresCustomQuery.value) await useCustomQuery();
});

watch(
  () => uploadStatus.value,
  async () => {
    if (!requiresCustomQuery.value) return;
    if (uploadStatus.value === "uploading") queryLoaded.value = false;
    else if (uploadStatus.value === "upload-finished") await useCustomQuery();
  }
);

const useCustomQuery = async () => {
  const queryDocument = await loadDocument(props.customQuery);
  const filtersDocument = await loadDocument(props.customQueryFilters);
  setEntityType(props.types[0]);
  setQueryRelationType(props.customQueryRelationType);
  setIdentifiers(props.identifiers[0]);
  setSearchInputType(props.searchInputType);
  newQuery.value = {
    name: props.customQuery,
    document: queryDocument,
    filtersDocument: filtersDocument,
  };
  queryLoaded.value = true;
};

const updateRelationForm = (newTags: String[]) => {
  if (typeof newTags == "string") {
    return;
  }
  const InBulkProcessableItems: InBulkProcessableItem = newTags.map((str) => ({
    id: str,
  }));
  setRelationType(props.relationType);
  addRelations(InBulkProcessableItems);
};
</script>
