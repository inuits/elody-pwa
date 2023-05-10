<template>
  <li
    class="row bg-white border border-gray-300 rounded-md cursor-pointer flex items-center gap-6 px-4 py-3 hover:bg-gray-100 transition-colors duration-300"
    :class="{ loading, 'mb-2 px-8': !small, 'px-2': small }"
    data-test="meta-row"
  >
    <div class="flex items-center">
      <div
        class="flex-none w-11 h-11 bg-opacity-50 flex items-center justify-center"
        :class="{ 'bg-neutral-check bg-opacity-30 rounded': isChecked }"
      >
        <input
          type="checkbox"
          class="form-checkbox h-5 w-5 rounded-sm border-gray-300 checked:bg-neutral-check checked:bg-opacity-30 checked:border-blue-200"
          :checked="isChecked"
          @change.stop="handleItemSelection"
          @click.stop
        />
      </div>
    </div>

    <div class="flex items-center"></div>
    <div
      class="flex w-full items-center"
      :class="{ 'flex-col': small && !thumbIcon }"
    >
      <img
        v-if="media && !imageSrcError"
        class="h-10 w-10 object-cover mr-4 rounded-sm outline-none shadow-sm self-center"
        :src="
          mediaIsLink ? media : `/api/iiif/3/${media}/square/100,/0/default.jpg`
        "
        @error="setNoImage()"
      />
      <unicon
        v-if="(thumbIcon && !media) || (imageSrcError && thumbIcon)"
        :name="thumbIcon"
        class="h-10 w-10 p-1 text-neutral-700 mr-4 rounded-sm outline-none shadow-sm self-center"
      />
      <div class="flex w-full" :class="small ? 'flex-col' : ''">
        <div
          v-for="metaItem in sortMetadata(teaserMetadata)"
          :key="metaItem ? metaItem.value : 'no-key'"
          class="col"
          :class="small ? 'w-full' : 'w-1/4'"
        >
          <template v-if="metaItem">
            <span class="label" data-test="meta-label">{{ metaItem.key }}</span>
            <span
              v-if="!stringIsUrl(metaItem.value)"
              class="info"
              data-test="meta-info"
              >{{ metaItem.value }}
            </span>
            <span v-else class="info underline" data-test="meta-info">
              <a :href="metaItem.value" target="_blank">{{ metaItem.key }}</a>
            </span>
          </template>
        </div>
      </div>
    </div>
    <div class="flex flex-row" data-test="action-slot">
      <slot name="">&gt;</slot>
    </div>
  </li>
</template>

<script lang="ts" setup>
import type { MetadataAndRelation } from "../generated-types/queries";
import {
  type Context,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { computed, ref, watch } from "vue";
import { customSort, stringIsUrl } from "@/helpers";

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

const {
  contextWhereUndoSelectionEventIsTriggered,
  enqueueItemForBulkProcessing,
  dequeueItemForBulkProcessing,
  isEnqueued,
} = useBulkOperations();
const isChecked = ref(isEnqueued(props.bulkOperationsContext, props.itemId));
const imageSrcError = ref(false);

const handleItemSelection = () => {
  isChecked.value = !isChecked.value;

  if (props.itemId)
    if (isChecked.value)
      enqueueItemForBulkProcessing(props.bulkOperationsContext, {
        id: props.itemId,
      });
    else
      dequeueItemForBulkProcessing(props.bulkOperationsContext, props.itemId);
};

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

watch(contextWhereUndoSelectionEventIsTriggered, () => {
  if (
    contextWhereUndoSelectionEventIsTriggered.value ===
    props.bulkOperationsContext
  )
    isChecked.value = false;
});
</script>

<style lang="postcss" scoped>
.row {
  @apply flex justify-between py-4;
  @apply bg-neutral-0 hover:bg-neutral-10;
  @apply border border-neutral-50 rounded cursor-pointer;
  @apply transition-colors duration-300 hover:shadow-sm;
}

.col {
  @apply flex justify-start flex-col px-1;
}

.label {
  @apply rounded text-xs text-neutral-60;
}

.info {
  @apply mt-0.5 rounded text-sm text-neutral-700;
}

.row.loading {
  @apply animate-pulse;
  .col span {
    @apply bg-neutral-20 text-neutral-20;
  }
}
</style>
