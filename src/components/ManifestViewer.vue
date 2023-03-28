<template>
  <BaseTabs :key="props.manifestUrl" class="bg-neutral-0">
    <BaseTab title="Mirador">
      <div class="w-full h-full relative z-10" id="mirador-viewer"></div>
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

const props = withDefaults(
  defineProps<{
    manifestUrl: string;
  }>(),
  { manifestUrl: "" }
);

onMounted(() => {
  // @ts-ignore
  new Tify({
    container: "#tify-viewer",
    manifestUrl: props.manifestUrl,
  });

  Mirador.viewer({
    id: "mirador-viewer",
    themes: {
      light: {
        palette: {
          type: "light",
          primary: {
            main: "#DCF4F9",
          },
        },
      },
    },
    windows: [
      {
        manifestId: props.manifestUrl,
      },
    ],
  });
});
</script>
