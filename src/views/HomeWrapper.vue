<template>
  <AssetLibrary v-if="!isSingleEntityPage" />
  <Home v-if="isSingleEntityPage" />
</template>

<script lang="ts" setup>
import AssetLibrary from "@/components/library/AssetLibrary.vue";
import Home from "@/views/Home.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute()

const isSingleEntityPage = computed(() => {
  return route.name === "SingleEntity" || route.name === "SingleMediafile"
})

</script>
