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
    <div v-if="editor" ref="editorNode" class="flex flex-col py-4">
      <Transition>
        <WYSIWYGButtons
          v-if="isEdit"
          :editor="editor"
          :extensions="element.extensions"
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
import {
  TypeModals,
  ValidationFields,
  WysiwygElement,
  WysiwygExtensions,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import useEdit from "@/composables/useEdit";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  createGlobalCommandsExtension,
  createTipTapNodeExtension,
  nodeMapping,
  setNodeMapping,
  setTaggedEntityInfoTooltip,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";

const props = defineProps<{
  formId: string;
  element: WysiwygElement;
}>();

const editor = ref<Editor | undefined>(undefined);
const { importEditorExtensions, getExtensionConfiguration } =
  useWYSIWYGEditor();
const { getForm, addEditableMetadataKeys } = useFormHelper();
const { updateModal } = useBaseModal();
const { isEdit } = useEdit();
const { t } = useI18n();

const content = computed(() => editor.value?.getHTML());
const form = computed(() => getForm(props.formId));
const editorNode = ref<HTMLDivElement | undefined>(undefined);
const initialValue = ref<string>("");

const updateModalInfo = () => {
  updateModal(TypeModals.ElodyEntityTaggingModal, {
    element: props.element,
    editor: editor.value,
  });
};

onMounted(async () => {
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
    setNodeMapping(props.element.taggingConfiguration?.customNodeMapping);
    editorExtensions.push(
      ...nodeMapping.value.map((nodeMap) => createTipTapNodeExtension(nodeMap)),
      createGlobalCommandsExtension,
    );
  }

  console.log(editorExtensions);

  editor.value = new Editor({
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-4 focus:outline-none border border-[rgba(0,58,82,0.6)] rounded-md min-h-[250px] p-2",
      },
    },
    parseOptions: {
      preserveWhitespace: true,
    },
    editable: isEdit.value,
    content: initialValue.value,
    onCreate: () => {
      setTaggedEntityInfoTooltip(editorNode.value, true);
    },
    onUpdate: () => {
      setTaggedEntityInfoTooltip(editorNode.value, false);
      setTaggedEntityInfoTooltip(editorNode.value);
    },
    onDestroy: () => {
      setTaggedEntityInfoTooltip(editorNode.value, false);
    },
  });

  if (props.element.taggingConfiguration) updateModalInfo();
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
    if (!isEdit.value) setTaggedEntityInfoTooltip(editorNode.value, false);
    if (editor.value) {
      editor.value.setEditable(isEdit.value);
      if (!isEdit.value) {
        editor.value.commands.setContent(
          form.value?.values.intialValues[props.element.metadataKey],
        );
      }
    }
  },
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

w {
  @apply bg-accent-normal text-white rounded-md px-1 cursor-pointer;
}
</style>
