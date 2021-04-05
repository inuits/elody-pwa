<template>
  <div
    class="absolute bg-neutral-0 z-20 w-8/12 ml-10 mt-7 p-2 shadow-sm flex justify-between h-10"
  >
    <div>
      <a ref="fullPageRef" class="mr-2 ml-2">
        <unicon
          :name="IncludedIcons.Desktop"
          height="20"
          :fill="tailwindConfig.theme.colors.neutral[700]"
      /></a>
      <a ref="zoomInRef" class="mr-2"
        ><unicon
          :name="IncludedIcons.SearchPlus"
          height="20"
          :fill="tailwindConfig.theme.colors.neutral[700]"
      /></a>
      <a ref="zoomOutRef">
        <unicon
          :name="IncludedIcons.SearchMinus"
          height="20"
          :fill="tailwindConfig.theme.colors.neutral[700]"
        />
      </a>
    </div>
    <a ref="homeRef" class="text-sm mr-2 text-neutral-700">Reset view</a>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, PropType } from 'vue'
  import { IncludedIcons } from '../enums'
  // @ts-ignore
  import tailwindConfig from '../../tailwind.config.js'

  export default defineComponent({
    name: 'ViewerToolbar',
    props: {
      zoomIn: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null
      },
      zoomOut: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null
      },
      fullPage: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null
      },
      home: {
        type: Object as PropType<HTMLDivElement | string | null>,
        default: null
      }
    },
    emits: [
      'update:zoomIn',
      'update:zoomOut',
      'update:fullPage',
      'update:home'
    ],
    setup: (props, { emit }) => {
      const zoomInRef = ref<HTMLDivElement | undefined>(undefined)
      const zoomOutRef = ref<HTMLDivElement | undefined>(undefined)
      const fullPageRef = ref<HTMLDivElement | undefined>(undefined)
      const homeRef = ref<HTMLDivElement | undefined>(undefined)

      onMounted(() => {
        emit('update:zoomIn', zoomInRef.value)
        emit('update:zoomOut', zoomOutRef.value)
        emit('update:fullPage', fullPageRef.value)
        emit('update:home', homeRef.value)
      })

      return {
        IncludedIcons,
        tailwindConfig,
        zoomInRef,
        zoomOutRef,
        fullPageRef,
        homeRef
      }
    }
  })
</script>
