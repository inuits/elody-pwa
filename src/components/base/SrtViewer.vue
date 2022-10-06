<template>
  <div class="flex w-full h-full justify-center items-center">
    <media-info class="" :meta-data="source.metadata" />
  </div>
</template>
<script lang="ts">
import { MediaFileMetadata } from "@/queries";
import { defineComponent, PropType } from "vue";
import MediaInfo from "./MediaInfo.vue";

export default defineComponent({
  name: "SrtViewer",
  components: {
    MediaInfo,
  },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
