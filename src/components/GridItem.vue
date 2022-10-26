<template>
  <li
    class="row border-none"
    :class="{ loading, 'px-8 ': !small, 'px-2': small }"
    data-test="meta-row"
  >
    <div
      class="flex items-center flex-col"
      :class="{ 'flex-col': small && !thumbIcon }"
    >
      <div>
        <img
        v-if="media"
        class="h-64 w-64"
        :src="`/api/iiif/3/${media}/square/100,/0/default.jpg`"
        @error="setNoImage()"
        />
        <div v-if="(thumbIcon && !media) || (imageSrcError && thumbIcon)" 
          class="w-64 h-64 flex items-center justify-center flex-col">
          <unicon
            :name="thumbIcon"
            class="h-10 w-10 p-1 text-neutral-700 rounded-sm outline-none shadow-sm self-center"
          />  
          <div>
            No media
          </div>
        </div>
      </div>
      <hr>
      <div class="flex w-full pl-3 h-5 mt-2">RICARDO ROCKS</div>
    </div>
    <div class="flex flex-row" data-test="action-slot">
      <slot name="actions"></slot>
    </div>
  </li>
</template>

<script lang="ts">
import type { Maybe, Media, MetadataAndRelation } from "@/queries";
import { defineComponent, inject } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  name: "GridItem",
  props: {
    loading: { type: Boolean, default: false },
    meta: {
      type: Array as PropType<Maybe<Maybe<MetadataAndRelation>[]>>,
      default: () => [],
    },
    media: { type: Object as PropType<Maybe<String>>, default: undefined },
    thumbIcon: { type: String, default: "" },
    small: { type: Boolean, default: false },
  },
  setup() {
    const config: any = inject("config");
    let imageSrcError = false;
    const setNoImage = () => {
      imageSrcError = true;
    };

    const only4Meta = (
      input: Maybe<Maybe<MetadataAndRelation>[]>
    ) => {
      return input?.filter((value) => value?.value !== "").slice(0, 4);
    };
    return { setNoImage, imageSrcError, only4Meta, config };
  },
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
