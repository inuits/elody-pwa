<template>
  <MediaFileLibrary />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MediaFileLibrary from "@/components/MediaFileLibrary.vue";

export default defineComponent({
  name: "mediaFiles",
  components: { MediaFileLibrary },
});
</script>
