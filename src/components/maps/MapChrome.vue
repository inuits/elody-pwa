<template>
  <div
    class="absolute top-2 left-2 z-[5] flex flex-col gap-0.5 p-0.5 bg-background-light rounded-(--viewer-button-radius) shadow-sm"
  >
    <button
      type="button"
      class="viewer-button"
      :aria-label="t('media-viewer.zoom-in')"
      :title="t('media-viewer.zoom-in')"
      @click="zoomBy(1)"
    >
      <unicon :name="Unicons.Plus.name" height="18" />
    </button>
    <button
      type="button"
      class="viewer-button"
      :aria-label="t('media-viewer.zoom-out')"
      :title="t('media-viewer.zoom-out')"
      @click="zoomBy(-1)"
    >
      <unicon :name="Unicons.Minus.name" height="18" />
    </button>
    <button
      v-if="fullscreen"
      type="button"
      class="viewer-button"
      :aria-label="t('media-viewer.fullscreen')"
      :title="t('media-viewer.fullscreen')"
      @click="toggleFullscreen"
    >
      <unicon :name="Unicons.ExpandAlt.name" height="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import Attribution from "ol/control/Attribution";
import type OlMap from "ol/Map";
import { Unicons } from "@/types";

// Placed inside an OlMap with :controls="[]": our named zoom (and fullscreen)
// buttons replace OpenLayers' own; attribution is always shown (map-viewer.md).
defineProps<{ fullscreen?: boolean }>();

const { t } = useI18n();
const map = inject<OlMap>("map")!;
const attribution = new Attribution({ collapsible: false });

const zoomBy = (delta: number) => {
  const view = map.getView();
  view.animate({ zoom: (view.getZoom() ?? 0) + delta, duration: 250 });
};

const toggleFullscreen = () => {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void map.getTargetElement()?.requestFullscreen();
};

onMounted(() => map.addControl(attribution));
onUnmounted(() => map.removeControl(attribution));
</script>
