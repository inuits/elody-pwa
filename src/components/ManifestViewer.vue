<template>
  <BaseTabs class="bg-neutral-0">
    <BaseTab title="Mirador">
      <div class="w-full h-full relative" id="mirador-viewer"></div>
    </BaseTab>
    <BaseTab title="Tify">
      <div class="w-full h-full" id="tify-viewer"></div>
    </BaseTab>
  </BaseTabs>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
// @ts-ignore
import Mirador from "mirador/dist/mirador.min.js";
import BaseTabs from "./BaseTabs.vue";
import BaseTab from "./BaseTab.vue";

const props = defineProps<{ manifestUrl: string }>();

const isTify = ref<Boolean>(true);

onMounted(() => {
  // @ts-ignore
  new Tify({
    container: "#tify-viewer",
    manifestUrl: props.manifestUrl,
  });

  Mirador.viewer({
    id: "mirador-viewer",
    windows: [
      {
        manifestId: props.manifestUrl,
      },
    ],
  });
});
</script>
