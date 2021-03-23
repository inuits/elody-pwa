<template>
  <a @click="prev">prev</a>
  {{ currentPage }} of {{ maxPage }}<a @click="next">next</a>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue"

export type paginationInfoType = {
  limit: number
  skip: number
}

export default defineComponent({
  name: "Pagination",
  props: {
    paginationInfo: {
      type: Object as PropType<paginationInfoType>,
      default: 1,
      required: true,
    },
    maxPage: {
      type: Number,
      default: 1,
    },
  },
  emits: ["update:paginationInfo"],
  setup: (props, { emit }) => {
    const currentPage = computed<number>(() => {
      return props.paginationInfo.skip + 1
    })

    const next = () => {
      currentPage.value < props.maxPage &&
        emit("update:paginationInfo", {
          limit: props.paginationInfo.limit,
          skip: props.paginationInfo.skip + 1,
        })
    }

    const prev = () => {
      currentPage.value > 1 &&
        emit("update:paginationInfo", {
          limit: props.paginationInfo.limit,
          skip: props.paginationInfo.skip - 1,
        })
    }

    return {
      next,
      prev,
      currentPage,
    }
  },
})
</script>
