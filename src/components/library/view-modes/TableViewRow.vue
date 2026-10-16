<template>
  <li data-cy="table-row" :class="wrapperClasses">
    <div class="w-10 shrink-0 relative">
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

    <div class="flex-1 flex items-center min-w-0">
      <div
        v-for="(metadataItem, idx) in visibleMetadata"
        :key="`${itemId}_${metadataItem?.key || idx}`"
        :class="[
          columnClass(idx),
          { 'text-text-secondary': idx === 0 && isSeen },
        ]"
        :style="
          props.colMinWidths?.[idx] ? { minWidth: props.colMinWidths[idx] } : {}
        "
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

    <div
      class="shrink-0 flex justify-center"
      :style="{ width: actionsColumnWidth }"
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

    <div class="w-8 shrink-0 flex justify-center">
      <PreviewToggle
        v-if="
          previewComponentFeatureEnabled &&
          (baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
            baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary)
        "
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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

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
    colMinWidths?: string[];
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
    colMinWidths: () => [],
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

const columnClass = (idx: number): string => {
  const base = "flex justify-start flex-col mx-2 break-words";
  const pos = idx === 0 ? "col-primary" : "col-secondary";
  if (visibleMetadata.value[0]?.value?.formatter) {
    if (idx === 0) return `${base} ${pos} flex-shrink-0 whitespace-nowrap`;
    return `${base} ${pos} flex-1 min-w-0`;
  }
  const count = visibleMetadata.value.length;
  const amount: string | number = count >= 4 ? "default" : count;
  const widths: Record<string | number, string> = {
    1: "w-full",
    2: "w-1/3",
    3: "w-1/2",
    default: "w-1/4",
  };
  return `${base} ${pos} ${widths[amount]}`;
};

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

const isSeen = computed<boolean>(() => isEntitySeen(props.itemId));
const isNew = computed<boolean>(() =>
  isEntityNew(props.itemId, props.intialValues as Record<string, unknown>),
);

const wrapperClasses = computed(() => [
  // entity-list-element.md: the checkbox owns the wash, the open preview owns
  // the left border; hover fills.
  "flex items-center gap-2 p-(--list-row-pad) border-b border-border-faint text-table cursor-pointer list-none hover:bg-surface-row-hover",
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
@container parent (max-width: 640px) {
  .col-primary,
  .col-secondary {
    flex: 1;
    width: auto;
    min-width: 0;
  }
  .col-secondary:last-child {
    display: none;
  }
}
@container parent (max-width: 520px) {
  .col-secondary:nth-last-child(-n + 2) {
    display: none;
  }
}
@container parent (max-width: 400px) {
  .col-secondary {
    display: none;
  }
}
</style>
