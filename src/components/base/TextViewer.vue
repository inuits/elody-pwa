<template>
  <div class="flex w-full h-full relative flex-col select-text">
    <div
      class="w-full bg-background-light z-20 p-2 shadow-sm flex items-center h-10 select-none"
    >
      <button
        v-if="props.source?.id && !downloadLoading"
        @click="
          downloadMediafile(props.source.id, props.source.original_filename)
        "
        class="cursor-pointer"
      >
        <unicon
          :name="Unicons.Download.name"
          height="20"
          class="text-neutral-700"
        />
      </button>
      <spinner-loader
        v-else-if="downloadLoading"
        theme="accent"
        :dimensions="5"
      />
    </div>
    <transition name="collapse">
      <div
        v-if="showSanitizedWarning"
        class="flex items-center justify-between bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 text-sm overflow-hidden"
      >
        <span>{{ t("text-viewer.sanitized-warning") }}</span>
        <button
          class="ml-4 font-semibold hover:text-yellow-900 cursor-pointer"
          @click="showSanitizedWarning = false"
        >
          {{ t("text-viewer.dismiss") }}
        </button>
      </div>
    </transition>
    <div class="w-full flex-1 p-4 bg-neutral-20 overflow-y-scroll">
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
import { useMediafileDownload } from "@/composables/useMediafileDownload";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { SanitizeMode } from "@/generated-types/queries";
import { Unicons } from "@/types";

const { t } = useI18n();
const { downloadMediafile, downloadLoading } = useMediafileDownload();

interface Source {
  id: string;
  original_filename?: string;
  intialValues: {
    original_file_location: string;
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
