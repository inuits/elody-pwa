<template>
  <li
    class="flex items-center gap-6 mb-2 px-8 py-4 bg-neutral-white border-[1px] border-neutral-light rounded cursor-pointer"
  >
    <div>
      <BaseInputCheckbox
        class="text-center"
        v-model="isChecked"
        :item-id="itemId"
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
        v-if="(thumbIcon && !media) || (imageSrcError && thumbIcon)"
        :name="thumbIcon"
        class="h-10 w-10 self-center outline-none text-text-body"
      />
    </div>

    <div class="flex items-center w-full">
      <div
        v-for="metadataItem in sortMetadata(teaserMetadata)"
        :key="metadataItem ? metadataItem.value : 'no-key'"
        class="flex justify-start flex-col mx-2 break-words w-1/4"
      >
        <template v-if="metadataItem">
          <span class="text-sm text-text-light">{{ metadataItem.key }}</span>
          <span v-if="!stringIsUrl(metadataItem.value)" class="info"
            >{{ metadataItem.value }}
          </span>
          <span v-else class="info underline">
            <a :href="metadataItem.value" target="_blank">{{
              metadataItem.key
            }}</a>
          </span>
        </template>
      </div>
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
import type { MetadataAndRelation } from "../generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import { computed, ref } from "vue";
import { customSort, stringIsUrl } from "@/helpers";
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

const isChecked = ref(false);
const imageSrcError = ref(false);

function setNoImage() {
  imageSrcError.value = true;
}

function sortMetadata(metadata: MetadataAndRelation[]) {
  const sortOrder = ["object_number", "type", "title"];
  if (metadata.length > 0)
    return customSort(
      sortOrder,
      metadata.filter((value) => value?.value !== ""),
      "key"
    );

  return [];
}

const mediaIsLink = computed(() => stringIsUrl(props.media || ""));
</script>

<style lang="postcss" scoped>
.info {
  @apply mt-0.5 text-sm text-text-body;
}
</style>
