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
    <div v-if="editor" class="flex flex-col py-4">
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
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import useEdit from "@/composables/useEdit";
import { useBaseModal } from "@/composables/useBaseModal";

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
const initialValue = ref<string>("");

const updateModalInfo = () => {
  updateModal(TypeModals.ElodyEntityTaggingModal, {
    element: props.element,
    editor: editor.value,
  });
};

const updateModalInfo = () => {
  updateModal(TypeModals.ElodyEntityTaggingModal, {
    element: props.element,
  });
};

onMounted(async () => {
  initialValue.value =
    form.value?.values.intialValues[props.element.metadataKey];
  addEditableMetadataKeys([props.element.metadataKey], props.formId);
  if (props.element.taggingConfiguration) updateModalInfo();
  const importedExtensions = await importEditorExtensions(
    props.element.extensions,
  );
  const configuredExtensions = getExtensionConfiguration(
    props.element.extensions,
    importedExtensions,
  );

  editor.value = new Editor({
    extensions: [...configuredExtensions],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-4 focus:outline-none border border-[rgba(0,58,82,0.6)] rounded-md min-h-[250px] p-2",
      },
    },
    editable: isEdit.value,
    content: initialValue.value,
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

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
