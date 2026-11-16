<template>
  <li data-cy="table-row" :class="wrapperClasses">
    <div
      v-if="hasLeadingColumn"
      data-cy="table-row-leading"
      class="w-10 shrink-0 relative"
    >
      <span
        v-if="isNew"
        data-cy="new-indicator"
        :class="[
          'absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-normal',
          showsCheckbox ? '-left-1' : 'left-1/2 -translate-x-1/2',
        ]"
        :title="t('library.new')"
      />
      <BaseInputCheckbox
        v-if="showsCheckbox"
        :class="[{ invisible: isDisabled }, 'text-center']"
        v-model="isChecked"
        size="compact"
        :item="{
          id: itemId,
          teaserMetadata,
          intialValues,
          relationValues,
          type: itemType,
        }"
        :bulk-operations-context="bulkOperationsContext"
      />
    </div>

    <div
      v-if="hasThumbnail"
      class="w-10 h-10 shrink-0 flex items-center justify-center"
    >
      <ImageViewer
        v-if="canShowMedia && media && !imageSrcError"
        :key="`${itemId}-image`"
        class="object-cover self-center outline-none"
        height-class="h-10"
        width-class="w-10"
        :url="
          mediaIsLink
            ? media
            : `/api/iiif/3/${media}/square/^100,/0/default.jpg`
        "
        :mediaIsLink="mediaIsLink"
        @error="imageSrcError = true"
      />
      <div
        v-else-if="
          !canShowMedia || (media && imageSrcError) || (!media && isMediaType)
        "
        class="h-10 w-10 text-neutral-700 rounded-sm outline-none self-center"
      >
        <unicon
          :name="thumbIcon"
          class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none self-center"
        />
      </div>
    </div>

    <div
      class="table-cells flex-1 self-stretch grid grid-cols-(--table-columns) min-w-min bg-inherit"
    >
      <div
        v-for="(metadataItem, idx) in visibleMetadata"
        :key="`${itemId}_${metadataItem?.key || idx}`"
        :class="[
          tableColumnClass(idx, pinnedCount),
          { 'text-text-secondary': idx === 0 && isSeen },
        ]"
        :style="tableColumnStyle(idx, pinnedCount)"
      >
        <ReadOnlyMetadataWrapper
          :form-id="itemId || 'tableview'"
          :metadata="metadataItem as MetadataField"
          :is-edit="false"
          :linked-entity-id="itemId"
          :entity-type="entityTypename"
          :break-words="true"
          :hide-label="true"
        />
      </div>
    </div>

    <!-- small screen: no header to line up with, so no fixed column -->
    <div
      data-cy="table-row-actions"
      class="shrink-0 flex"
      :class="isCompact ? 'justify-end' : 'justify-center'"
      :style="isCompact ? undefined : { width: actionsColumnWidth }"
      @click.stop
    >
      <EntityButtons
        :buttons="buttons"
        :parent-entity-id="parentEntityId"
        :entity-id="itemId"
        :entity-type="entityTypename"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
        :intial-values="intialValues"
        :relation-values="relationValues"
        :context-label="rowTitle"
      />
    </div>

    <!-- small screen: Preview leads the ⋮ sheet instead -->
    <div
      v-if="!(isCompact && buttons?.contextMenu)"
      data-cy="table-row-preview"
      class="w-8 shrink-0 flex justify-center"
    >
      <PreviewToggle
        v-if="canPreview"
        :active="previewOpen"
        :data-preview-for="itemId"
        @toggle="emit('togglePreviewComponent', itemId)"
      />
    </div>
  </li>
</template>

<script lang="ts" setup>
import {
  BaseLibraryModes,
  type BaseRelationValuesInput,
  type Buttons,
  type Entitytyping,
  type IntialValues,
  ListItemCoverageTypes,
  type Metadata,
  type MetadataField,
} from "@/generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import PreviewToggle from "@/components/PreviewToggle.vue";
import EntityButtons from "@/components/EntityButtons.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import ReadOnlyMetadataWrapper from "@/components/metadata/ReadOnlyMetadataWrapper.vue";
import { hoveredListItem } from "@/composables/useListItemHelper";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useSeenState } from "@/composables/useSeenItems";
import { stringIsUrl } from "@/helpers";
import { auth } from "@/main";
import { computed, provide, ref } from "vue";
import { isCompact } from "@/composables/useNavMenu";
import {
  rowSheetKey,
  type RowSheet,
} from "@/components/context-menu-actions/rowSheet";
import { useI18n } from "vue-i18n";
import {
  tableColumnClass,
  tableColumnStyle,
} from "@/components/library/view-modes/tableColumns";

