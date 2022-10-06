<template>
  <AssetLibrary />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AssetLibrary from "@/components/AssetLibrary.vue";

export default defineComponent({
  name: "HomeView",
  components: { AssetLibrary },
});
</script>
