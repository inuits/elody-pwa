<template>
  <!-- the pipeline card is its own component; ListItem stays the single
       entry point for every view mode but owns only list and grid -->
  <PipelineListItemCard
    v-if="isPipelineMode"
    :bulk-operations-context="bulkOperationsContext"
    :context-menu-actions="buttons?.contextMenu ?? undefined"
    :item-id="itemId"
    :entity-typename="entityTypename"
    :loading="loading"
    :teaser-metadata="teaserMetadata"
    :intial-values="intialValues"
    :relation="relation"
    :is-disabled="isDisabled"
    :refetch-entities="refetchEntities"
  />
  <li v-else data-cy="list-item" :class="wrapperClasses">
    <div
      v-if="isGridMode && !isPreviewElement"
      class="flex justify-between items-center pb-2"
    >
      <BaseInputCheckbox
        v-if="
          baseLibraryMode === BaseLibraryModes.NormalBaseLibrary &&
          !isPreview &&
          hasSelection &&
          isGridMode
        "
        :class="[{ invisible: isDisabled }, 'text-center']"
        v-model="isChecked"
        :item="{ id: itemId, teaserMetadata, intialValues, type: itemType }"
        :bulk-operations-context="bulkOperationsContext"
      />
      <EntityButtons
        :buttons="buttons"
        :parent-entity-id="formId"
        :entity-id="itemId"
        :entity-type="entityTypename"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :intial-values="intialValues"
        :relation-values="relationValues"
        :context-label="rowTitle"
        @toggle-loading="toggleLoading"
      />
    </div>
    <div
      :class="[
        'flex items-center rounded-2xl p-2 bg-accent-wash',
        { 'mb-4': isGridMode },
      ]"
      v-show="useEditHelper.isEdit"
      v-if="onlyEditableTeaserMetadata.length > 0"
    >
      <div v-if="!loading" class="w-16 pr-2">
        <div
          v-for="metadataItem in onlyEditableTeaserMetadata"
          :key="`${formId}_${metadataItem.key || 'no-key'}`"
          class="w-1/1"
        >
          <MultilingualWrapper
            :metadata="metadataItem"
            :form-id="formId"
            :hide-selector="true"
          >
            <template #default="{ localizedMetadata }">
              <metadata-wrapper
                ref="orderMetadataChild"
                :form-id="formId"
                :metadata="(localizedMetadata || metadataItem) as MetadataField"
                :is-edit="useEditHelper.isEdit"
                :linked-entity-id="intialValues?.id || itemId"
                :relation-type="relationTypeOfListing"
                :should-hide="true"
                :entity-type="entityTypename"
              />
            </template>
          </MultilingualWrapper>
        </div>
      </div>
    </div>

    <span
      v-if="isNew"
      data-cy="new-indicator"
      class="w-2 h-2 ml-2 shrink-0 rounded-full bg-accent-normal"
      :title="t('library.new')"
    />
    <div>
      <BaseInputCheckbox
        v-if="
          baseLibraryMode === BaseLibraryModes.NormalBaseLibrary &&
          !isPreview &&
          hasSelection &&
          isListMode
        "
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
      v-if="canShowCopyRight() && media && !imageSrcError"
      :class="[
        'flex items-center',
        { 'justify-center mb-4 h-[50%]': isGridMode },
      ]"
    >
      <ImageViewer
        v-if="canShowCopyRight() && media && !imageSrcError"
        :key="`${itemId}-image-${imageSize}`"
        class="object-cover self-center outline-none"
        :height-class="isListMode ? 'h-10' : '!h-48'"
        :width-class="isListMode ? 'w-10' : '!w-48'"
        :url="
          mediaIsLink
            ? media
            : `/api/iiif/3/${media}/square/^${imageSize},/0/default.jpg`
        "
        :mediaIsLink="mediaIsLink"
        @error="setNoImage()"
      />
    </div>
    <div
      v-if="
        !canShowCopyRight() ||
        (media && imageSrcError) ||
        (!media && isMediaType)
      "
      :key="`${itemId}-icon-${imageSize}`"
      :class="[
        { 'h-10 w-10': isListMode },
        {
          'h-48 w-48 flex flex-col justify-center items-center shadow-sm mb-4':
            isGridMode,
        },
        'text-neutral-700 rounded-sm outline-none self-center',
      ]"
    >
      <unicon
        :name="thumbIcon"
        class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none self-center"
      />
      <div v-if="isGridMode" class="text-neutral-70">No media</div>
    </div>

    <div
      data-cy="list-item-content"
      :class="[
        isListMode
          ? 'flex-1 basis-(--list-row-content-min) min-w-0'
          : 'w-full',
        { 'flex items-center': isListMode && !props.multiLine },
        { 'grid gap-x-4 gap-y-3 items-start': isListMode && props.multiLine },
        { 'p-4': isGridMode },
      ]"
      :style="multiLineGridStyle"
    >
      <div
        v-for="(metadataItem, idx) in onlyReadModeTeaserMetadata"
        :key="`${formId || idx}_${metadataItem?.key || idx}`"
        :class="[
          teaserMetadataStyle,
          idx < 1 && teaserMetadata[0]?.value?.formatter
            ? 'w-fit whitespace-nowrap mr-4' // keep first and second element tight at the start when first element is a label pill
            : props.multiLine
              ? ''
              : 'w-full', // all others stay full width unless multiLine grid handles sizing
        ]"
        :style="
          metadataItem.colSpan && props.multiLine
            ? { gridColumn: `span ${metadataItem.colSpan}` }
            : {}
        "
      >
        <MultilingualWrapper
          :metadata="metadataItem"
          :form-id="formId || 'listview'"
          :hide-selector="true"
        >
          <template #default="{ localizedMetadata }">
            <!-- A field with an input is a value on the relation to the
                 page's entity (a contact person's role): editable in place. -->
            <ListItemInlineField
              v-if="!useEditHelper.isEdit && metadataItem?.inputField"
              :metadata="(localizedMetadata || metadataItem) as Metadata"
              :parent-entity-id="formId"
              :linked-entity-id="intialValues?.id || itemId"
              :linked-entity-relations="relationValues"
              :refetch-entities="refetchEntities"
            >
              <ReadOnlyMetadataWrapper
                :form-id="formId || 'listview'"
                :metadata="(localizedMetadata || metadataItem) as MetadataField"
                :is-edit="false"
                :linked-entity-id="intialValues?.id || itemId"
                :entity-type="entityTypename"
                :highlight="
                  (isPrimaryMediafile &&
                    metadataItem?.highlightIfPrimaryMediafile) ||
                  (isPrimaryThumbnail &&
                    metadataItem?.highlightIfPrimaryThumbnail)
                "
                :break-words="true"
              />
            </ListItemInlineField>
            <ReadOnlyMetadataWrapper
              v-else-if="!useEditHelper.isEdit || !metadataItem?.inputField"
              :form-id="formId || 'listview'"
              :metadata="(localizedMetadata || metadataItem) as MetadataField"
              :is-edit="useEditHelper.isEdit"
              :linked-entity-id="intialValues?.id || itemId"
              :entity-type="entityTypename"
              :highlight="
                (isPrimaryMediafile &&
                  metadataItem?.highlightIfPrimaryMediafile) ||
                (isPrimaryThumbnail &&
                  metadataItem?.highlightIfPrimaryThumbnail)
              "
              :break-words="true"
            />
            <metadata-wrapper
              v-else
              :form-id="formId"
              :metadata="(localizedMetadata || metadataItem) as MetadataField"
              :is-edit="useEditHelper.isEdit"
              :linked-entity-id="intialValues?.id || itemId"
              :relation-type="relationTypeOfListing"
              :entity-type="entityTypename"
              :list-item-entity="listItemEntity"
              :show-errors="useEditHelper.showErrors"
              @add-refetch-function-to-edit-state="
                () => emit('addRefetchFunctionToEditState')
              "
              :break-words="true"
            />
          </template>
        </MultilingualWrapper>
      </div>
    </div>

    <div v-if="false" :class="[{ 'flex justify-end': isGridMode }]" @click.stop>
      <BaseToggle
        v-model="isMarkedAsToBeDeleted"
        :icon-on="DamsIcons.CrossCircle"
        :icon-off="DamsIcons.Trash"
        :icon-height="22"
      />
    </div>

    <div v-if="isListMode" data-cy="list-item-actions" class="flex ml-auto">
      <EntityButtons
        :buttons="buttons"
        :parent-entity-id="formId"
        :entity-id="itemId"
        :entity-type="entityTypename"
        :relation="relation"
        :bulk-operations-context="bulkOperationsContext"
        :refetch-entities="refetchEntities"
        :intial-values="intialValues"
        :relation-values="relationValues"
        :context-label="rowTitle"
        @toggle-loading="toggleLoading"
      />
    </div>
    <button
      v-if="previewComponentEnabled && isEnableNavigation"
      type="button"
      data-cy="list-item-open"
      class="flex flex-row cursor-pointer"
      :aria-label="t('actions.labels.open-item', { item: rowTitle ?? itemId })"
      @click="() => emit('navigateTo')"
    >
      <slot>
        <unicon
          :name="Unicons.AngleRight.name"
          class="h-5.5 w-5.5 text-text-body"
        />
      </slot>
    </button>
    <PreviewToggle
      v-else-if="
        previewComponentFeatureEnabled &&
        (baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
          baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary)
      "
      :active="previewComponentCurrentActive"
      @toggle="emit('togglePreviewComponent', itemId)"
    />
  </li>
  <template v-if="entityListElements">
    <div
      v-for="(entityListElement, idx) in entityListElements"
      :key="'window_panel_' + idx"
    >
      <entity-element-window-panel
        :form-id="itemId"
        :identifiers="[itemId]"
        :is-edit="false"
        :parent-is-list-item="true"
        :panel="createWindowPanelsFromEntityListElements(entityListElement)"
      />
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import {
  BaseLibraryModes,
  type BaseRelationValuesInput,
  type Buttons,
  DamsIcons,
  type BaseEntity,
  type EntityListElement,
  type Entitytyping,
  type IntialValues,
  ListItemCoverageTypes,
  type Metadata,
  type MetadataField,
  type WindowElementPanel,
} from "@/generated-types/queries";
import { stringIsUrl, asString } from "@/helpers";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import EntityElementWindowPanel from "@/components/windowPanel/EntityElementWindowPanel.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import MultilingualWrapper from "@/components/metadata/MultilingualWrapper.vue";
import { useEditMode } from "@/composables/useEdit";
import useEntitySingle from "@/composables/useEntitySingle";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useSeenState } from "@/composables/useSeenItems";
import { computed, inject, onUpdated, ref, watch } from "vue";
import { Unicons } from "@/types";
import { auth, router } from "@/main";
import PreviewToggle from "@/components/PreviewToggle.vue";
import EntityButtons from "./EntityButtons.vue";
import { hoveredListItem } from "@/composables/useListItemHelper";
import { useI18n } from "vue-i18n";
import ReadOnlyMetadataWrapper from "./metadata/ReadOnlyMetadataWrapper.vue";
import ListItemInlineField from "@/components/ListItemInlineField.vue";
import PipelineListItemCard from "@/components/library/view-modes/pipeline/PipelineListItemCard.vue";

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context | undefined;
    buttons?: Buttons;
    listItemEntity?: BaseEntity;
    itemId?: string;
    itemType?: Entitytyping;
    entityTypename?: Entitytyping;
    loading?: boolean;
    teaserMetadata?: Metadata[];
    intialValues?: IntialValues | undefined;
    relationValues?: object;
    media?: string;
    thumbIcon?: string;
    small?: boolean;
    isPreview?: boolean;
    isMarkableAsToBeDeleted?: boolean;
    relation:
      | { idx: number; relation: BaseRelationValuesInput }
      | "no-relation-found";
    relationType?: string | undefined;
    isDisabled?: boolean;
    hasSelection: boolean;
    baseLibraryMode?: BaseLibraryModes;
    isMediaType?: boolean;
    isEnableNavigation?: boolean;
    entityListElements?: EntityListElement[];
    viewMode?: "list" | "grid" | "pipeline";
    refetchEntities?: () => Promise<void>;
    previewComponentEnabled: boolean;
    previewComponentCurrentActive: boolean;
    previewComponentFeatureEnabled: boolean;
    previewComponentListItemsCoverage?: ListItemCoverageTypes | undefined;
    isPrimaryMediafile?: boolean;
    isPrimaryThumbnail?: boolean;
    multiLine?: boolean;
    multiLineColumns?: number;
  }>(),
  {
    buttons: undefined,
    itemId: "",
    itemType: undefined,
    entityTypename: undefined,
    loading: false,
    teaserMetadata: () => [],
    intialValues: undefined,
    media: "",
    thumbIcon: "",
    small: false,
    isPreview: false,
    isMarkableAsToBeDeleted: false,
    isDisabled: false,
    hasSelection: true,
    relation: "no-relation-found",
    relationType: "no-relation-found",
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    isMediaType: false,
    isEnableNavigation: false,
    entityListElements: undefined,
    viewMode: "list",
    refetchEntities: undefined,
    previewComponentListItemsCoverage: undefined,
    isPrimaryMediafile: false,
    isPrimaryThumbnail: false,
    multiLine: false,
    multiLineColumns: 5,
  },
);

