<template>
  <base-tooltip position="top-right" :tooltip-offset="8">
    <template #activator="{ on }">
      <div v-on="isPreviewElement ? on : ''">
        <li
          data-cy="list-item"
          :class="[
            'border rounded cursor-pointer list-none z-[-1]',
            {
              'flex items-center gap-2 p-1 mb-2': viewMode === 'list',
            },
            {
              'p-1 mb-2 flex flex-col w-[300px] min-h-[350px]':
                viewMode === 'grid',
            },
            {
              'border-dashed border-2 !border-accent-normal':
                isPreview || isMarkedAsToBeDeleted,
            },
            { '!border-status-new': isPreview },
            { '!border-status-deleted': isMarkedAsToBeDeleted },
            { 'grayscale brightness-95 !cursor-default': isDisabled },
            { 'animate-pulse': loading },
            { 'bg-neutral-white': !isActiveListItem },
            { 'border-neutral-light': !isActiveListItem },
            {
              'border-4 border-neutral-800 bg-accent-light/30':
                isActiveListItem,
            },
          ]"
        >
          <div
            v-if="viewMode === 'grid' && !isPreviewElement"
            class="flex justify-between items-center pb-2"
          >
            <BaseInputCheckbox
              v-if="
                baseLibraryMode === BaseLibraryModes.NormalBaseLibrary &&
                !isPreview &&
                hasSelection &&
                viewMode === 'grid'
              "
              :class="[{ invisible: isDisabled }, 'text-center']"
              v-model="isChecked"
              :item="{ id: itemId, teaserMetadata, type: itemType }"
              :bulk-operations-context="bulkOperationsContext"
              input-style="accentNormal"
            />
            <BaseContextMenuActions
              :context-menu-actions="contextMenuActions"
              :parent-entity-id="formId"
              :entity-id="itemId"
              :entity-type="entityTypename"
              :relation="relation"
              :bulk-operations-context="bulkOperationsContext"
              @toggle-loading="toggleLoading"
            />
          </div>
          <div
            :class="[
              'flex items-center rounded-2xl p-2 bg-neutral-light',
              { 'mb-4': viewMode === 'grid' },
            ]"
            v-show="useEditHelper.isEdit"
            v-if="onlyEditableTeaserMetadata.length > 0"
          >
            <div v-if="!loading" class="w-16 pr-2">
              <div
                v-for="metadataItem in onlyEditableTeaserMetadata"
                :key="metadataItem ? metadataItem.key : 'no-key'"
                class="w-1/1"
              >
                <metadata-wrapper
                  ref="orderMetadataChild"
                  :form-id="formId"
                  v-model:metadata="metadataItem as MetadataField"
                  :is-edit="useEditHelper.isEdit"
                  :linked-entity-id="intialValues?.id || itemId"
                  :should-hide="true"
                />
              </div>
            </div>
          </div>

          <div>
            <BaseInputCheckbox
              v-if="
                baseLibraryMode === BaseLibraryModes.NormalBaseLibrary &&
                !isPreview &&
                hasSelection &&
                viewMode === 'list'
              "
              :class="[{ invisible: isDisabled }, 'text-center']"
              v-model="isChecked"
              :item="{ id: itemId, teaserMetadata, type: itemType }"
              :bulk-operations-context="bulkOperationsContext"
              input-style="accentNormal"
            />
          </div>
          <div
            v-if="canShowCopyRight() && media && !imageSrcError"
            :class="[
              'flex items-center',
              { 'justify-center mb-4 h-[50%]': viewMode === 'grid' },
            ]"
          >
            <ImageViewer
              v-if="canShowCopyRight() && media && !imageSrcError"
              :key="`${itemId}-image-${imageSize}`"
              :class="[
                { '!h-10 !w-10 min-w-10 min-h-10': viewMode === 'list' },
                { '!h-48 !w-48': viewMode === 'grid' },
                'object-cover self-center outline-none',
              ]"
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
              { 'h-10 w-10': viewMode === 'list' },
              {
                'h-48 w-48 flex flex-col justify-center items-center shadow-sm mb-4':
                  viewMode === 'grid',
              },
              'text-neutral-700 rounded-sm outline-none self-center',
            ]"
          >
            <unicon
              :name="thumbIcon"
              class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none self-center"
            />
            <div v-if="viewMode === 'grid'" class="text-neutral-70">
              No media
            </div>
          </div>

          <div
            v-if="!loading"
            :class="[
              'w-full',
              { 'flex items-center': viewMode === 'list' },
              { 'p-4': viewMode === 'grid' },
            ]"
          >
            <div
              v-for="(metadataItem, idx) in teaserMetadata.filter(
                (metadata) => !metadata.showOnlyInEditMode,
              )"
              :key="metadataItem ? metadataItem.key : `no-key_${idx}`"
              :class="teaserMetadataStyle"
            >
              <metadata-wrapper
                :form-id="formId || 'listview'"
                v-model:metadata="metadataItem as MetadataField"
                :is-edit="useEditHelper.isEdit"
                :linked-entity-id="intialValues?.id || itemId"
              />
            </div>
          </div>

          <div class="w-full" v-else>
            <div class="bg-neutral-100 h-4 w-1/4 opacity-40 mb-2"></div>
            <div class="bg-neutral-100 h-4 w-5/6 opacity-40"></div>
          </div>

          <div
            v-if="false"
            :class="[{ 'flex justify-end': viewMode === 'grid' }]"
            @click.stop
          >
            <BaseToggle
              v-model="isMarkedAsToBeDeleted"
              :icon-on="DamsIcons.CrossCircle"
              :icon-off="DamsIcons.Trash"
              :icon-height="22"
            />
          </div>

          <!--    //TEMP: Disable arrow on list item-->
          <!--    <div-->
          <!--      v-if="!isPreview && isEnableNavigation && viewMode !== 'grid'"-->
          <!--      class="flex flex-row"-->
          <!--      @click="() => emit('navigateTo')"-->
          <!--    >-->
          <!--      <slot>-->
          <!--        <unicon-->
          <!--          :name="Unicons.AngleRight.name"-->
          <!--          class="h-5.5 w-5.5 text-text-body"-->
          <!--        />-->
          <!--      </slot>-->
          <!--    </div>-->

          <div v-if="viewMode === 'list'" class="flex">
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
            v-if="
              baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
              baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary
            "
            class="flex"
            @click.stop.prevent="emit('togglePreviewComponent', itemId)"
          >
            <base-tooltip position="top-right" :tooltip-offset="8">
              <template #activator="{ on }">
                <div v-on="on" class="flex">
                  <unicon
                    v-if="previewComponentIconVisible"
                    :name="Unicons.Eye.name"
                    class="h-5.5 w-5.5 text-text-body mx-1"
                    :class="{
                      '!text-accent-accent fill-current':
                        previewComponentEnabled,
                    }"
                  />
                </div>
              </template>
              <template #default>
                <span class="text-sm text-text-placeholder">
                  <div>
                    {{
                      previewComponentEnabled
                        ? t("preview-component.close")
                        : t("preview-component.open")
                    }}
                  </div>
                </span>
              </template>
            </base-tooltip>
          </div>
        </li>
      </div>
    </template>
    <template #default>
      <span class="text-sm text-text-placeholder">
        <div>
          {{ getTitleOrNameFromEntity({ intialValues: intialValues }) }}
        </div>
      </span>
    </template>
  </base-tooltip>
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
  type ContextMenuActions,
  DamsIcons,
  EditStatus,
  type EntityListElement,
  type Entitytyping,
  type IntialValues,
  ListItemCoverageTypes,
  type Metadata,
  type MetadataField,
  PanelType,
  type WindowElementPanel,
} from "@/generated-types/queries";
import { stringIsUrl, asString, getTitleOrNameFromEntity } from "@/helpers";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import EntityElementWindowPanel from "@/components/EntityElementWindowPanel.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useEditMode } from "@/composables/useEdit";
import useEntitySingle from "@/composables/useEntitySingle";
import { computed, inject, onUpdated, ref, watch } from "vue";
import { Unicons } from "@/types";
import { auth, router } from "@/main";
import { useFieldArray } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import BaseContextMenuActions from "./BaseContextMenuActions.vue";
import { hoveredListItem } from "@/composables/useListItemHelper";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context;
    contextMenuActions?: ContextMenuActions;
    itemId?: string;
    itemType?: Entitytyping;
    entityTypename?: Entitytyping;
    loading?: boolean;
    teaserMetadata?: Metadata[];
    intialValues?: IntialValues | undefined;
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
    viewMode?: "list" | "grid";
    refetchEntities?: Function;
    previewComponentEnabled: boolean;
    previewComponentIconVisible: boolean;
    previewComponentListItemsCoverage?: ListItemCoverageTypes | undefined;
  }>(),
  {
    contextMenuActions: undefined,
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
  },
);

