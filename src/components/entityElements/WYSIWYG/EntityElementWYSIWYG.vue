<template>
  <div
    :class="[
      'bg-neutral-0 rounded-t-md',
      { 'border-solid border-neutral-30 border-2': !displayInline },
      { 'animate-pulse': !editor },
    ]"
  >
    <div
      v-if="!displayInline"
      class="border-solid border-neutral-30 border-b-2 rounded-t-md flex flex-row p-2"
    >
      <h1 data-cy="entity-element-window-title" class="subtitle text-text-body">
        {{ t(element.label) }}
      </h1>
    </div>
    <div v-else class="py-2">
      <metadata-title :metadata="element" />
    </div>
    <div
      v-if="editor"
      id="wysiwyg-container"
      ref="editorNode"
      :class="['flex flex-col', { 'py-4': !displayInline }]"
    >
      <Transition>
        <WYSIWYGButtons
          v-if="isEdit"
          :editor="editor"
          :extensions="element.extensions"
          :displayInline="displayInline"
      /></Transition>
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from "@tiptap/vue-3";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";
import WYSIWYGButtons from "@/components/entityElements/WYSIWYG/WYSIWYGButtons.vue";
import type { WysiwygElement } from "@/generated-types/queries";
import {
  TypeModals,
  ValidationFields,
  WysiwygExtensions,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import useEdit from "@/composables/useEdit";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  openDetailModal,
  initializeTaggingExtension,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";

const props = withDefaults(
  defineProps<{
    formId: string;
    element: WysiwygElement;
    displayInline: boolean;
  }>(),
  {
    displayInline: false,
  },
);

const editor = ref<Editor | undefined>(undefined);
const { importEditorExtensions, getExtensionConfiguration } =
  useWYSIWYGEditor();
const { getForm, addEditableMetadataKeys } = useFormHelper();
const { updateModal } = useBaseModal();
const useEditHelper = useEdit(props.formId);
const { t } = useI18n();

const form = computed(() => getForm(props.formId));
const editorNode = ref<HTMLDivElement | undefined>(undefined);
const initialValue = ref<string>("");

const updateModalInfo = () => {
  updateModal(TypeModals.ElodyEntityTaggingModal, {
    element: props.element,
    editor: editor.value,
  });
};

const resetContent = () => {
  const content = editor.value?.options?.content;
  if (!content && content !== "") return;
  editor.value.commands.setContent(initialValue.value);
};

onMounted(async () => {
  document.addEventListener("discardEdit", resetContent);
  initialValue.value =
    form.value?.values.intialValues[props.element.metadataKey];
  addEditableMetadataKeys([props.element.metadataKey], props.formId);

  const customExtensions = [WysiwygExtensions.ElodyTaggingExtension];
  const extensionsToImport = props.element.extensions.filter(
    (extension: WysiwygExtensions) => !customExtensions.includes(extension),
  );

  const importedExtensions = await importEditorExtensions(extensionsToImport);
  const configuredExtensions = getExtensionConfiguration(
    extensionsToImport,
    importedExtensions,
  );

  const editorExtensions = [...configuredExtensions];
  if (
    props.element.extensions.includes(WysiwygExtensions.ElodyTaggingExtension)
  ) {
    const taggableEntityConfiguration =
      props.element.taggingConfiguration?.taggableEntityConfiguration;
    const taggingExtensions = await initializeTaggingExtension(
      taggableEntityConfiguration,
    );
    editorExtensions.push(...taggingExtensions);
  }

  editor.value = new Editor({
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl ${props.displayInline ? "mx-2 min-h-[125px]" : "mx-4 min-h-[250px]"} focus:outline-none border border-[rgba(0,58,82,0.6)] rounded-md  p-2`,
      },
      handleClickOn: (view, pos, node) => {
        if (node.attrs.entityId && !useEditHelper.isEdit) openDetailModal(node);
      },
    },
    parseOptions: {
      preserveWhitespace: true,
    },
    editable: useEditHelper.isEdit,
    content: initialValue.value,
    onUpdate({ editor }) {
      if (!form.value) return;
      form.value.setFieldValue(
        `${ValidationFields.IntialValues}.${props.element.metadataKey}`,
        editor.getHTML(),
      );
    },
  });

  if (props.element.taggingConfiguration) updateModalInfo();
});

onUnmounted(() => {
  document.removeEventListener("discardEdit", resetContent);
  editor.value?.destroy();
});

watch(
  () => useEditHelper.isEdit,
  () => {
    if (editor.value) {
      editor.value.setEditable(useEditHelper.isEdit);
    }
  },
  { immediate: true },
);

watch(
  () => form.value?.values.intialValues[props.element.metadataKey],
  () => {
    if (editor.value && !useEditHelper.isEdit) {
      initialValue.value =
        form.value?.values.intialValues[props.element.metadataKey];
      editor.value.commands.setContent(initialValue.value);
    }
  },
  { immediate: true },
);
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