const emit = defineEmits<{
  (event: "navigateTo"): void;
  (event: "togglePreviewComponent", previewForEntityId: string): void;
  (event: "addRefetchFunctionToEditState"): void;
}>();

const { t } = useI18n();

const { getEntityUuid } = useEntitySingle();

const { seenTracking } = useEntityPageConfig();
const { isSeen: isEntitySeen, isNew: isEntityNew } = useSeenState(seenTracking);

const isPreviewElement: boolean = inject("IsPreviewElement", false);
const actionLoading = ref<boolean>(false);
const loading = computed<boolean>(() => props.loading || actionLoading.value);
const isMarkedAsToBeDeleted = ref<boolean>(false);
const isChecked = ref<boolean>(false);
const imageSrcError = ref<boolean>(false);
const formId = computed(() => getEntityUuid());
const relationTypeOfListing = computed(() =>
  props.relationType === "no-relation-found" ? undefined : props.relationType,
);
const useEditHelper = useEditMode(
  getEntityUuid() || asString(router.currentRoute.value.params.id),
);

const isSeen = computed<boolean>(() => isEntitySeen(props.itemId));
const isNew = computed<boolean>(() =>
  isEntityNew(props.itemId, props.intialValues as Record<string, unknown>),
);

const imageSize = computed(() => (isGridMode.value ? 500 : 100));
const multiLineGridStyle = computed(() =>
  props.multiLine
    ? {
        gridTemplateColumns: `repeat(${props.multiLineColumns}, minmax(0, 1fr))`,
      }
    : {},
);
const teaserMetadataStyle = computed<string>(() => {
  if (isGridMode.value) return "w-full";
  if (props.multiLine) return "flex justify-start flex-col break-words";

  const amountOfTeaserMetadataItems: string | number =
    props.teaserMetadata.length >= 4 ? "default" : props.teaserMetadata.length;

  const baseListViewModeStyles: string =
    "flex justify-start flex-col mx-2 break-words";

  const listStylesBasedOnAmount = {
    1: "w-full",
    2: "w-1/3",
    3: "w-1/2",
    default: "w-1/4",
  };

  return baseListViewModeStyles.concat(
    " ",
    listStylesBasedOnAmount[amountOfTeaserMetadataItems],
  );
});
// The first teaser value is what the row shows as its title.
const rowTitle = computed(() => {
  const value = props.teaserMetadata[0]?.value;
  return typeof value === "string" ? value : undefined;
});

