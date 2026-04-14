<template>
  <li data-cy="table-row" :class="wrapperClasses">
    <div class="w-10 shrink-0">
      <BaseInputCheckbox
        v-if="
          baseLibraryMode === BaseLibraryModes.NormalBaseLibrary && hasSelection
        "
        :class="[{ invisible: isDisabled }, 'text-center']"
        v-model="isChecked"
        :item="{ id: itemId, teaserMetadata, relationValues, type: itemType }"
        :bulk-operations-context="bulkOperationsContext"
        input-style="accentNormal"
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
        :class="columnStyle"
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

    <div class="w-8 shrink-0 flex justify-center" @click.stop>
      <BaseContextMenuActions
        :context-menu-actions="contextMenuActions"
        :parent-entity-id="parentEntityId"
        :entity-id="itemId"
        :entity-type="entityTypename"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
      />
    </div>

    <div
      class="w-8 shrink-0 flex justify-center"
      @click.stop.prevent="emit('togglePreviewComponent', itemId)"
    >
      <base-tooltip
        v-if="
          baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
          baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary
        "
        position="top-right"
        :tooltip-offset="8"
      >
        <template #activator="{ on }">
          <div v-on="on" class="flex">
            <unicon
              v-if="previewComponentFeatureEnabled"
              :name="Unicons.Eye.name"
              class="h-5.5 w-5.5 text-text-body mx-1"
              :class="{
                '!text-accent-accent fill-current':
                  previewComponentCurrentActive,
              }"
            />
          </div>
        </template>
        <template #default>
          <span class="text-sm text-text-placeholder">
            {{
              previewComponentCurrentActive
                ? t("preview-component.close")
                : t("preview-component.open")
            }}
          </span>
        </template>
      </base-tooltip>
    </div>
  </li>
</template>

<script lang="ts" setup>
import {
  BaseLibraryModes,
  type BaseRelationValuesInput,
  type ContextMenuActions,
  type Entitytyping,
  type IntialValues,
  ListItemCoverageTypes,
  type Metadata,
  type MetadataField,
} from "@/generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseContextMenuActions from "@/components/BaseContextMenuActions.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import ReadOnlyMetadataWrapper from "@/components/metadata/ReadOnlyMetadataWrapper.vue";
import { hoveredListItem } from "@/composables/useListItemHelper";
import { stringIsUrl } from "@/helpers";
import { auth } from "@/main";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";

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
    contextMenuActions?: ContextMenuActions;
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
    previewComponentCurrentActive: boolean;
    previewComponentFeatureEnabled: boolean;
    previewComponentListItemsCoverage?: ListItemCoverageTypes;
    loading?: boolean;
  }>(),
  {
    itemType: undefined,
    entityTypename: undefined,
    teaserMetadata: () => [],
    intialValues: undefined,
    media: "",
    thumbIcon: "",
    isMediaType: false,
    isDisabled: false,
    contextMenuActions: undefined,
    parentEntityId: undefined,
    relationType: undefined,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    refetchEntities: undefined,
    previewComponentListItemsCoverage: undefined,
    loading: false,
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

const columnStyle = computed<string>(() => {
  const count = visibleMetadata.value.length;
  const amount: string | number = count >= 4 ? "default" : count;
  const widths: Record<string | number, string> = {
    1: "w-full",
    2: "w-1/3",
    3: "w-1/2",
    default: "w-1/4",
  };
  return `flex justify-start flex-col mx-2 break-words ${widths[amount]}`;
});

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

const wrapperClasses = computed(() => [
  "flex items-center gap-2 p-1.5 border rounded bg-background-light border-accent-highlight cursor-pointer list-none mt-1",
  {
    "grayscale brightness-95 !cursor-default": props.isDisabled,
    "animate-pulse": props.loading,
    "bg-background-light": !isActiveListItem.value,
    "border-4 border-neutral-800 bg-accent-light/30": isActiveListItem.value,
  },
]);
</script>
