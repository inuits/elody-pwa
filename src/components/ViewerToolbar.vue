<template>
  <div
    class="
      absolute
      w-11/12
      bg-neutral-0
      z-20
      mx-4
      mt-7
      p-2
      shadow-sm
      flex
      justify-between
      h-10
    "
  >
    <div>
      <a ref="fullPageRef" class="mr-2 ml-2">
        <unicon :name="Unicons.Desktop.name" height="20" class="text-neutral-700" />
      </a>
      <a ref="zoomInRef" class="mr-2"
        ><unicon :name="Unicons.SearchPlus.name" height="20" class="text-neutral-700"
      /></a>
      <a ref="zoomOutRef">
        <unicon :name="Unicons.SearchMinus.name" height="20" class="text-neutral-700" />
      </a>
    </div>
    <a ref="homeRef" class="text-sm mr-2 text-neutral-700">Reset view</a>
  </div>
  <div
    v-show="imageMetaData.length > 0"
    class="metainfo absolute bg-neutral-0 z-20 mx-4 mt-7 p-4 shadow-sm bottom-0"
  >
    <h3 class="text-sm text-neutral-700 font-semibold">Mediainfo</h3>
    <div v-for="item in imageMetaData" :key="item.label" class="flex flex-col mb-2 mt-2">
      <div class="label">{{ item.key }}</div>
      <div v-if="item.value" class="value">
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, PropType } from 'vue';
  import { Unicons } from '@/types';
  import { MediaFileMetadata } from '@/queries';

  export default defineComponent({
    name: 'ViewerToolbar',
    props: {
      zoomIn: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null,
      },
      zoomOut: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null,
      },
      fullPage: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null,
      },
      home: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null,
      },
      imageMetaData: {
        type: Array as PropType<MediaFileMetadata[]>,
        required: false,
        default: () => [],
      },
    },
    emits: ['update:zoomIn', 'update:zoomOut', 'update:fullPage', 'update:home'],
    setup: (_props, { emit }) => {
      const zoomInRef = ref<HTMLDivElement | undefined>(undefined);
      const zoomOutRef = ref<HTMLDivElement | undefined>(undefined);
      const fullPageRef = ref<HTMLDivElement | undefined>(undefined);
      const homeRef = ref<HTMLDivElement | undefined>(undefined);

      onMounted(() => {
        emit('update:zoomIn', zoomInRef.value);
        emit('update:zoomOut', zoomOutRef.value);
        emit('update:fullPage', fullPageRef.value);
        emit('update:home', homeRef.value);
      });

      return {
        Unicons,
        zoomInRef,
        zoomOutRef,
        fullPageRef,
        homeRef,
      };
    },
  });
</script>
<style lang="postcss" scoped>
  .label {
    @apply rounded font-body text-xs text-neutral-60;
  }
  .value {
    @apply rounded font-body text-sm text-neutral-700 mt-0.5;
  }
  .label.loading,
  .value.loading {
    @apply bg-neutral-20 text-neutral-20;
  }

  .metainfo {
    bottom: 1rem;
  }
</style>
