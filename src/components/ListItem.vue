<template>
  <li
    :class="[
      'flex items-center gap-6 px-8 py-4 bg-neutral-white border border-neutral-light rounded cursor-pointer',
      { 'mb-2 ': baseLibraryMode === BaseLibraryModes.NormalBaseLibrary },
      {
        'border-dashed border-2 !border-accent-normal':
          isPreview || isMarkedAsToBeDeleted,
      },
      { '!border-status-new': isPreview },
      { '!border-status-deleted': isMarkedAsToBeDeleted },
      { 'grayscale brightness-95 !cursor-default': isDisabled },
      { 'animate-pulse': loading },
    ]"
  >
    <div
      class="flex items-center rounded-2xl p-2 bg-neutral-light"
      v-show="isEdit"
      v-if="onlyEditableTeaserMetadata.length > 0"
    >
      <!--      <div class="pl-2">-->
      <!--        <unicon-->
      <!--          :name="Unicons.Bars.name"-->
      <!--          class="h-5 w-5 text-neutral-700 rounded-sm outline-none shadow-sm self-center"-->
      <!--        />-->
      <!--      </div>-->
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
            :is-edit="isEdit"
            :linked-entity-id="intialValues?.id || itemId"
            :should-hide="true"
          />
        </div>
      </div>
    </div>

    <div>
      <BaseInputCheckbox
        v-if="baseLibraryMode === BaseLibraryModes.NormalBaseLibrary && !isPreview && !isDisabled && hasSelection"
        class="text-center"
        v-model="isChecked"
        :item="{ id: itemId, teaserMetadata }"
        :bulk-operations-context="bulkOperationsContext"
        input-style="accentNormal"
      />
    </div>
    <div
      v-if="canShowCopyRight() && media && !imageSrcError"
      class="flex items-center"
    >
      <img
        v-if="canShowCopyRight() && media && !imageSrcError"
        class="h-10 w-10 object-cover self-center outline-none"
        :src="
          mediaIsLink ? media : `/api/iiif/3/${media}/square/100,/0/default.jpg`
        "
        @error="setNoImage()"
      />
    </div>
    <unicon
      v-if="
        !canShowCopyRight() ||
        (media && imageSrcError) ||
        (!media && isMediaType)
      "
      :name="thumbIcon"
      class="h-10 w-10 text-neutral-700 rounded-sm outline-none shadow-sm self-center"
    />

    <div v-if="!loading" class="flex items-center w-full">
      <div
        v-for="metadataItem in teaserMetadata.filter(
          (metadata) => !metadata.showOnlyInEditMode
        )"
        :key="metadataItem ? metadataItem.key : 'no-key'"
        :class="[{ 'w-1/4': baseLibraryMode === BaseLibraryModes.NormalBaseLibrary }]"
        class="flex justify-start flex-col mx-2 break-words"
      >
        <metadata-wrapper
          :form-id="formId || 'listview'"
          v-model:metadata="metadataItem as MetadataField"
          :is-edit="isEdit"
          :linked-entity-id="intialValues?.id || itemId"
        />
      </div>
    </div>

    <div class="w-full" v-else>
      <div class="bg-neutral-100 h-4 w-1/4 opacity-40 mb-2"></div>
      <div class="bg-neutral-100 h-4 w-5/6 opacity-40"></div>
    </div>

    <div v-if="isEdit && isMarkableAsToBeDeleted" @click.stop>
      <BaseToggle
        v-model="isMarkedAsToBeDeleted"
        :icon-on="DamsIcons.CrossCircle"
        :icon-off="DamsIcons.Trash"
        :icon-height="22"
      />
    </div>

    <div
      v-if="!isPreview && isEnableNavigation"
      class="flex flex-row"
      @click="() => emit('navigateTo')"
    >
      <slot>
        <unicon
          :name="Unicons.AngleRight.name"
          class="h-5.5 w-5.5 text-text-body"
        />
      </slot>
    </div>

    <div v-if="contextMenuActions">
      <unicon
        :name="Unicons.EllipsisVThinline.name"
        @click.stop="(event: MouseEvent) => contextMenuHandler.openContextMenu({x: event?.clientX, y: event?.clientY})"
      />
      <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
        <context-menu-action
          :context-menu-actions="contextMenuActions"
          :parent-entity-id="formId"
          :entity-id="itemId"
          :entity-type="itemType"
          :relation="relation"
          @toggle-loading="toggleLoading"
        />
      </base-context-menu>
    </div>
  </li>
  <div
    v-if="entityListElements"
    v-for="entityListElement in entityListElements"
  >
    <entity-element-window-panel
      :form-id="itemId"
      :identifiers="[itemId]"
      :is-edit="false"
      :show-label="false"
      :panel="createWindowPanelsFromEntityListElements(entityListElement)"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import {
  BaseLibraryModes,
  type BaseRelationValuesInput,
  type ContextMenuActions,
  DamsIcons,
  EditStatus,
  EntityListElement,
  Entitytyping,
  type IntialValues,
  type Metadata,
  MetadataField,
  PanelType,
  WindowElementPanel
} from "@/generated-types/queries";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import useEditMode from "@/composables/useEdit";
import { useAuth } from "session-vue-3-oidc-library";
import { useFormHelper } from "@/composables/useFormHelper";
import { computed, ref, watch, onUpdated } from "vue";
import { getEntityIdFromRoute, stringIsUrl } from "@/helpers";
import { Unicons } from "@/types";
import { useFieldArray } from "vee-validate";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import ContextMenuAction from "@/components/context-menu-actions/ContextMenuAction.vue";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import EntityElementWindowPanel from "@/components/EntityElementWindowPanel.vue";

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context;
    contextMenuActions?: ContextMenuActions;
    itemId?: string;
    itemType?: Entitytyping;
    loading?: boolean;
    teaserMetadata?: Metadata[];
    intialValues?: IntialValues | undefined;
    media?: string;
    thumbIcon?: string;
    small?: boolean;
    isChecked?: boolean;
    isPreview?: boolean;
    isMarkableAsToBeDeleted?: boolean;
    relation:
      | { idx: number; relation: BaseRelationValuesInput }
      | "no-relation-found";
    isDisabled?: boolean;
    hasSelection: boolean;
    baseLibraryMode?: BaseLibraryModes;
    isMediaType?: boolean;
    isEnableNavigation?: boolean;
    entityListElements?: EntityListElement[];
  }>(),
  {
    contextMenuActions: undefined,
    itemId: "",
    itemType: undefined,
    loading: false,
    teaserMetadata: () => [],
    intialValues: undefined,
    media: "",
    thumbIcon: "",
    small: false,
    isChecked: false,
    isPreview: false,
    isMarkableAsToBeDeleted: false,
    isDisabled: false,
    hasSelection: true,
    relation: "no-relation-found",
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    isMediaType: false,
    isEnableNavigation: false,
    entityListElements: undefined,
  }
);

