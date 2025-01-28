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
    <div v-if="editor" class="p-2 flex flex-col">
      <WYSIWYGButtons :editor="editor" :extensions="element.extensions" />
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from "@tiptap/vue-3";
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";
import WYSIWYGButtons from "@/components/entityElements/WYSIWYG/WYSIWYGButtons.vue";
import { ValidationFields, WysiwygElement } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import useEdit from "@/composables/useEdit";
import TagExtension from "./extensions/elodyTagEntityExtension/ElodyTaggingExtension";

const props = defineProps<{
  formId: string;
  element: WysiwygElement;
}>();

const editor = ref<Editor | undefined>(undefined);
const { importEditorExtensions, getExtensionConfiguration } =
  useWYSIWYGEditor();
const { getForm, addEditableMetadataKeys } = useFormHelper();
const { isEdit } = useEdit();
const { t } = useI18n();

const content = computed(() => editor.value?.getHTML());
const form = computed(() => getForm(props.formId));

onMounted(async () => {
  addEditableMetadataKeys([props.element.metadataKey], props.formId);
  const importedExtensions = await importEditorExtensions(
    props.element.extensions,
  );
  const configuredExtensions = getExtensionConfiguration(
    props.element.extensions,
    importedExtensions,
  );

  editor.value = new Editor({
    extensions: [...configuredExtensions, TagExtension],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none border border-[rgba(0,58,82,0.6)] rounded-md min-h-[250px] p-2",
      },
    },
    editable: isEdit.value,
    content: form.value?.values.intialValues[props.element.metadataKey] || "",
  });
});

onUnmounted(() => {
  editor.value.destroy();
});

watch(
  () => content.value,
  () => {
    if (form.value) {
      form.value.setFieldValue(
        `${ValidationFields.IntialValues}.${props.element.metadataKey}`,
        content.value,
      );
    }
  },
);

watch(
  () => isEdit.value,
  () => {
    if (editor.value) {
      editor.value.setEditable(isEdit.value);
    }
  },
);
</script>

<style></style>
