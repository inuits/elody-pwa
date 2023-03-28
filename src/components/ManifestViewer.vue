<template>
  <div v-if="isTify" class="w-full h-full" id="tify-viewer"></div>
  <div v-else class="w-full h-full relative" id="mirador-viewer"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
// @ts-ignore
import Mirador from "mirador/dist/mirador.min.js";

const props = defineProps<{ manifestUrl: string }>();

const isTify = ref<Boolean>(true);

onMounted(() => {
  if (isTify.value) {
    // @ts-ignore
    new Tify({
      container: "#tify-viewer",
      manifestUrl: props.manifestUrl,
    });
  } else {
    Mirador.viewer({
      id: "mirador-viewer",
      windows: [
        {
          manifestId: props.manifestUrl,
        },
      ],
    });
  }
});
</script>
