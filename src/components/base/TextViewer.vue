<template>
  <div class="flex w-full h-full relative flex-col select-text">
    <div class="relative shrink-0 h-(--viewer-toolbar-height) select-none">
      <ViewerToolbar
        mode="text"
        :mediafile-id="props.source?.id"
        :original-filename="props.source?.intialValues?.original_filename"
        @zoom-in="zoom(ZOOM_STEP)"
        @zoom-out="zoom(-ZOOM_STEP)"
      />
    </div>
    <transition name="collapse">
      <div
        v-if="showSanitizedWarning"
        role="status"
        data-testid="text-viewer-sanitized-warning"
        class="viewer-banner flex items-center justify-between px-4 py-2 text-table text-text-body overflow-hidden"
      >
        <span>{{ t("text-viewer.sanitized-warning") }}</span>
        <BaseButtonNew
          class="ml-4"
          button-style="ghost"
          button-size="sm"
          :label="t('text-viewer.dismiss')"
          @click="showSanitizedWarning = false"
        />
      </div>
    </transition>
    <div
      data-testid="text-viewer-content"
      class="w-full flex-1 p-4 bg-neutral-20 overflow-y-scroll"
      :style="{ fontSize: `${zoomLevel * 100}%` }"
    >
      <sanitized-html
        :mode="SanitizeMode.Html"
        :content="fileContent"
        @content-sanitized="showSanitizedWarning = true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useGetMediafile } from "@/composables/useGetMediafile";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import ViewerToolbar from "@/components/ViewerToolbar.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { SanitizeMode } from "@/generated-types/queries";

const { t } = useI18n();

const ZOOM_STEP = 0.25;
const zoomLevel = ref<number>(1);
const zoom = (step: number) => {
  zoomLevel.value = Math.min(3, Math.max(0.5, zoomLevel.value + step));
};

interface Source {
  id: string;
  intialValues: {
    original_file_location: string;
    original_filename?: string;
  };
}

const props = defineProps<{ source: Source }>();

const fileContent = ref<string>("");
const showSanitizedWarning = ref<boolean>(false);
const { getMediafile } = useGetMediafile();

const getText = async () => {
  showSanitizedWarning.value = false;
  const response = await getMediafile(`/api/mediafile/${props.source.id}`);
  const text = await response.text();
  fileContent.value = text.split(/\r\n|\n/).join("<br/>");
};

watch(() => props.source, getText, { deep: true });

onMounted(getText);
</script>

<style scoped>
.viewer-banner {
  background: var(--color-warning-bg);
  border-left: var(--viewer-banner-accent-width) solid var(--color-warning);
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    height 0.2s ease,
    padding 0.2s ease,
    opacity 0.2s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  height: 0 !important;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
</style>
