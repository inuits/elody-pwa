<template>
  <div>
    <entity-element-wrapper
      data-test="entity-element-wrapper"
      v-if="showElementList"
      :class="[
        {
          'mb-5':
            baseLibraryMode !== BaseLibraryModes.BasicBaseLibrary &&
            !isPreviewElement,
        },
        { 'pb-1': baseLibraryMode !== BaseLibraryModes.BasicBaseLibrary },
        { 'ml-2': baseLibraryMode === BaseLibraryModes.BasicBaseLibrary },
      ]"
      :entity-id="entityId"
      :label="label"
      :isCollapsed="isCollapsed"
      :base-library-mode="baseLibraryMode"
      :preview-label="previewLabel"
      @close-preview-component="emit('closePreviewComponent')"
      @toggle-element-collapse="(entityId, elementLabel) => emit('toggleElementCollapse', entityId, elementLabel)"
    >
      <template v-slot:content>
        <div
          v-if="!requiresCustomQuery || queryLoaded"
          :class="[
            {
              'mx-1 pb-2 bg-neutral-lightest':
                baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
                baseLibraryMode ===
                  BaseLibraryModes.BasicBaseLibraryWithBorder ||
                baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary,
            },
          ]"
        >
          <BaseLibrary
            v-if="type === MediaFileElementTypes.Media"
            class="flex-1"
            :bulk-operations-context="
              BulkOperationsContextEnum.EntityElementMedia
            "
            :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
            :predefined-entities="
              entityId ===
                mediafileSelectionState[customQueryFilters].selectedMediafile
                  ?.id ||
              entityId ===
                mediafileSelectionState[customQueryFilters].selectedMediafile
                  ?.uuid
                ? [
                    mediafileSelectionState[customQueryFilters]
                      .selectedMediafile,
                  ]
                : undefined
            "
            :enable-preview="true"
            :enable-advanced-filters="enableAdvancedFilters"
            :enable-bulk-operations="true"
            :enable-navigation="enableNavigation"
            :parent-entity-identifiers="
              entityId ===
                mediafileSelectionState[customQueryFilters].selectedMediafile
                  ?.id ||
              entityId ===
                mediafileSelectionState[customQueryFilters].selectedMediafile
                  ?.uuid
                ? undefined
                : identifiers
            "
            :parent-entity-type="entityType"
            :filter-type="Entitytyping.Mediafile"
            list-item-route-name="SingleEntity"
            :entity-type="Entitytyping.Mediafile"
            :relation-type="relationType"
            :use-other-query="newQuery"
            :base-library-mode="baseLibraryMode"
            :has-sticky-bars="false"
            :entity-list-elements="entityListElements"
            :allowed-actions-on-relations="allowedActionsOnRelations"
            :custom-bulk-operations="customBulkOperations"
            :custom-query-entity-picker-list="customQueryEntityPickerList"
            :custom-query-entity-picker-list-filters="
              customQueryEntityPickerListFilters
            "
            :id="id"
          />
          <BaseLibrary
            class="flex-1"
            v-else
            :bulk-operations-context="
              createCustomContext(
                BulkOperationsContextEnum.EntityElementList + relationType,
              )
            "
            :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
            :enable-advanced-filters="enableAdvancedFilters"
            :enable-bulk-operations="true"
            :enable-navigation="enableNavigation"
            :entity-type="types[0]"
            :parent-entity-identifiers="identifiers"
            :parent-entity-type="entityType"
            :filter-type="types[0]"
            list-item-route-name="SingleEntity"
            :relation-type="relationType"
            :has-sticky-bars="false"
            :use-other-query="newQuery"
            :base-library-mode="baseLibraryMode"
            :entity-list-elements="entityListElements"
            :allowed-actions-on-relations="allowedActionsOnRelations"
            :custom-bulk-operations="customBulkOperations"
            :custom-query-entity-picker-list="customQueryEntityPickerList"
            :custom-query-entity-picker-list-filters="
              customQueryEntityPickerListFilters
            "
            :fetch-deep-relations="fetchDeepRelations"
            :filters-need-context="filtersNeedContext"
            :id="id"
          />
        </div>
      </template>
    </entity-element-wrapper>
  </div>
</template>

<script lang="ts" setup>
import type {
  RelationActions,
  EntitySubelement,
} from "@/generated-types/queries";
import {
  SearchInputType,
  EntityListViewMode,
  type Entity,
  Entitytyping,
  MediaFileElementTypes,
  type EntityListElement,
  BaseLibraryModes,
  type FetchDeepRelations,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { watch, ref, onBeforeMount, computed, provide, inject } from "vue";
import { useImport } from "@/composables/useImport";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";
import useUpload, { UploadStatus } from "@/composables/useUpload";
import { usePermissions } from "@/composables/usePermissions";

const { createCustomContext } = useBulkOperations();
const { loadDocument } = useImport();
const { mediafileSelectionState } = useEntityMediafileSelector();
const { uploadStatus } = useUpload();
const {
  setIdentifiers,
  setQueryRelationType,
  setSearchInputType,
  setEntityType,
} = useQueryVariablesFactory();
const { fetchAdvancedPermission } = usePermissions();

const props = withDefaults(
  defineProps<{
    isCollapsed: Boolean;
    enableAdvancedFilters: Boolean;
    types: string[];
    label: string;
    type?: MediaFileElementTypes;
    customQuery: string;
    customQueryRelationType: string;
    customBulkOperations?: string | undefined;
    customQueryFilters: string;
    customQueryEntityPickerList?: string;
    customQueryEntityPickerListFilters?: string;
    searchInputType: string;
    entityList: Entity[];
    identifiers: string[];
    relationType: string;
    viewMode?: EntityListViewMode;
    enableNavigation?: boolean;
    baseLibraryMode?: BaseLibraryModes;
    entityId: string;
    entityListElements?: EntityListElement[];
    allowedActionsOnRelations?: RelationActions[];
    fetchDeepRelations?: FetchDeepRelations;
    entityType: Entitytyping;
    can?: string[];
    filtersNeedContext?: EntitySubelement[];
    id: string;
    previewLabel?: string;
  }>(),
  {
    enableAdvancedFilters: false,
    types: () => [],
    customBulkOperations: undefined,
    viewMode: EntityListViewMode.Library,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    entityListElements: undefined,
    allowedActionsOnRelations: () => [],
    filtersNeedContext: undefined,
    previewLabel: undefined,
  },
);

const emit = defineEmits<{
  (event: "closePreviewComponent"): void;
  (event: "toggleElementCollapse", entityId: string, elementLabel: string): void;
}>();

provide("mediafileViewerContext", props.customQueryFilters);
const isPreviewElement: boolean = inject("IsPreviewElement", false);

const requiresCustomQuery = computed(() => props.customQuery != undefined);
const queryLoaded = ref<boolean>(false);
const newQuery = ref<object>(undefined);
const showElementList = ref<boolean>(false);

onBeforeMount(async () => {
  if (requiresCustomQuery.value) await useCustomQuery();
  await checkElementListPermission();
});

watch(
  () => uploadStatus.value,
  async () => {
    if (!requiresCustomQuery.value) return;
    if (uploadStatus.value === UploadStatus.Uploading)
      queryLoaded.value = false;
    else if (uploadStatus.value === UploadStatus.Finished)
      await useCustomQuery();
  },
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

const checkElementListPermission = async () => {
  if (!props.can) {
    showElementList.value = true;
    return;
  }

  const isPermitted: boolean = await fetchAdvancedPermission(props.can);
  showElementList.value = isPermitted;
};
</script>
