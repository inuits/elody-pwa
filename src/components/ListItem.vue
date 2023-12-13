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
      { 'grayscale brightness-95 !cursor-default': isDisabled },
      { 'animate-pulse': loading },
    ]"
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
    <div v-if="canShowCopyRight() && media && !imageSrcError" class="flex items-center">
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
      v-if="!canShowCopyRight() || (media && imageSrcError)"
      :name="thumbIcon"
      class="h-10 w-10 text-neutral-700 rounded-sm outline-none shadow-sm self-center"
    />

    <div v-if="!loading" class="flex items-center w-full">
      <div
        v-for="metadataItem in teaserMetadata"
        :key="metadataItem ? metadataItem.key : 'no-key'"
        class="flex justify-start flex-col mx-2 break-words w-1/4"
      >
        <metadata-wrapper :form-id="formId" :metadata="metadataItem as MetadataField" :is-edit="isEdit" :linked-entity-id="intialValues.id"/>
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
      v-if="!isPreview"
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
  </li>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import {
  DamsIcons,
  EditStatus,
  type BaseRelationValuesInput,
  type Metadata, MetadataField,
} from "@/generated-types/queries";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import useEditMode from "@/composables/useEdit";
import { useAuth } from "session-vue-3-oidc-library";
import { computed, ref, watch } from "vue";
import {getEntityIdFromRoute, stringIsUrl} from "@/helpers";
import { Unicons } from "@/types";
import { useFieldArray } from "vee-validate";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context;
    itemId?: string;
    loading?: boolean;
    teaserMetadata?: Metadata[];
    intialValues?: Metadata[];
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
    relation: "no-relation-found",
  }
);

const emit = defineEmits<{
  (event: "navigateTo"): void;
}>();

const { isEdit } = useEditMode();
const { update, remove } = useFieldArray("relationValues.relations");
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
}

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));

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

const removePreviewItem = (idx: number) => {
  remove(idx);
};
</script>
