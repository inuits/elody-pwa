<template>
  <li
    class="row"
    :class="{ loading, 'mb-2 px-8 ': !small, 'px-2': small }"
    data-test="meta-row"
  >
    <div class="flex w-full" :class="{ 'flex-col': small && !thumbIcon }">
      <img
        v-if="media"
        class="h-10 w-10 obtain-cover mr-4 rounded-sm outline-none shadow-sm self-center"
        :src="`/api/iiif/3/${media}/square/100,/0/default.jpg`"
        @error="setNoImage()"
      />
      <unicon
        v-if="(thumbIcon && !media) || (imageSrcError && thumbIcon)"
        :name="thumbIcon"
        class="
          h-10
          w-10
          p-1
          text-neutral-700
          mr-4
          rounded-sm
          outline-none
          shadow-sm
          self-center
        "
      />
      <div class="flex w-full" :class="small ? 'flex-col' : ''">
        <div
          v-for="metaItem in only4Meta(meta)"
          :key="metaItem.value"
          class="col"
          :class="small ? ' w-full' : 'w-1/4'"
        >
          <span class="label" data-test="meta-label">{{ metaItem.key }}</span>
          <span class="info" data-test="meta-info">{{ metaItem.value }}</span>
        </div>
      </div>
    </div>
    <div class="flex flex-row" data-test="action-slot">
      <slot name="actions" />
    </div>
  </li>
</template>

<script lang="ts">
  import { Metadata } from '@/queries';
  import { defineComponent, inject, PropType } from 'vue';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'ListItem',
    props: {
      loading: { type: Boolean, default: false },
      meta: {
        type: Array as PropType<{ key: string; value: string }[]>,
        default: () => [],
      },
      media: { type: String, default: undefined },
      thumbIcon: { type: String as PropType<keyof Unicons>, default: '' },
      small: { type: Boolean, default: false },
    },
    setup() {
      const config: any = inject('config');
      let imageSrcError = false;
      const setNoImage = () => {
        imageSrcError = true;
      };

      const only4Meta = (input: Metadata[]) => {
        return input.filter((value) => value.value !== '').slice(0, 4);
      };
      return { setNoImage, imageSrcError, only4Meta, config };
    },
  });
</script>

<style lang="postcss" scoped>
  .row {
    @apply flex justify-between py-4;
    @apply bg-neutral-0 hover:bg-neutral-10;
    @apply border border-neutral-30 rounded cursor-pointer;
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
