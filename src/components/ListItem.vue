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
            :form-id="`${intialValues?.id || itemId}_listitem`"
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
      v-if="isGridMode"
      data-cy="grid-card-media"
      class="relative flex items-center justify-center w-full aspect-square min-h-0 shrink-0 overflow-hidden bg-surface-muted"
    >
      <ImageViewer
        v-if="canShowCopyRight() && media && !imageSrcError"
        :key="`${itemId}-image-${imageSize}`"
        class="absolute inset-0"
        height-class="h-full"
        width-class="w-full object-cover"
        :alt="rowTitle"
        :url="
          mediaIsLink
            ? media
            : `/api/iiif/3/${media}/full/^${imageSize},/0/default.jpg`
        "
        :mediaIsLink="mediaIsLink"
        @error="setNoImage()"
      />
      <unicon
        v-else
        :name="thumbIcon || Unicons.NoImage.name"
        class="size-10 text-text-subtle"
        aria-hidden="true"
      />
      <BaseInputCheckbox
        v-if="
          !isPreviewElement &&
          baseLibraryMode === BaseLibraryModes.NormalBaseLibrary &&
          !isPreview &&
          hasSelection
        "
        :class="[
          { invisible: isDisabled },
          'absolute top-(--grid-card-check-inset) left-(--grid-card-check-inset) p-(--grid-card-check-pad) rounded-input bg-surface border border-border-subtle',
        ]"
        v-model="isChecked"
        size="compact"
        :aria-label="te('bulk-operations.select') ? t('bulk-operations.select') : 'Select'"
        :item="{ id: itemId, teaserMetadata, intialValues, type: itemType }"
        :bulk-operations-context="bulkOperationsContext"
        @click.stop
      />
    </div>
    <div
      v-if="isListMode && canShowCopyRight() && media && !imageSrcError"
      class="flex items-center"
    >
      <ImageViewer
        :key="`${itemId}-image-${imageSize}`"
        class="object-cover self-center outline-none"
        height-class="h-10"
        width-class="w-10"
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
        isListMode &&
        (!canShowCopyRight() ||
          (media && imageSrcError) ||
          (!media && isMediaType))
      "
      :key="`${itemId}-icon-${imageSize}`"
      class="h-10 w-10 text-neutral-700 rounded-sm outline-none self-center"
    >
      <unicon
        :name="thumbIcon"
        class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none self-center"
      />
    </div>

    <div
      data-cy="list-item-content"
      :class="[
        isListMode
          ? 'flex-1 basis-(--list-row-content-min) min-w-0'
          : 'w-full',
        { 'flex items-center': isListMode && !props.multiLine },
        { 'grid gap-x-4 gap-y-3 items-start': isListMode && props.multiLine },
        {
          'grid grid-cols-[minmax(0,1fr)_auto] content-start gap-x-(--grid-card-title-action-gap) gap-y-(--grid-card-meta-row-gap) flex-1 p-(--grid-card-body-pad) text-value':
            isGridMode,
        },
        { '[&_[data-cy=metadata-label]]:sr-only': hideLabels },
      ]"
      :style="multiLineGridStyle"
    >
      <component
        v-for="(metadataItem, idx) in onlyReadModeTeaserMetadata"
        :key="`${formId || idx}_${metadataItem?.key || idx}`"
        :is="isGridTitleLink(idx) ? RouterLink : 'div'"
        :to="isGridTitleLink(idx) ? titleLink : undefined"
        :data-cy="isGridTitleLink(idx) ? 'grid-card-title-link' : undefined"
        :title="isGridMode && idx === 0 ? rowTitle : undefined"
        :class="[
          teaserMetadataStyle,
          { 'text-text-secondary': idx === 0 && isSeen },
          // Grid card body: a 2-line title link, then each label above its value.
          isGridMode
            ? idx === 0
              ? 'col-start-1 row-start-1 mb-(--grid-card-title-gap) min-h-(--grid-card-title-min-height) line-clamp-2 font-bold text-heading text-text-link hover:text-text-link-hover hover:no-underline [&_.line-clamp]:[--line-clamp:2]! [&_[data-cy=entity-element-metadata]]:text-inherit [&_[data-cy=metadata-label]]:sr-only'
              : [
                  'col-span-2 flex flex-col min-w-0 whitespace-nowrap [&>[data-cy=metadata-wrapper]]:flex [&>[data-cy=metadata-wrapper]]:flex-col [&>[data-cy=metadata-wrapper]]:gap-(--grid-card-meta-label-gap) [&_[data-cy=metadata-label]]:truncate',
                  { hidden: compact },
                ]
            : '',
          // List row (ui_kits/clients): bold title in link ink, the rest secondary.
          isListMode
            ? idx === 0 && !teaserMetadata[0]?.value?.formatter
              ? [
                  'font-bold text-value [&_[data-cy=entity-element-metadata]]:text-inherit',
                  { 'text-text-link': !isSeen },
                ]
              : 'text-text-secondary'
            : '',
          { [TITLE_UNDERLINE]: isUnderlinedTitle(idx) },
          isGridMode
            ? ''
            : idx < 1 && teaserMetadata[0]?.value?.formatter
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
        <!-- under the column header a badge cell is as narrow as its badge;
             an invisible copy of the label keeps the header label whole -->
        <span
          v-if="isListMode && hideLabels && idx < 1 && teaserMetadata[0]?.value?.formatter && metadataItem?.label"
          data-cy="list-cell-label-sizer"
          aria-hidden="true"
          class="block h-0 overflow-hidden text-label font-bold"
          >{{ t(metadataItem.label) }}</span
        >
        <!-- own key per row: the page form's locale must not leak in, and the edit modal reads translations stored under the entity id on save -->
        <MultilingualWrapper
          :metadata="metadataItem"
          :form-id="`${intialValues?.id || itemId || 'listview'}_listitem`"
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
              :listing-relation-type="relationTypeOfListing"
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
            <ListItemEditableValue
              v-else-if="
                !useEditHelper.isEdit &&
                metadataItem?.editFormQuery &&
                !metadataItem?.readOnly &&
                (intialValues?.id || itemId)
              "
              :edit-form-query="metadataItem.editFormQuery"
              :metadata="(localizedMetadata || metadataItem) as Metadata"
              :entity-id="intialValues?.id || itemId"
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
            </ListItemEditableValue>
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
      </component>
      <div
        v-if="isGridMode"
        data-cy="grid-card-actions"
        class="col-start-2 row-start-1 self-start flex items-center"
      >
        <PreviewToggle
          v-if="canPreview && !(isCompact && buttons?.contextMenu)"
          :active="previewOpen"
          :data-preview-for="itemId"
          @toggle="emit('togglePreviewComponent', itemId)"
        />
        <EntityButtons
          v-if="!isPreviewElement"
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
    </div>

    <div v-if="false" :class="[{ 'flex justify-end': isGridMode }]" @click.stop>
      <BaseToggle
        v-model="isMarkedAsToBeDeleted"
        :icon-on="DamsIcons.CrossCircle"
        :icon-off="DamsIcons.Trash"
        :icon-height="22"
      />
    </div>

    <span
      v-if="highlightLabel"
      data-cy="list-item-highlight"
      class="shrink-0 whitespace-nowrap text-chip font-bold p-(--chip-padding) rounded-chip bg-accent-wash text-text-body"
    >
      {{ highlightLabel }}
    </span>
    <!-- eye then ⋮, one group: on a narrow row they wrap together -->
    <div
      v-if="isListMode"
      data-cy="list-item-actions"
      class="flex items-center shrink-0 ml-auto"
    >
      <!-- small screen: Preview leads the ⋮ sheet instead -->
      <PreviewToggle
        v-if="canPreview && !(isCompact && buttons?.contextMenu)"
        :active="previewOpen"
        :data-preview-for="itemId"
        @toggle="emit('togglePreviewComponent', itemId)"
      />
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
    <!-- small screen: Preview leads the ⋮ sheet instead -->
    <PreviewToggle
      v-else-if="!isGridMode && canPreview && !(isCompact && buttons?.contextMenu)"
      :active="previewOpen"
      :data-preview-for="itemId"
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
import { Unicons } from "@/types";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import EntityElementWindowPanel from "@/components/windowPanel/EntityElementWindowPanel.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import MultilingualWrapper from "@/components/metadata/MultilingualWrapper.vue";
import { useEditMode } from "@/composables/useEdit";
import ListItemEditableValue from "@/components/ListItemEditableValue.vue";
import useEntitySingle from "@/composables/useEntitySingle";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useSeenState } from "@/composables/useSeenItems";
import { computed, inject, onUpdated, provide, ref, watch } from "vue";
import { isCompact } from "@/composables/useNavMenu";
import {
  rowSheetKey,
  type RowSheet,
} from "@/components/context-menu-actions/rowSheet";
import { auth, router } from "@/main";
import PreviewToggle from "@/components/PreviewToggle.vue";
import EntityButtons from "./EntityButtons.vue";
import { hoveredListItem } from "@/composables/useListItemHelper";
import { useI18n } from "vue-i18n";
import { RouterLink, type RouteLocationRaw } from "vue-router";
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
    compact?: boolean;
    titleLink?: RouteLocationRaw;
    refetchEntities?: () => Promise<void>;
    previewComponentEnabled: boolean;
    // Row highlight: preview open, or last previewed (keepLastActiveItemHighlighted).
    previewComponentCurrentActive: boolean;
    // The eye's pressed state: this row's preview is open now.
    previewOpen?: boolean;
    // Set when the list shows a column-header row.
    hideLabels?: boolean;
    previewComponentFeatureEnabled: boolean;
    previewComponentListItemsCoverage?: ListItemCoverageTypes | undefined;
    isPrimaryMediafile?: boolean;
    isPrimaryThumbnail?: boolean;
    highlightLabel?: string;
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
    highlightLabel: undefined,
    multiLine: false,
    multiLineColumns: 5,
    previewOpen: false,
    hideLabels: false,
  },
);

