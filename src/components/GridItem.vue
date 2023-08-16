<template>
  <li
    :class="[
      'w-full h-auto align-middle border border-neutral-light rounded cursor-pointer',
      { 'animate-pulse': loading },
    ]"
  >
    <div class="absolute top-0 right-0 w-min h-min">
      <slot name="actions"></slot>
    </div>
    <div
      class="flex items-center w-full"
      :class="{ 'flex-col': small && !thumbIcon }"
    >
      <div class="w-full">
        <div class="flex justify-center items-center">
          <img
            v-if="media"
            class="h-48 w-48 object-cover"
            :src="
              mediaIsLink
                ? media
                : `/api/iiif/3/${media}/square/500,/0/default.jpg`
            "
            @error="setNoImage()"
          />
          <div
            v-if="(thumbIcon && !media) || (imageSrcError && thumbIcon)"
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
          class="flex items-center w-full mt-12 p-4 pb-3 border-t-2 border-neutral-20 rounded-b bg-neutral-white"
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
          <div class="w-full">
            <div
              v-for="metadataItem in teaserMetadata"
              :key="metadataItem ? metadataItem.value : 'no-key'"
            >
              <entity-element-metadata
                :label="metadataItem.label"
                :value="metadataItem.value"
                :unit="metadataItem.unit"
              />
              <!-- <template v-if="metadataItem">
                <div class="flex items-center pl-4 mb-1">
                  <div class="flex flex-col items-start w-full">
                    <span class="text-sm text-text-light">
                      {{ metadataItem.key }}
                    </span>
                    <span
                      class="text-sm text-text-body w-[95%] overflow-hidden text-ellipsis"
                    >
                      {{ metadataItem.value }}
                    </span>
                  </div>
                </div>
              </template> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts" setup>
import EntityElementMetadata from "./EntityElementMetadata.vue";
import type { Context } from "@/composables/useBulkOperations";
import type { MetadataAndRelation } from "@/generated-types/queries";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import { computed, ref } from "vue";
import { stringIsUrl } from "@/helpers";

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
