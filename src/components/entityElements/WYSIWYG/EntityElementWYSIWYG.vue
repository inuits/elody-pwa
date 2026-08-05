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
    <div v-else class="pl-2 py-2 flex gap-2 items-center">
      <metadata-title :metadata="element" />
      <WYSIGYGVirtualKeyboard
        v-if="
          wysiwygElementConfiguration.virtualKeyboardLayouts &&
          useEditHelper.isEdit
        "
        :editor="editor"
        :keyboardClass="element.metadataKey"
        :extra-layouts="wysiwygElementConfiguration.virtualKeyboardLayouts"
      />
      <WYSIWYGTransliterationToggle
        v-if="!useEditHelper.isEdit && showTransliterationToggle"
        :editor="editor"
        :transliteration-config="
          wysiwygElementConfiguration?.transliterationConfig
        "
      />
      <MultilingualLocaleSelector :field-key="element.metadataKey" />
    </div>
    <div
      v-if="editor"
      :data-wysiwyg-id="instanceId"
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
          :tagging="tagging"
        />
      </Transition>
      <div class="flex">
        <div
          v-if="wysiwygElementConfiguration.showLineNumbers"
          class="mt-[3px]"
        >
          <div
            class="text-lg"
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
      :editor-id="instanceId"
      :tagging="tagging"
    />
    <inline-tag-suggestion-dropdown
      v-if="tagging?.inlineSuggestion?.value"
      :suggestion="tagging?.inlineSuggestion?.value"
      :custom-query="element.taggingConfiguration?.customQuery"
      @pick="applyInlineSuggestion"
    />
    <div
      v-if="tagContextMenu"
      data-tag-context-menu
      class="fixed z-[9999] bg-white border border-neutral-30 rounded shadow-lg py-1"
      :style="{ left: tagContextMenu.x + 'px', top: tagContextMenu.y + 'px' }"
    >
      <button
        class="block w-full text-left px-3 py-1 hover:bg-neutral-20"
        @click="untagFromContextMenu"
      >
        {{ t("tagging.untag") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from "@tiptap/vue-3";
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";
import WYSIWYGButtons from "@/components/entityElements/WYSIWYG/WYSIWYGButtons.vue";
import {
  ValidationFields,
  type WysiwygElement,
  type WysiwygElementConfiguration,
  WysiwygExtensions,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { openDetailModal } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import {
  useElodyTagging,
  type ElodyTaggingInstance,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/useElodyTagging";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import MultilingualLocaleSelector from "@/components/metadata/MultilingualLocaleSelector.vue";
import TagEntityModal from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/TagEntityModal.vue";
import InlineTagSuggestionDropdown from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/InlineTagSuggestionDropdown.vue";
import WYSIGYGVirtualKeyboard from "@/components/entityElements/WYSIWYG/WYSIGYGVirtualKeyboard.vue";
import WYSIWYGTransliterationToggle from "@/components/entityElements/WYSIWYG/WYSIWYGTransliterationToggle.vue";
import type { HTMLContent } from "@tiptap/core";
import {
  getMultilingualProvideKey,
  type MultilingualFieldProvide,
} from "@/composables/useMultilingualField";
import { isTransliterationEnabledValue } from "@/composables/useTransliteration";

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
const useEditHelper = useEditMode(props.formId);
const { t } = useI18n();

// Stable across remounts, and unique per editor on the page: scopes this editor's
// injected tag styling and identifies it as the owner of the shared tagging modal.
const instanceId = `${props.formId}-${props.element.metadataKey}`;
// shallowRef, not ref: ref() runs reactive conversion over the stored object, which
// deeply UNWRAPS the refs the instance exposes — tagging.value.inlineSuggestion would
// become the raw value instead of a Ref, so `.value` on it is undefined (or a crash
// when it holds null). shallowRef keeps the instance exactly as the composable built it.
const tagging = shallowRef<ElodyTaggingInstance | undefined>(undefined);

const form = computed(() => getForm(props.formId));
const editorNode = ref<HTMLDivElement | undefined>(undefined);
const initialValue = ref<string>("");
const editorLoaded = ref<boolean>(false);
const paragraphAmount = ref<number>(0);
const wysiwygElementConfiguration = ref<
  WysiwygElementConfiguration | undefined
>(props.element.wysiwygElementConfiguration || undefined);

const showTransliterationToggle = computed(() => {
  const config = wysiwygElementConfiguration.value?.transliterationConfig;
  if (!config) return false;
  const gatingKey = config.enabledByProperty;
  if (!gatingKey) return true;
  return isTransliterationEnabledValue(
    form.value?.values?.intialValues?.[gatingKey],
  );
});

const multilingual = inject<MultilingualFieldProvide>(
  getMultilingualProvideKey(props.element.metadataKey),
  undefined,
);
const isSwappingLocale = ref(false);

const tagContextMenu = ref<{
  x: number;
  y: number;
  pos: number;
  nodeSize: number;
} | null>(null);

const closeTagContextMenu = () => {
  tagContextMenu.value = null;
};

const untagFromContextMenu = () => {
  if (!tagContextMenu.value || !editor.value) return;
  const { pos, nodeSize } = tagContextMenu.value;
  editor.value
    .chain()
    .focus()
    .setTextSelection({ from: pos, to: pos + nodeSize })
    .untagSelectedText()
    .run();
  closeTagContextMenu();
};

const handleDocumentClick = (event: MouseEvent) => {
  if (!tagContextMenu.value) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-tag-context-menu]")) return;
  closeTagContextMenu();
};

// The inline flow inserts the tag node only. It must NOT write a relation the way the
// toolbar flow does, because that writes onto the route entity's form — tagging a user
// in a comment composer would land the relation on the Work.
const applyInlineSuggestion = (entity: any, label: string) => {
  tagging.value?.applyInlineSuggestion(editor.value, entity, label);
};

const resetContent = () => {
  const content = editor.value?.options?.content;
  if (!content && content !== "") return;
  editor.value.commands.setContent(initialValue.value);
};

onMounted(async () => {
  document.addEventListener("discardEdit", resetContent);
  document.addEventListener("mousedown", handleDocumentClick);
  initialValue.value = multilingual?.isEnabled?.value
    ? multilingual.currentValue.value
    : form.value?.values.intialValues[props.element.metadataKey];
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
    tagging.value = await useElodyTagging(
      instanceId,
      props.element.taggingConfiguration?.taggableEntityConfiguration,
    );
    editorExtensions.push(...tagging.value.extensions);
  }

  paragraphAmount.value = countLinesOfContent(initialValue.value);

  editor.value = new Editor({
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class: `prose prose-sm ${props.displayInline ? "mx-2 min-h-[125px]" : "mx-4 min-h-[250px]"} focus:outline-none border border-[rgba(0,58,82,0.6)] rounded-md  p-2  ${wysiwygElementConfiguration.value?.customEditorStyles || ""} max-w-full!`,
      },
      handleClickOn: (_view, _pos, node, nodePos, event) => {
        if (!node.attrs.entityId) return false;
        if (!useEditHelper.isEdit) {
          openDetailModal(node, tagging.value?.configuration?.value ?? []);
          return false;
        }
        tagContextMenu.value = {
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
          pos: nodePos,
          nodeSize: node.nodeSize,
        };
        return true;
      },
    },
    parseOptions: {
      preserveWhitespace: true,
    },
    editable: useEditHelper.isEdit,
    content: initialValue.value,
    onUpdate({ editor }) {
      if (isSwappingLocale.value) return;
      const htmlContent = editor.getHTML() as HTMLContent;
      paragraphAmount.value = countLinesOfContent(htmlContent);
      if (multilingual?.isEnabled?.value) {
        multilingual.updateValue(htmlContent);
        return;
      }
      if (!form.value) return;
      form.value.setFieldValue(
        `${ValidationFields.IntialValues}.${props.element.metadataKey}`,
        htmlContent,
      );
    },
  });
  // The editor is no longer registered on the modal at mount time — `openTagModal`
  // sends it with the payload instead, so several editors can coexist without the
  // last-mounted one claiming the modal.
  editorLoaded.value = true;
});

onUnmounted(() => {
  document.removeEventListener("discardEdit", resetContent);
  document.removeEventListener("mousedown", handleDocumentClick);
  editor.value?.destroy();
  tagging.value?.destroy();
  editorLoaded.value = false;
});

watch(
  () => useEditHelper.isEdit,
  (isEdit: boolean) => {
    if (editor.value) editor.value.setEditable(isEdit);
  },
  { immediate: true },
);

watch(
  () => form.value?.values.intialValues[props.element.metadataKey],
  () => {
    if (editor.value && !useEditHelper.isEdit) {
      const neValue = multilingual?.isEnabled?.value
        ? multilingual.currentValue.value
        : form.value?.values.intialValues[props.element.metadataKey];
      initialValue.value = neValue;
      editor.value.commands.setContent(neValue);
    }
  },
  { immediate: true },
);

if (multilingual) {
  watch(multilingual.selectedLocale, () => {
    if (!editor.value) return;
    isSwappingLocale.value = true;
    const newContent = multilingual.currentValue.value || "";
    editor.value.commands.setContent(newContent);
    paragraphAmount.value = countLinesOfContent(newContent);
    isSwappingLocale.value = false;
  });
}
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
  @apply block m-0;
}
</style>