const onlyReadModeTeaserMetadata = computed(() =>
  props.teaserMetadata.filter((metadata) => !metadata.showOnlyInEditMode),
);

const orderMetadataChild = ref(null);
onUpdated(() => {
  if (!orderMetadataChild.value) return;
  orderMetadataChild.value[0]?.setNewValue(props.intialValues?.order);
});

const toggleLoading = () => {
  actionLoading.value = !actionLoading.value;
};

const setNoImage = (value: boolean = true) => {
  imageSrcError.value = value;
};

const canShowCopyRight = () => {
  if (auth.isAuthenticated.value === true) return true;
  if (props.intialValues && props.intialValues.length !== 0)
    return props.intialValues.copyrightColor !== "red";
  return true;
};

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));
const onlyEditableTeaserMetadata = computed(() =>
  props.teaserMetadata?.filter((metadata) => metadata?.showOnlyInEditMode),
);

const isGridMode = computed(() => props.viewMode === "grid");
const isListMode = computed(() => props.viewMode === "list");
const isPipelineMode = computed(() => props.viewMode === "pipeline");

const wrapperClasses = computed(() => {
  return [
    "border rounded cursor-pointer list-none z-[-1]",
    {
      // Wraps the actions below the text when the row is too narrow (a list
      // beside an open preview); wide rows stay on one line.
      "flex flex-wrap items-center gap-2 p-1.5 mb-2": isListMode.value,
    },
    {
      "p-1.5 mb-2 flex flex-col w-[300px] min-h-[350px]": isGridMode.value,
    },
    {
      "border-dashed border-2 !border-accent-normal":
        props.isPreview || isMarkedAsToBeDeleted.value,
    },
    { "!border-status-new": props.isPreview },
    { "!border-status-deleted": isMarkedAsToBeDeleted.value },
    {
      "grayscale brightness-95 !cursor-default":
        props.isDisabled || isSeen.value,
    },
    { "font-semibold": isNew.value },
    { "animate-pulse": loading.value },
    { "bg-background-light": !isActiveListItem.value },
    { "border-border-subtle": !isActiveListItem.value },
    {
      "border-4 border-neutral-800 bg-accent-light/30": isActiveListItem.value,
    },
  ];
});

const isActiveListItem = computed<boolean>(() => {
  if (
    props.previewComponentListItemsCoverage ===
      ListItemCoverageTypes.AllListItems &&
    hoveredListItem.value === props.itemId!
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

watch(
  () => useEditHelper.isEdit,
  (isEdit: boolean) => (!isEdit ? (isMarkedAsToBeDeleted.value = false) : ""),
);

watch(
  () => props.viewMode,
  () => {
    setNoImage(false);
  },
);

const createWindowPanelsFromEntityListElements = (
  entityListElement: EntityListElement,
) => {
  const panel: WindowElementPanel = {
    label: entityListElement.label,
    isEditable: false,
    isCollapsed: false,
    entityListElement,
  };
  return panel;
};
</script>
