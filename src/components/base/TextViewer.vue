<template>
  <div class="flex w-full h-full relative">
    <div class="w-full h-full p-4 bg-neutral-20 overflow-y-scroll">
      <p v-html="fileContent"></p>
    </div>
    <media-info class="" :meta-data="source.metadata" />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import MediaInfo from "./MediaInfo.vue";

export default defineComponent({
  name: "TextViewer",
  components: {
    MediaInfo,
  },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const fileContent = ref<string>();

    onMounted(() => {
      fetch("/api/mediafile/" + props.source.filename).then(async (res) => {
        fileContent.value = (await res.text()).split(/\r\n|\n/).join("<br/>");
      });
    });

    return { fileContent };
  },
});
</script>
