<template>
  <BaseTabs :key="props.manifestUrl || Math.random()" class="px-6">
    <BaseTab title="Mirador">
      <div class="w-full h-full relative z-10" id="mirador-viewer"></div>
    </BaseTab>
    <BaseTab v-if="manifestUrl" title="Tify">
      <div class="w-full h-full" id="tify-viewer"></div>
    </BaseTab>
  </BaseTabs>
</template>

<script lang="ts" setup>
import { onMounted, watch } from "vue";
// @ts-ignore
import Mirador from "mirador/dist/mirador.min.js";
import BaseTabs from "./BaseTabs.vue";
import BaseTab from "./BaseTab.vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    manifestUrl: string;
  }>(),
  { manifestUrl: "" }
);

const { locale } = useI18n();

const initializeViewers = () => {
  if (props.manifestUrl) {
    new Tify({
      container: "#tify-viewer",
      manifestUrl: props.manifestUrl,
    });
  }

  const miradorConfig: any = {
    id: "mirador-viewer",
    language: locale.value,
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
};

onMounted(() => {
  initializeViewers();
});

watch(
  () => locale.value,
  () => {
    initializeViewers();
  }
);
</script>
