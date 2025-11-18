<template>
  <div
    v-if="editorLoaded"
    :class="[
      'bg-background-light rounded-t-md relative',
      { 'border-solid border-neutral-30 border-2': !displayInline },
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
    <div v-else class="pl-2 py-2 flex gap-2">
      <metadata-title :metadata="element" />
      <WYSIGYGVirtualKeyboard
        v-if="element.virtualKeyboardLayouts && useEditHelper.isEdit"
        :editor="editor"
        :keyboardClass="element.metadataKey"
        :extra-layouts="element?.virtualKeyboardLayouts"
      />
    </div>
    <div
      v-if="editor"
      id="wysiwyg-container"
      ref="editorNode"
      :class="['flex flex-col', { 'py-4': !displayInline }]"
    >
      <Transition>
        <WYSIWYGButtons
          v-if="useEditHelper.isEdit"
          :formId="formId"
          :editor="editor"
          :extensions="element.extensions"
          :displayInline="displayInline"
      /></Transition>
      <div class="flex">
        <div v-if="element.showLineNumbers" class="mt-[3px]">
          <div
            class="text-xl mt-3"
            v-for="n in paragraphAmount"
            :key="`${element.label}-paragraph-${n}`"
          >
            {{ n }}.
          </div>
        </div>
        <div class="w-full"><editor-content :editor="editor" /></div>
      </div>
    </div>
    <TagEntityModal
      v-if="
        element.extensions.includes(WysiwygExtensions.ElodyTaggingExtension)
      "
      :element="element"
      :editor="editor"
    />
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
  type WysiwygElement,
  type WysiwygElementConfiguration,
  WysiwygExtensions,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import {
  initializeTaggingExtension,
  openDetailModal,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import TagEntityModal from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/TagEntityModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import WYSIGYGVirtualKeyboard from "@/components/entityElements/WYSIWYG/WYSIGYGVirtualKeyboard.vue";
import type { HTMLContent } from "@tiptap/core";

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
const {
  importEditorExtensions,
  getExtensionConfiguration,
  countLinesOfContent,
} = useWYSIWYGEditor();
const { getForm, addEditableMetadataKeys } = useFormHelper();
const { updateModal } = useBaseModal();
const useEditHelper = useEditMode(props.formId);
const { t } = useI18n();

const form = computed(() => getForm(props.formId));
const editorNode = ref<HTMLDivElement | undefined>(undefined);
const initialValue = ref<string>("");
const editorLoaded = ref<boolean>(false);
const paragraphAmount = ref<number>(0);
const wysiwygElementConfiguration = ref<
  WysiwygElementConfiguration | undefined
>(props.element.wysiwygElementConfiguration || undefined);

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

  paragraphAmount.value = countLinesOfContent(initialValue.value);

  editor.value = new Editor({
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl ${props.displayInline ? "mx-2 min-h-[125px]" : "mx-4 min-h-[250px]"} focus:outline-none border border-[rgba(0,58,82,0.6)] rounded-md  p-2 whitespace-nowrap! overflow-x-auto! ${wysiwygElementConfiguration.value?.styleConfiguration?.displayTextItalic ? "italic" : ""}`,
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
      const htmlContent = editor.getHTML() as HTMLContent;
      paragraphAmount.value = countLinesOfContent(htmlContent);
      if (!form.value) return;
      form.value.setFieldValue(
        `${ValidationFields.IntialValues}.${props.element.metadataKey}`,
        htmlContent,
      );
    },
  });
  updateModal(TypeModals.ElodyEntityTaggingModal, { editor: editor.value });
  editorLoaded.value = true;
});

onUnmounted(() => {
  document.removeEventListener("discardEdit", resetContent);
  editor.value?.destroy();
  editorLoaded.value = false;
});

watch(
  () => useEditHelper.isEdit,
  (isEdit: boolean) => {
    if (editor.value) {
      editor.value.setEditable(isEdit);
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
@reference "tailwindcss";

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.tiptap p {
  @apply inline m-0;
}
</style>
