<template>
  <li data-cy="list-item" :class="wrapperClasses">
    <!-- no multiselect and no header row; the actions menu (connect /
         configure) floats in the top-right corner and the card itself does
         not navigate -->
    <div v-if="!isPreviewElement" class="absolute top-1 right-1">
      <BaseContextMenuActions
        :context-menu-actions="contextMenuActions"
        :parent-entity-id="formId"
        :entity-id="itemId"
        :entity-type="entityTypename"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
        @toggle-loading="toggleLoading"
      />
    </div>
    <div
      v-if="contractTeaserMetadata.length > 0"
      class="flex flex-wrap gap-1 pb-1 pr-6"
    >
      <span
        v-for="contractItem in contractTeaserMetadata"
        :key="contractItem.key"
        :data-cy="`pipeline-contract-${contractItem.key}`"
        class="rounded-full bg-tag-neutral px-2 py-0.5 text-sm w-fit"
      >
        {{ contractItem.label }}: {{ contractItem.value }}
      </span>
    </div>
    <div class="w-full flex flex-col gap-1">
      <div
        v-for="(metadataItem, idx) in visibleTeaserMetadata"
        :key="`${formId || idx}_${metadataItem?.key || idx}`"
        class="flex justify-start flex-col break-words w-full"
      >
        <MultilingualWrapper
          :metadata="metadataItem"
          :form-id="formId || 'listview'"
          :hide-selector="true"
        >
          <template #default="{ localizedMetadata }">
            <ReadOnlyMetadataWrapper
              :form-id="formId || 'listview'"
              :metadata="(localizedMetadata || metadataItem) as MetadataField"
              :is-edit="false"
              :linked-entity-id="intialValues?.id || itemId"
              :entity-type="entityTypename"
              :break-words="true"
            />
          </template>
        </MultilingualWrapper>
      </div>
    </div>
  </li>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import type {
  BaseRelationValuesInput,
  ContextMenuActions,
  Entitytyping,
  IntialValues,
  Metadata,
  MetadataField,
} from "@/generated-types/queries";
import BaseContextMenuActions from "@/components/BaseContextMenuActions.vue";
import MultilingualWrapper from "@/components/metadata/MultilingualWrapper.vue";
import ReadOnlyMetadataWrapper from "@/components/metadata/ReadOnlyMetadataWrapper.vue";
import useEntitySingle from "@/composables/useEntitySingle";
import { computed, inject, ref } from "vue";
import {
  DEFAULT_PIPELINE_VIEW_CONFIG,
  consumesKey,
  producesKey,
  type PipelineViewConfig,
} from "../composables/usePipelineViewConfig";

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context | undefined;
    contextMenuActions?: ContextMenuActions;
    itemId?: string;
    entityTypename?: Entitytyping;
    loading?: boolean;
    teaserMetadata?: Metadata[];
    intialValues?: IntialValues | undefined;
    relation:
      | { idx: number; relation: BaseRelationValuesInput }
      | "no-relation-found";
    isDisabled?: boolean;
    refetchEntities?: () => Promise<void>;
    viewConfig?: PipelineViewConfig;
  }>(),
  {
    contextMenuActions: undefined,
    itemId: "",
    entityTypename: undefined,
    loading: false,
    teaserMetadata: () => [],
    intialValues: undefined,
    isDisabled: false,
    relation: "no-relation-found",
    refetchEntities: undefined,
    viewConfig: () => DEFAULT_PIPELINE_VIEW_CONFIG,
  },
);

const { getEntityUuid } = useEntitySingle();
const formId = computed(() => getEntityUuid());
const isPreviewElement: boolean = inject("IsPreviewElement", false);
const actionLoading = ref<boolean>(false);
const loading = computed<boolean>(() => props.loading || actionLoading.value);
const toggleLoading = () => {
  actionLoading.value = !actionLoading.value;
};

const readModeTeaserMetadata = computed(() =>
  props.teaserMetadata.filter((metadata) => !metadata.showOnlyInEditMode),
);

// Pipeline cards rearrange the teaser metadata: the entity-type pill is
// dropped (in a pipeline everything is a component, so it says nothing) and
// the contract facts (Consumes / Produces) become the primary chip row —
// matching contracts is what makes two cards connectable. Which metadata
// keys carry those facts comes from the declared PipelineViewConfig.
const contractKeys = computed(() => [
  consumesKey(props.viewConfig),
  producesKey(props.viewConfig),
]);
const pillTeaserMetadata = computed(() =>
  readModeTeaserMetadata.value.find(
    (metadata: any) => metadata?.value?.formatter,
  ),
);
const contractTeaserMetadata = computed(() =>
  readModeTeaserMetadata.value.filter(
    (metadata: any) =>
      contractKeys.value.includes(metadata?.key) && metadata?.value,
  ),
);
const visibleTeaserMetadata = computed(() =>
  readModeTeaserMetadata.value.filter(
    (metadata: any) =>
      metadata !== pillTeaserMetadata.value &&
      // contract facts render as the chip row; anything else under the
      // contracts prefix (like the raw shape IRIs) is bookkeeping, and the
      // edges already draw what feeds what, so the wiring prefix stays off
      // the card too
      !String(metadata?.key ?? "").startsWith(
        `${props.viewConfig.contractsKey}.`,
      ) &&
      !String(metadata?.key ?? "").startsWith(
        `${props.viewConfig.connectionsKey}.`,
      ),
  ),
);

const wrapperClasses = computed(() => [
  // `relative` anchors the corner menu; the !z-0 keeps the card above its
  // canvas wrapper for hit-testing (the list-wide base style carries z-[-1])
  "relative !z-0 border rounded list-none p-3 flex flex-col w-[272px] !cursor-default",
  "bg-background-light border-accent-highlight",
  { "grayscale brightness-95": props.isDisabled },
  { "animate-pulse": loading.value },
]);
</script>