const emit = defineEmits<{
  (event: "navigateTo"): void;
  (event: "togglePreviewComponent", previewForEntityId: string): void;
}>();

const { t } = useI18n();
const { deleteTeaserMetadataItemInState } = useFormHelper();
const { update, remove } = useFieldArray(
  `relationValues.${props.relationType}`,
);
const { getEntityUuid } = useEntitySingle();

const isPreviewElement: boolean = inject("IsPreviewElement", false);
const loading = ref<boolean>(props.loading);
const isMarkedAsToBeDeleted = ref<boolean>(false);
const isChecked = ref<boolean>(false);
const imageSrcError = ref<boolean>(false);
const formId = computed(() => getEntityUuid());
const useEditHelper = useEditMode(
  getEntityUuid() || asString(router.currentRoute.value.params.id),
);
const imageSize = computed(() => (props.viewMode === "grid" ? 500 : 100));
const teaserMetadataStyle = computed<string>(() => {
  if (props.viewMode === "grid") return "w-full";
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

const orderMetadataChild = ref(null);
onUpdated(() => {
  if (!orderMetadataChild.value) return;
  orderMetadataChild.value[0]?.setNewValue(props.intialValues?.order);
});

const toggleLoading = () => {
  loading.value = !loading.value;
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
    props.previewComponentEnabled
  )
    return true;
  return false;
});

watch(
  () => isMarkedAsToBeDeleted.value,
  () => {
    if (props.relation !== "no-relation-found")
      if (props.isPreview) {
        removePreviewItem(props.relation.idx);
      } else if (isMarkedAsToBeDeleted.value) {
        update(props.relation.idx, {
          ...props.relation.relation,
          editStatus: EditStatus.Deleted,
        });
      } else {
        update(props.relation.idx, {
          ...props.relation.relation,
          editStatus: EditStatus.Unchanged,
        });
      }
  },
);

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

const removePreviewItem = (idx: number) => {
  deleteTeaserMetadataItemInState(props.itemId);
  remove(idx);
};

const createWindowPanelsFromEntityListElements = (
  entityListElement: EntityListElement,
) => {
  const panel: WindowElementPanel = {
    label: entityListElement.label,
    panelType: PanelType.Relation,
    isEditable: false,
    isCollapsed: false,
    entityListElement,
  };
  return panel;
};
</script>
