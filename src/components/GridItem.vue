<template>
  <li class="row border-none h-72 w-80" data-test="meta-row">
    <div
      class="flex items-center flex-col w-full"
      :class="{ 'flex-col': small && !thumbIcon }"
    >
      <div class="w-full">
        <div class="flex justify-center items-center">
          <img
            v-if="media"
            class="h-48 w-48"
            :src="`/api/iiif/3/${media}/square/100,/0/default.jpg`"
            @error="setNoImage()"
          />
          <div
            v-if="(thumbIcon && !media) || (imageSrcError && thumbIcon)"
            class="w-48 h-48 flex items-center justify-center flex-col"
          >
            <unicon
              :name="thumbIcon"
              class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none shadow-sm self-center"
            />
            <div class="text-neutral-70">No media</div>
          </div>
        </div>
        <div
          :class="[
            'w-full h-16 mt-3 pl-2 flex border-t-2 border-neutral-20',
            hasFileName ? 'flex-col' : 'flex-col-reverse',
          ]"
        >
          <div
            v-for="metaItem in only4Meta(meta)"
            :key="metaItem ? metaItem.value : 'no-key'"
            class="w-full h-6"
          >
            <template
              v-if="
                metaItem.key === 'title' ||
                metaItem.key === 'type' ||
                metaItem.key === 'filename'
              "
            >
              <span
                :class="[
                  'text-neutral-700 w-fit',
                  metaItem.key === 'title' || hasFileName
                    ? 'metaTitle'
                    : 'metaType',
                  hasFileName ? 'h-12' : 'h-6 handleOverflow',
                ]"
                data-test="meta-info"
                >{{ metaItem.value }}</span
              >
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row" data-test="action-slot">
      <slot name="actions"></slot>
    </div>
  </li>
</template>

<script lang="ts">
import type { Maybe, MetadataAndRelation } from "../queries";
import { defineComponent, inject, ref } from "vue";
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
  setup(props) {
    const config: any = inject("config");
    let imageSrcError = false;
    const setNoImage = () => {
      imageSrcError = true;
    };
    const hasFileName = ref<boolean>(false);

    console.log(props.meta);

    const only4Meta = (input: Maybe<Maybe<MetadataAndRelation>[]>) => {
      return input
        ?.filter((value) => {
          if (value?.key === "filename") {
            hasFileName.value = true;
          }
          return value?.value !== "" && value?.key !== "object_number";
        })
        .slice(0, 4);
    };

    return { setNoImage, imageSrcError, only4Meta, config, hasFileName };
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
.label {
  @apply rounded text-xs text-neutral-60;
}
.row.loading {
  @apply animate-pulse;
}

.metaTitle {
  @apply font-bold;
}

.metaType {
  @apply text-neutral-70;
}
.handleOverflow {
  width: 275px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
}
</style>
