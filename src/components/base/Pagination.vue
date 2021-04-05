<template>
  <div
    class="flex items-center "
    :class="{
      'bg-neutral-20 text-neutral-20': loading,
      'text-neutral-700': !loading
    }"
  >
    <unicon
      class="cursor-pointer"
      :name="IncludedIcons.AngleLeft"
      height="16"
      :fill="
        loading
          ? tailwindConfig.theme.colors.neutral[20]
          : tailwindConfig.theme.colors.neutral[700]
      "
      @click="prev"
    />
    <div class="inline-block text-sm mx-3" data-test="page-count-label">
      Page {{ currentPage }} of {{ maxPage }}
    </div>
    <unicon
      class="cursor-pointer"
      :name="IncludedIcons.AngleRight"
      height="16"
      :fill="
        loading
          ? tailwindConfig.theme.colors.neutral[20]
          : tailwindConfig.theme.colors.neutral[700]
      "
      @click="next"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType, computed } from 'vue'
  import { IncludedIcons } from '../../enums'
  //@ts-ignore
  import tailwindConfig from '../../../tailwind.config.js'

  export type paginationInfoType = {
    limit: number
    skip: number
  }

  export default defineComponent({
    name: 'Pagination',
    props: {
      loading: {
        type: Boolean,
        default: false
      },
      paginationInfo: {
        type: Object as PropType<paginationInfoType>,
        default: 1,
        required: true
      },
      maxPage: {
        type: Number,
        default: 1
      }
    },
    emits: ['update:paginationInfo'],
    setup: (props, { emit }) => {
      const currentPage = computed<number>(() => {
        return props.paginationInfo.skip + 1
      })

      const next = () => {
        currentPage.value < props.maxPage &&
          emit('update:paginationInfo', {
            limit: props.paginationInfo.limit,
            skip: props.paginationInfo.skip + 1
          })
      }

      const prev = () => {
        currentPage.value > 1 &&
          emit('update:paginationInfo', {
            limit: props.paginationInfo.limit,
            skip: props.paginationInfo.skip - 1
          })
      }

      return {
        next,
        prev,
        currentPage,
        IncludedIcons,
        tailwindConfig
      }
    }
  })
</script>
