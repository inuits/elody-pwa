<template>
  <li
    :class="[
      'flex items-center gap-6 mb-2 px-8 py-4 bg-neutral-white border border-neutral-light rounded cursor-pointer',
      {
        'border-dashed border-2 !border-accent-normal':
          isPreview || isMarkedAsToBeDeleted,
      },
      { '!border-status-new': isPreview },
      { '!border-status-deleted': isMarkedAsToBeDeleted },
      { 'animate-pulse': loading },
    ]"
  >
    <div>
      <BaseInputCheckbox
        v-if="!isPreview"
        class="text-center"
        v-model="isChecked"
        :item="{ id: itemId, teaserMetadata }"
        :bulk-operations-context="bulkOperationsContext"
        input-style="accentNormal"
      />
    </div>

    <div class="flex items-center">
      <img
        v-if="media && !imageSrcError"
        class="h-10 w-10 object-cover self-center outline-none"
        :src="
          mediaIsLink ? media : `/api/iiif/3/${media}/square/100,/0/default.jpg`
        "
        @error="setNoImage()"
      />
      <unicon
        v-if="
          (thumbIcon && media && imageSrcError) || (imageSrcError && thumbIcon)
        "
        :name="thumbIcon"
        class="h-10 w-10 self-center outline-none text-text-body"
      />
    </div>

    <div v-if="!loading" class="flex items-center w-full">
      <div
        v-for="metadataItem in teaserMetadata"
        :key="metadataItem ? metadataItem.key : 'no-key'"
        class="flex justify-start flex-col mx-2 break-words w-1/4"
      >
        <entity-element-metadata
          :label="metadataItem.label"
          :value="metadataItem.value"
          :unit="metadataItem.unit"
        />
      </div>
    </div>

    <div class="w-full" v-else>
      <div class="bg-neutral-100 h-4 w-1/4 opacity-40 mb-2"></div>
      <div class="bg-neutral-100 h-4 w-5/6 opacity-40"></div>
    </div>

    <div v-if="isEdit && isMarkableAsToBeDeleted && !isPreview" @click.stop>
      <BaseToggle
        v-model="isMarkedAsToBeDeleted"
        :icon-on="DamsIcons.CrossCircle"
        :icon-off="DamsIcons.Trash"
        :icon-height="22"
      />
    </div>

    <div v-if="!isPreview" class="flex flex-row">
      <slot>
        <unicon
          :name="Unicons.AngleRight.name"
          class="h-5.5 w-5.5 text-text-body"
        />
      </slot>
    </div>
  </li>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import {
  DamsIcons,
  EditStatus,
  type BaseRelationValuesInput,
  type Metadata,
} from "@/generated-types/queries";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import EntityElementMetadata from "@/components/EntityElementMetadata.vue";
import useEditMode from "@/composables/useEdit";
import { computed, ref, watch } from "vue";
import { stringIsUrl } from "@/helpers";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context;
    itemId?: string;
    loading?: boolean;
    teaserMetadata?: Metadata[];
    media?: string;
    thumbIcon?: string;
    small?: boolean;
    isChecked?: boolean;
    isPreview?: boolean;
    isMarkableAsToBeDeleted?: boolean;
    relation?: BaseRelationValuesInput;
  }>(),
  {
    itemId: "",
    loading: false,
    teaserMetadata: () => [],
    media: "",
    thumbIcon: "",
    small: false,
    isChecked: false,
    isPreview: false,
    isMarkableAsToBeDeleted: false,
  }
);

const { isEdit } = useEditMode();
const isMarkedAsToBeDeleted = ref<boolean>(false);
const isChecked = ref<boolean>(false);
const imageSrcError = ref<boolean>(false);

const setNoImage = () => {
  imageSrcError.value = true;
};

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));

if (props.relation && props.isMarkableAsToBeDeleted && !props.isPreview)
  watch(
    () => isMarkedAsToBeDeleted.value,
    () => {
      if (props.relation)
        if (isMarkedAsToBeDeleted.value)
          props.relation.editStatus = EditStatus.Deleted;
        else props.relation.editStatus = EditStatus.Unchanged;
    }
  );
</script>
