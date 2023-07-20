<template>
  <li
    :class="[
      'flex items-center gap-6 mb-2 px-8 py-4 bg-neutral-white border border-neutral-light rounded cursor-pointer',
      { 'animate-pulse': loading },
    ]"
  >
    <div>
      <BaseInputCheckbox
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
        :key="metadataItem ? metadataItem.value : 'no-key'"
        class="flex justify-start flex-col mx-2 break-words w-1/4"
      >
        <template v-if="metadataItem">
          <span class="text-sm text-text-light">{{ metadataItem.key }}</span>
          <span v-if="!stringIsUrl(metadataItem.value)" class="info"
            >{{ metadataItem.key.startsWith('date_') ? convertUnitToReadbleFormat(metadataItem.value, 'datetime') :  metadataItem.value }}
          </span>
          <span v-else class="info underline">
            <a :href="metadataItem.value" target="_blank">{{
              metadataItem.key
            }}</a>
          </span>
        </template>
      </div>
    </div>
    <div class="w-full" v-else>
      <div class="bg-neutral-100 h-4 w-1/4 opacity-40 mb-2"></div>
      <div class="bg-neutral-100 h-4 w-5/6 opacity-40"></div>
    </div>
    <div class="flex flex-row">
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
import type { MetadataAndRelation } from "@/generated-types/queries";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import { computed, ref } from "vue";
import { stringIsUrl, convertUnitToReadbleFormat} from "@/helpers";
import { Unicons } from "@/types";


const props = withDefaults(
  defineProps<{
    itemId?: string;
    bulkOperationsContext: Context;
    loading?: boolean;
    teaserMetadata?: MetadataAndRelation[];
    media?: string;
    thumbIcon?: string;
    small?: boolean;
    isChecked?: boolean;
  }>(),
  {
    itemId: "",
    loading: false,
    teaserMetadata: () => [],
    media: "",
    thumbIcon: "",
    small: false,
    isChecked: false,
  }
);

const isChecked = ref<boolean>(false);
const imageSrcError = ref<boolean>(false);

const setNoImage = () => {
  imageSrcError.value = true;
};

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));
</script>

<style lang="postcss" scoped>
.info {
  @apply mt-0.5 text-sm text-text-body;
}
</style>