const emit = defineEmits<{
  (event: "navigateTo"): void;
}>();

const { isEdit } = useEditMode();
const { deleteTeaserMetadataItemInState } = useFormHelper();
const { update, remove } = useFieldArray("relationValues.relations");
const auth = useAuth();
const loading = ref<boolean>(props.loading);
const isMarkedAsToBeDeleted = ref<boolean>(false);
const isChecked = ref<boolean>(false);
const imageSrcError = ref<boolean>(false);

const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const formId = computed(() => getEntityIdFromRoute() as string);

const orderMetadataChild = ref(null);
onUpdated(() => {
  if (!orderMetadataChild.value) return;
  orderMetadataChild.value[0]?.setNewValue(props.intialValues?.order);
});

const toggleLoading = () => {
  loading.value = !loading.value;
};

const setNoImage = () => {
  imageSrcError.value = true;
};

const canShowCopyRight = () => {
  if (auth.isAuthenticated.value === true) return true;
  if (props.intialValues && props.intialValues.length !== 0)
    return props.intialValues.copyrightColor !== "red";
  return true;
};

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));
const onlyEditableTeaserMetadata = computed(() =>
  props.teaserMetadata.filter((metadata) => metadata.showOnlyInEditMode)
);

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
  }
);

watch(
  () => isEdit.value,
  () => (!isEdit.value ? (isMarkedAsToBeDeleted.value = false) : "")
);
const removePreviewItem = (idx: number) => {
  deleteTeaserMetadataItemInState(props.itemId);
  remove(idx);
};

const createWindowPanelsFromEntityListElements = (entityListElement: EntityListElement) => {
  const panel: WindowElementPanel = {
    label: entityListElement.label,
    panelType: PanelType.Relation,
    isEditable: false,
    isCollapsed: false,
    entityListElement
  }
  return panel;
}
</script>
