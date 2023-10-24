<template>
  <BaseTabs class="h-[94%]" :key="props.manifestUrl || Math.random()">
    <BaseTab v-if="hasMirador" title="Mirador">
      <div class="flex h-full w-full relative z-10" id="mirador-viewer"></div>
    </BaseTab>
    <BaseTab v-if="manifestUrl && hasTify" title="Tify">
      <div class="w-full h-full" id="tify-viewer"></div>
    </BaseTab>
  </BaseTabs>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from "vue";
// @ts-ignore
import Mirador from "mirador/dist/mirador.min.js";
import BaseTabs from "./BaseTabs.vue";
import BaseTab from "./BaseTab.vue";
import { useI18n } from "vue-i18n";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";

const { getEnqueuedItems } = useBulkOperations();
const context = BulkOperationsContextEnum.ManifestCollection;

const props = withDefaults(
  defineProps<{
    manifestUrl: string;
    viewers?: string[];
  }>(),
  {
    manifestUrl: () => {
      return "";
    },
    viewers: () => {
      return ["mirador", "tify"];
    },
  }
);

const { locale } = useI18n();
const hasTify = computed(() => props.viewers.includes("tify"));
const hasMirador = computed(() => props.viewers.includes("mirador"));

const initializeViewers = () => {
  if (props.manifestUrl && hasTify.value) {
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
  } else {
    miradorConfig.windows = getEnqueuedItems(
      BulkOperationsContextEnum.ManifestCollection
    ).map((item: InBulkProcessableItem) => {
      return { manifestId: item.id };
    });
  }
  if (hasMirador.value) Mirador.viewer(miradorConfig);
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
