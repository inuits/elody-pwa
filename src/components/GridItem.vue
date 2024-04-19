<template>
  <li
    :class="[
      'w-full align-middle border border-neutral-light rounded cursor-pointer list-none',
      {
        'border-dashed border-2 !border-accent-normal':
          isPreview || isMarkedAsToBeDeleted,
      },
      { '!border-status-new': isPreview },
      { '!border-status-deleted': isMarkedAsToBeDeleted },
      { 'grayscale brightness-95 !cursor-default': isDisabled },
      { 'animate-pulse h-64': loading },
    ]"
  >
    <div class="absolute top-0 right-0 w-min h-min">
      <slot name="actions"></slot>
    </div>
    <div
      class="flex items-center w-full h-full"
      :class="{ 'flex-col': small && !thumbIcon }"
    >
      <div class="w-full h-full">
        <div class="h-[50%] flex justify-center items-center">
          <ImageViewer
            v-if="canShowCopyRight() && media && !imageSrcError"
            class="h-48 w-48 object-cover"
            :src="
              mediaIsLink
                ? media
                : `/api/iiif/3/${media}/square/^500,/0/default.jpg`
            "
            @error="setNoImage()"
          />
          <div
            v-if="
              (!canShowCopyRight() && thumbIcon) ||
              (thumbIcon && !media) ||
              (imageSrcError && thumbIcon)
            "
            class="w-48 h-48 flex items-center justify-center flex-col bg-center bg-no-repeat bg-cover"
            style="background-image: url(.jpg)"
          >
            <unicon
              :name="thumbIcon"
              class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none shadow-sm self-center"
            />
            <div class="text-neutral-70">No media</div>
          </div>
        </div>

        <div
          class="flex items-center w-full p-4 border-t-2 border-neutral-20 rounded-b bg-neutral-white h-[50%]"
        >
          <div>
            <BaseInputCheckbox
              v-if="!isPreview && !isDisabled && hasSelection"
              class="text-center"
              v-model="isChecked"
              :item="{ id: itemId, teaserMetadata }"
              :bulk-operations-context="bulkOperationsContext"
              input-style="accentNormal"
            />
          </div>
          <div v-if="!loading" class="w-full min-w-0">
            <div
              v-for="metadataItem in teaserMetadata.filter(
                (item) => !item.showOnlyInEditMode
              )"
              :key="metadataItem ? metadataItem.value : 'no-key'"
            >
              <metadata-wrapper
                :form-id="formId || 'griditem'"
                v-model:metadata="metadataItem as MetadataField"
                :is-edit="false"
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
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import {
  DamsIcons,
  EditStatus,
  type BaseRelationValuesInput,
  type MetadataAndRelation,
  type Metadata,
  MetadataField,
} from "@/generated-types/queries";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import useEditMode from "@/composables/useEdit";
import { useAuth } from "session-vue-3-oidc-library";
import { computed, ref, watch } from "vue";
import { getEntityIdFromRoute, stringIsUrl } from "@/helpers";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";

const props = withDefaults(
  defineProps<{
    itemId?: string;
    bulkOperationsContext: Context;
    loading?: boolean;
    teaserMetadata?: MetadataAndRelation[];
    intialValues?: Metadata[];
    media?: string;
    thumbIcon?: string;
    small?: boolean;
    isChecked?: boolean;
    isPreview?: boolean;
    isMarkableAsToBeDeleted?: boolean;
    relation?: BaseRelationValuesInput;
    isDisabled?: boolean;
    relations?: BaseRelationValuesInput[];
    hasSelection: boolean;
  }>(),
  {
    itemId: "",
    loading: false,
    teaserMetadata: () => [],
    intialValues: () => [],
    media: "",
    thumbIcon: "",
    small: false,
    isChecked: false,
    isPreview: false,
    isMarkableAsToBeDeleted: false,
    isDisabled: false,
    hasSelection: true,
  }
);

const { isEdit } = useEditMode();
const auth = useAuth();
const isMarkedAsToBeDeleted = ref<boolean>(false);
const isChecked = ref<boolean>(false);
const imageSrcError = ref<boolean>(false);
const formId = computed(() => getEntityIdFromRoute() as string);

const setNoImage = () => {
  imageSrcError.value = true;
};

const canShowCopyRight = () => {
  if (auth.isAuthenticated.value === true) return true;
  if (props.intialValues.length !== 0)
    return props.intialValues.copyrightColor !== "red";
  return true;
};

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));

watch(
  () => isMarkedAsToBeDeleted.value,
  () => {
    if (props.relation)
      if (props.isPreview) removePreviewItem();
      else if (isMarkedAsToBeDeleted.value)
        // @ts-ignore
        props.relation.editStatus = EditStatus.Deleted;
      // @ts-ignore
      else props.relation.editStatus = EditStatus.Unchanged;
  }
);

const removePreviewItem = () => {
  const indexToRemove = props.relations?.findIndex(
    (item) => item.key === props.relation.key
  );

  if (indexToRemove !== -1) props.relations?.splice(indexToRemove, 1);
};
</script>
