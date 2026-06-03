<template>
  <teleport to="body">
    <div
      data-testid="info-panel"
      role="dialog"
      class="fixed bottom-[30px] left-1/2 -translate-x-1/2 z-tooltip flex max-h-[60vh] w-[min(90vw,48rem)] flex-col rounded-md border border-neutral-30 bg-background-light shadow-lg"
    >
      <div
        class="flex items-center justify-between border-b border-neutral-30 p-3"
      >
        <h2 data-testid="info-panel-title" class="subtitle text-text-body">
          {{ t(title) }}
        </h2>
        <button
          type="button"
          data-testid="info-panel-close-button"
          class="cursor-pointer text-text-light"
          :aria-label="t('close')"
          @click="emit('close')"
        >
          <unicon :name="Unicons.Close.name" height="20" />
        </button>
      </div>
      <div class="prose prose-sm max-w-full overflow-y-auto p-4">
        <sanitized-html :content="content" :mode="SanitizeMode.Html" />
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import { SanitizeMode } from "@/generated-types/queries";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import { useI18n } from "vue-i18n";

defineProps<{
  title: string;
  content: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { t } = useI18n();
</script>