const emit = defineEmits<{
  (event: "togglePreviewComponent", previewForEntityId: string): void;
  (event: "addRefetchFunctionToEditState"): void;
}>();

const { t, te } = useI18n();

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

const onlyReadModeTeaserMetadata = computed(() =>
  props.teaserMetadata.filter((metadata) => !metadata.showOnlyInEditMode),
);

const TITLE_UNDERLINE =
  "[&_[data-cy=metadata-value]]:underline [&_[data-cy=metadata-value]]:decoration-dashed [&_[data-cy=metadata-value]]:decoration-1 [&_[data-cy=metadata-value]]:decoration-border-dashed [&_[data-cy=metadata-value]]:underline-offset-(--title-underline-offset)";
const isUnderlinedTitle = (idx: number): boolean =>
  idx === 0 &&
  (isListMode.value || isGridMode.value) &&
  !props.teaserMetadata[0]?.value?.formatter;

const isGridTitleLink = (idx: number): boolean =>
  isGridMode.value && idx === 0 && !!props.titleLink;

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
    "cursor-pointer list-none z-[-1]",
    {
      // Flat rows with a hairline below (entity-list-element.md). Wraps the
      // actions below the text when the row is too narrow (a list beside an
      // open preview); wide rows stay on one line.
      "flex flex-wrap items-center gap-2 p-(--list-row-pad) border-b border-border-faint text-table":
        isListMode.value,
    },
    {
      "relative border rounded-card flex flex-col overflow-hidden h-full":
        isGridMode.value,
    },
    {
      "border-dashed border-2 !border-accent-normal":
        props.isPreview || isMarkedAsToBeDeleted.value,
    },
    { "!border-status-new": props.isPreview },
    { "!border-status-deleted": isMarkedAsToBeDeleted.value },
    { "grayscale brightness-95 !cursor-default": props.isDisabled },
    { "font-semibold": isNew.value },
    { "animate-pulse": loading.value },
    // entity-list-element.md: the checkbox owns the wash, the open preview
    // owns the left border; hover fills.
    "hover:bg-surface-row-hover",
    isChecked.value
      ? isGridMode.value
        ? "bg-accent-wash"
        : "bg-accent-wash shadow-accent-row"
      : "bg-background-light",
    isGridMode.value
      ? isChecked.value || isActiveListItem.value
        ? "border-accent"
        : "border-border-subtle"
      : "",
    {
      "border-l-(length:--list-row-preview-border) border-l-accent":
        !isGridMode.value && isActiveListItem.value,
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
