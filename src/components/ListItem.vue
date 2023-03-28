<template>
  <li
    class="row"
    :class="{ loading, 'mb-2 px-8 ': !small, 'px-2': small }"
    data-test="meta-row"
  >
    <div
      class="flex w-full items-center"
      :class="{ 'flex-col': small && !thumbIcon }"
    >
      <img
        v-if="media && !imageSrcError"
        class="h-10 w-10 obtain-cover mr-4 rounded-sm outline-none shadow-sm self-center"
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
          v-for="metaItem in only4Meta(meta)"
          :key="metaItem ? metaItem.value : 'no-key'"
          class="col"
          :class="small ? ' w-full' : 'w-1/4'"
        >
          <template v-if="metaItem">
            <span class="label" data-test="meta-label">{{ metaItem.key }}</span>
            <span class="info" data-test="meta-info">{{ metaItem.value }}</span>
          </template>
        </div>
      </div>
    </div>
    <div class="flex flex-row" data-test="action-slot">
      <slot name="actions"></slot>
    </div>
  </li>
</template>

<script lang="ts">
import type {
  Maybe,
  Media,
  MetadataAndRelation,
} from "../generated-types/queries";
import { computed, defineComponent, inject, ref } from "vue";
import type { PropType } from "vue";
import { customSort } from "@/helpers";

export default defineComponent({
  name: "ListItem",
  props: {
    loading: { type: Boolean, default: false },
    meta: {
      type: Array as PropType<Maybe<Maybe<MetadataAndRelation>[]>>,
      default: () => [],
    },
    media: {
      type: String as PropType<Maybe<string>>,
      default: () => {
        return "";
      },
    },
    thumbIcon: { type: String, default: "" },
    small: { type: Boolean, default: false },
  },
  setup(props) {
    const config: any = inject("config");
    const imageSrcError = ref<Boolean>(false);
    const setNoImage = () => {
      imageSrcError.value = true;
    };

    const mediaIsLink = computed<Boolean>(() =>
      props.media?.includes("http://") || props.media?.includes("https://")
        ? true
        : false
    );

    const only4Meta = (input: Maybe<Maybe<MetadataAndRelation>[]>) => {
      const sortOrder: string[] = ["object_number", "type", "title"];
      if (input) {
        return customSort(
          sortOrder,
          input?.filter((value) => value?.value !== ""),
          "key"
        );
      } else {
        return [];
      }
    };
    return { setNoImage, imageSrcError, only4Meta, config, mediaIsLink };
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
