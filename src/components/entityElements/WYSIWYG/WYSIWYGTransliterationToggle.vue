<template>
  <div v-if="Object.keys(transliterationItems).length > 0"
    class="flex rounded border-solid border-neutral-30 border overflow-hidden select-none text-sm">
    <button v-for="(item, key, index) in transliterationItems" :key="key" :class="[
      'px-2 py-0.5 cursor-pointer transition-colors',
      index > 0 ? 'border-l border-neutral-30' : '',
      activeKey === key
        ? 'bg-accent-normal text-neutral-white'
        : 'bg-background-light text-text-body',
    ]" @click="activeKey = String(key)">
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { Editor } from "@tiptap/vue-3";
import { useTransliteration } from "@/composables/useTransliteration";
import type { WysiwygTransliterationConfig } from "@/generated-types/queries";

const props = defineProps<{
  editor: Editor | undefined;
  transliterationConfig: WysiwygTransliterationConfig | null | undefined;
}>();

const { transliterateHtml } = useTransliteration();

const activeKey = ref<string | null>(null);
const originalContent = ref<string>("");

const transliterationItems = computed(() => {
  if (!props.transliterationConfig) return {} as Record<string, { label: string; mapping: Record<string, string> | null }>;
  return Object.fromEntries(
    Object.entries(props.transliterationConfig).filter(([key]) => key !== "__typename"),
  ) as Record<string, { label: string; mapping: Record<string, string> | null }>;
});

onMounted(() => {
  if (props.editor) {
    originalContent.value = props.editor.getHTML();
  }
});

onUnmounted(() => {
  if (activeKey.value !== null && originalContent.value) {
    props.editor?.commands.setContent(originalContent.value);
  }
});

watch(activeKey, (key) => {
  if (!props.editor || !originalContent.value) return;
  const item = key ? transliterationItems.value[key] : null;
  if (item?.mapping) {
    props.editor.commands.setContent(transliterateHtml(originalContent.value, item.mapping));
  } else {
    props.editor.commands.setContent(originalContent.value);
  }
});
</script>
