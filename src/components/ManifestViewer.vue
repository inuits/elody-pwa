<template>
  <BaseTabs :key="props.manifestUrl || Math.random()" class="bg-neutral-0">
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

  const miradorConfig: any = {
    id: "mirador-viewer",
    language: "nl",
    availableLanguages: {
      nl: "Nederlands",
      en: "English",
    },
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
  };

  if (props.manifestUrl) {
    miradorConfig.windows = [{ manifestId: props.manifestUrl }];
  }

  Mirador.viewer(miradorConfig);
});
</script>
