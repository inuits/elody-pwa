<template>
  <div class="flex w-full h-full relative flex-col select-text">
    <div
      v-if="showSanitizedWarning"
      class="flex items-center justify-between bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 text-sm"
    >
      <span>{{ t("text-viewer.sanitized-warning") }}</span>
      <button
        class="ml-4 font-semibold hover:text-yellow-900 cursor-pointer"
        @click="showSanitizedWarning = false"
      >
        {{ t("text-viewer.dismiss") }}
      </button>
    </div>
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
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import { SanitizeMode } from "@/generated-types/queries";

const { t } = useI18n();

interface Source {
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
