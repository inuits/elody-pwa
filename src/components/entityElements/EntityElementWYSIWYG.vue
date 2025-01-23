<template>
  <div
    :class="[
      'border-solid border-neutral-30 border-2 bg-neutral-0 rounded-t-md min-h-[300px] relative',
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
    <div v-if="editor" class="p-2 h-full">
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
    content: ``,
  });
});

onUnmounted(() => {
  editor.value.destroy();
});
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  position: relative;
  height: 100%;

  &:first-child {
    margin-top: 0;
    border: solid 1px rgba(0, 58, 82, 0.6);
    border-radius: 0.5rem;
    height: 100%;

    &:focus {
      border: solid 1px rgba(0, 58, 82, 0.6);
      border-radius: 0.5rem;
    }
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  ul {
    list-style: circle;
  }

  ol {
    list-style: decimal;
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: "JetBrainsMono", monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }
}
</style>
