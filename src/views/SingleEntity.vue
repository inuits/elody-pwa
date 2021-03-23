<template>
  <div class="h-full w-full flex relative">
    <IIIFViewer
      v-if="!loading && result.Entity.mediafiles && result.Entity.mediafiles[0]"
      :image-url="result.Entity.mediafiles[0].location"
    />
    <div
      v-if="!loading && result.Entity.metadata"
      class="w-2/6 p-6 bg-neutral-0"
    >
      <div
        v-for="meta in result.Entity.metadata"
        :key="meta.value"
        class="flex flex-col mb-2 mt-2"
      >
        <span
          class="rounded font-base text-xs"
          :class="{
            'bg-neutral-20 text-neutral-20': loading,
            'text-neutral-60': !loading,
          }"
          >{{ meta.key }}</span
        >
        <span
          class="mt-0.5 rounded font-base text-sm"
          :class="{
            'bg-neutral-20 text-neutral-20': loading,
            'text-neutral-700': !loading,
          }"
          >{{ meta.value }}</span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue"
import { useQuery } from "@vue/apollo-composable"
import IIIFViewer from "../components/IIIFViewer.vue"
import { useRoute } from "vue-router"
import {
  getEntity,
  getEntityQueryType,
  getEntityQueryVariableType,
} from "@/queries/entities"
import { getRouteParams } from "@/helpers"

export default defineComponent({
  name: "SingleEntity",
  components: {
    IIIFViewer,
  },
  setup: () => {
    const route = useRoute()

    const { result, loading } = useQuery<
      getEntityQueryType,
      getEntityQueryVariableType
    >(getEntity, {
      id: getRouteParams(route, "id"),
    })

    watch(result, (value) => {
      const title = value.Entity.title[0].value
      route.meta.title = title
    })

    return {
      result,
      loading,
    }
  },
})
</script>
