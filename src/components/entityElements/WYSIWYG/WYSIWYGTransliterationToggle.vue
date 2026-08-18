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
const originalEditorClass = ref<string>("");

const ITALIC_CLASS = "italic";
const NON_ITALIC_TRANSLITERATION_KEYS = new Set(["arabic"]);

type TransliterationItem = {
  label: string;
  mapping: Record<string, string> | null;
  insertSpaces?: boolean | null;
};

const transliterationItems = computed(() => {
  if (!props.transliterationConfig) return {} as Record<string, TransliterationItem>;
  // Keep only the mapping items (objects); skip __typename and scalar control
  // fields such as `enabledByProperty`.
  return Object.fromEntries(
    Object.entries(props.transliterationConfig).filter(
      ([key, value]) =>
        key !== "__typename" && value !== null && typeof value === "object",
    ),
  ) as Record<string, TransliterationItem>;
});

const hasInitialItalicClass = computed(() =>
  originalEditorClass.value.split(/\s+/).includes(ITALIC_CLASS),
);

function getEditorClass(): string {
  const attributes = props.editor?.options?.editorProps?.attributes;
  return typeof attributes === "object" ? (attributes.class ?? "") : "";
}

function setEditorItalic(shouldHaveItalic: boolean): void {
  if (!props.editor) return;
  const editorProps = props.editor.options.editorProps ?? {};
  const attributes = typeof editorProps.attributes === "object" ? editorProps.attributes : {};
  const classes = getEditorClass().split(/\s+/).filter(Boolean);
  const nextClasses = shouldHaveItalic
    ? classes.includes(ITALIC_CLASS)
      ? classes
      : [...classes, ITALIC_CLASS]
    : classes.filter((className) => className !== ITALIC_CLASS);

  props.editor.setOptions({
    editorProps: {
      ...editorProps,
      attributes: { ...attributes, class: nextClasses.join(" ") },
    },
  });
}

onMounted(() => {
  if (props.editor) {
    originalContent.value = props.editor.getHTML();
    originalEditorClass.value = getEditorClass();
  }
});

onUnmounted(() => {
  if (activeKey.value === null) return;
  if (originalContent.value) {
    props.editor?.commands.setContent(originalContent.value);
  }
  if (hasInitialItalicClass.value) {
    setEditorItalic(true);
  }
});

watch(activeKey, (key) => {
  if (!props.editor || !originalContent.value) return;
  const item = key ? transliterationItems.value[key] : null;
  const nextContent = item?.mapping
    ? transliterateHtml(originalContent.value, item.mapping, item.insertSpaces ?? false)
    : originalContent.value;

  props.editor.commands.setContent(nextContent);

  if (hasInitialItalicClass.value) {
    const isNonItalicScript = key !== null && NON_ITALIC_TRANSLITERATION_KEYS.has(key);
    setEditorItalic(!isNonItalicScript);
  }
});
</script>