const props = withDefaults(
  defineProps<{
    itemId: string;
    itemType?: Entitytyping;
    entityTypename?: Entitytyping;
    teaserMetadata?: Metadata[];
    intialValues?: IntialValues;
    relationValues?: object;
    media?: string;
    thumbIcon?: string;
    isMediaType?: boolean;
    isDisabled?: boolean;
    buttons?: Buttons;
    actionsColumnWidth?: string;
    relation:
      | { idx: number; relation: BaseRelationValuesInput }
      | "no-relation-found";
    parentEntityId?: string;
    relationType?: string;
    bulkOperationsContext: Context | undefined;
    hasSelection: boolean;
    baseLibraryMode?: BaseLibraryModes;
    hasThumbnail: boolean;
    refetchEntities?: () => Promise<void>;
    previewComponentEnabled: boolean;
    // Row highlight: preview open, or last previewed (keepLastActiveItemHighlighted).
    previewComponentCurrentActive: boolean;
    // The eye's pressed state: this row's preview is open now.
    previewOpen?: boolean;
    previewComponentFeatureEnabled: boolean;
    previewComponentListItemsCoverage?: ListItemCoverageTypes;
    loading?: boolean;
    // Leading columns that stay put while a narrow table scrolls sideways.
    pinnedCount?: number;
  }>(),
  {
    previewOpen: false,
    itemType: undefined,
    entityTypename: undefined,
    teaserMetadata: () => [],
    intialValues: undefined,
    media: "",
    thumbIcon: "",
    isMediaType: false,
    isDisabled: false,
    buttons: undefined,
    actionsColumnWidth: "2rem",
    parentEntityId: undefined,
    relationType: undefined,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    refetchEntities: undefined,
    previewComponentListItemsCoverage: undefined,
    loading: false,
    pinnedCount: 0,
  },
);

const emit = defineEmits<{
  (event: "togglePreviewComponent", entityId: string): void;
}>();

const { t } = useI18n();

const isChecked = ref(false);
const imageSrcError = ref(false);

const canShowMedia = computed(() => {
  if (auth.isAuthenticated.value) return true;
  if (props.intialValues && (props.intialValues as any).length !== 0)
    return (props.intialValues as any).copyrightColor !== "red";
  return true;
});

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));

const visibleMetadata = computed(() =>
  (props.teaserMetadata ?? []).filter((m) => !m.showOnlyInEditMode),
);

// The first teaser value is what the row shows as its title.
const rowTitle = computed(() => {
  const value = props.teaserMetadata?.[0]?.value;
  return typeof value === "string" ? value : undefined;
});

const canPreview = computed<boolean>(
  () =>
    props.previewComponentFeatureEnabled &&
    (props.baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
      props.baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary),
);
provide(
  rowSheetKey,
  computed<RowSheet>(() => ({
    id: props.itemId,
    title: rowTitle.value,
    thumbnailUrl:
      props.media && !imageSrcError.value
        ? mediaIsLink.value
          ? props.media
          : `/api/iiif/3/${props.media}/square/^100,/0/default.jpg`
        : undefined,
    thumbnailIsLink: mediaIsLink.value,
    preview: canPreview.value
      ? () => emit("togglePreviewComponent", props.itemId)
      : undefined,
  })),
);

const isActiveListItem = computed<boolean>(() => {
  if (
    props.previewComponentListItemsCoverage ===
      ListItemCoverageTypes.AllListItems &&
    hoveredListItem.value === props.itemId
  )
    return true;
  if (
    props.previewComponentListItemsCoverage ===
      ListItemCoverageTypes.OneListItem &&
    props.previewComponentCurrentActive
  )
    return true;
  return false;
});

const { seenTracking } = useEntityPageConfig();
const { isSeen: isEntitySeen, isNew: isEntityNew } = useSeenState(seenTracking);

const showsCheckbox = computed<boolean>(
  () =>
    props.baseLibraryMode === BaseLibraryModes.NormalBaseLibrary &&
    props.hasSelection,
);

const hasLeadingColumn = computed<boolean>(
  () =>
    showsCheckbox.value || seenTracking.value?.display === "highlightNew",
);

const isSeen = computed<boolean>(() => isEntitySeen(props.itemId));
const isNew = computed<boolean>(() =>
  isEntityNew(props.itemId, props.intialValues as Record<string, unknown>),
);

const wrapperClasses = computed(() => [
  // entity-list-element.md: the checkbox owns the wash, the open preview owns
  // the left border; hover fills.
  "flex items-center gap-2 min-w-min p-(--list-row-pad) border-b border-border-faint text-table cursor-pointer list-none hover:bg-surface-row-hover",
  // elsewhere a narrow table scrolls sideways instead (ViewModesTable)
  { "table-row-compact": isCompact.value },
  isChecked.value ? "bg-accent-wash shadow-accent-row" : "bg-background-light",
  {
    "grayscale brightness-95 !cursor-default": props.isDisabled,
    "font-semibold": isNew.value,
    "animate-pulse": props.loading,
    "border-l-(length:--list-row-preview-border) border-l-accent":
      isActiveListItem.value,
  },
]);
</script>

<style scoped>
/* Phones: no header, no sideways scroll, so the last columns go */
.table-row-compact .table-cells {
  display: flex;
}
@container parent (max-width: 640px) {
  .table-row-compact .col-primary,
  .table-row-compact .col-secondary {
    flex: 1;
    width: auto;
    min-width: 0;
  }
  .table-row-compact .col-secondary:last-child {
    display: none;
  }
}
@container parent (max-width: 520px) {
  .table-row-compact .col-secondary:nth-last-child(-n + 2) {
    display: none;
  }
}
@container parent (max-width: 400px) {
  .table-row-compact .col-secondary {
    display: none;
  }
}
</style>
