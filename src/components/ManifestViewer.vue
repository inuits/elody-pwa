<template>
  <BaseTabs class="h-[94%]" :key="props.manifestUrl || Math.random()">
    <BaseTab v-if="hasMirador" title="Mirador">
      <div
        class="flex h-full w-full relative z-10"
        id="mirador-viewer"
        :key="manifestUrl"
      ></div>
    </BaseTab>
    <BaseTab v-if="manifestUrl && hasTify" title="Tify">
      <div class="w-full h-full" id="tify-viewer" :key="manifestUrl"></div>
    </BaseTab>
  </BaseTabs>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
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

const {
  getEnqueuedItems,
  dequeueAllItemsForBulkProcessing,
  enqueueItemForBulkProcessing,
} = useBulkOperations();
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
const miradorInstance = ref<undefined | object>(undefined);

const initializeViewers = () => {
  if (props.manifestUrl && hasTify.value) {
    const tify = new Tify({
      manifestUrl: props.manifestUrl,
    });
    tify.mount("#tify-viewer");
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
    miradorConfig.windows = [
      { manifestId: props.manifestUrl, view: "gallery" },
    ];
  } else {
    miradorConfig.windows = getEnqueuedItems(
      BulkOperationsContextEnum.ManifestCollection
    ).map((item: InBulkProcessableItem) => {
      return { manifestId: item.id };
    });
  }
  if (hasMirador.value) miradorInstance.value = Mirador.viewer(miradorConfig);
};

onMounted(() => {
  initializeViewers();
});

onBeforeRouteLeave((to, from, next) => {
  if (from.path === "/manifestViewer" && miradorInstance.value !== undefined) {
    dequeueAllItemsForBulkProcessing(context);
    const windows = miradorInstance.value.store.getState().windows;
    const windowIds = [];
    for (let windowId in windows) windowIds.push(windowId);
    windowIds.forEach((id) => {
      const manifest = windows[id].manifestId;
      enqueueItemForBulkProcessing(context, { id: manifest });
    });
  }
  return next();
});

watch(
  () => locale.value,
  () => {
    initializeViewers();
  }
);
</script>
