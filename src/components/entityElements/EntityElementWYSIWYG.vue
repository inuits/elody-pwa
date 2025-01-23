<template>
  <div
    :class="[
      'border-solid border-neutral-30 border-2 bg-neutral-0 rounded-t-md',
      { 'animate-pulse': !editor },
    ]"
  >
    <div
      class="border-solid border-neutral-30 border-b-2 rounded-t-md flex flex-row p-2"
    >
      <h1 data-cy="entity-element-window-title" class="subtitle text-text-body">
        {{ t(element.label) }}
      </h1>
    </div>
    <div v-if="editor" class="p-2 flex flex-col min-h-[300px]">
      <WYSIWYGButtons :editor="editor" :extensions="element.extensions" />
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from "@tiptap/vue-3";
import { ref, onMounted, onUnmounted } from "vue";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";
import WYSIWYGButtons from "@/components/WYSIWYGButtons.vue";
import { WysiwygElement } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  element: WysiwygElement;
}>();

const editor = ref<Editor | undefined>(undefined);
const { importEditorExtensions, getExtensionConfiguration } =
  useWYSIWYGEditor();
const { t } = useI18n();

onMounted(async () => {
  const importedExtensions = await importEditorExtensions(
    props.element.extensions,
  );
  const configuredExtensions = getExtensionConfiguration(
    props.element.extensions,
    importedExtensions,
  );

  editor.value = new Editor({
    extensions: configuredExtensions,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
    content: ``,
  });
});

onUnmounted(() => {
  editor.value.destroy();
});
</script>

<style></style>
