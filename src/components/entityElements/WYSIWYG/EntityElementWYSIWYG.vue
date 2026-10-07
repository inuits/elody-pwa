<template>
  <div
    v-if="editorLoaded"
    ref="rootRef"
    data-cy="wysiwyg-field"
    @keydown="handleInPlaceKeydown"
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
      <WYSIWYGInPlaceActions
        class="ml-auto"
        :label="t(element.label)"
        :can-edit="canEditInPlace"
        :editing="isEditingInPlace"
        :dirty="inPlaceDirty"
        :saving="inPlaceSaving"
        @edit="startEditing"
        @save="saveInPlace"
        @cancel="cancelInPlace"
      />
    </div>
    <div v-else class="pl-2 py-2 flex gap-2 items-center">
      <metadata-title :metadata="element" :is-locked="isLocked" />
      <WYSIGYGVirtualKeyboard
        v-if="
          wysiwygElementConfiguration.virtualKeyboardLayouts &&
          isEditable &&
          !isLocked
        "
        :editor="editor"
        :keyboardClass="element.metadataKey"
        :extra-layouts="wysiwygElementConfiguration.virtualKeyboardLayouts"
      />
      <WYSIWYGTransliterationToggle
        v-if="
          !useEditHelper.isEdit &&
          !isEditingInPlace &&
          !preparingInPlaceEdit &&
          showTransliterationToggle
        "
        :editor="editor"
        :transliteration-config="
          wysiwygElementConfiguration?.transliterationConfig
        "
      />
      <MultilingualLocaleSelector
        v-if="!isEditingInPlace"
        :field-key="element.metadataKey"
      />
      <!-- While editing, the language is fixed: the edit scope is the field
           in this language. -->
      <span
        v-else-if="editingLocaleLabel"
        data-cy="wysiwyg-editing-locale"
        class="rounded-chip bg-chip-neutral-bg text-chip-neutral-text text-chip font-bold p-(--chip-padding)"
        >{{ editingLocaleLabel }}</span
      >
      <WYSIWYGInPlaceActions
        :label="t(element.label)"
        :can-edit="canEditInPlace"
        :editing="isEditingInPlace"
        :dirty="inPlaceDirty"
        :saving="inPlaceSaving"
        @edit="startEditing"
        @save="saveInPlace"
        @cancel="cancelInPlace"
      />
    </div>
    <div
      v-if="editor"
      :data-wysiwyg-id="instanceId"
      ref="editorNode"
      data-testid="locked-field-view-container"
      :class="[
        'flex flex-col relative',
        { 'py-4': !displayInline },
        { 'locked-field': isLocked },
        { 'wysiwyg-editable-at-rest': canEditInPlace && !isEditingInPlace },
      ]"
      @click="onContentClick"
    >
      <locked-field-indicator
        :is-locked="isLocked"
        :tooltip="element.lockedTooltip"
      />
      <Transition>
        <WYSIWYGButtons
          v-if="isEditable && !isLocked"
          :formId="formId"
          :editing="isEditingInPlace"
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
      <p
        v-if="inPlaceError"
        role="alert"
        class="text-hint text-danger px-2 pt-1"
      >
        {{ inPlaceError }}
      </p>
      <p
        v-if="isEditingInPlace"
        data-cy="wysiwyg-hint"
        class="text-hint text-text-muted px-2 pt-1"
      >
        {{ inPlaceHint }}
      </p>
      <p role="status" class="sr-only">{{ savedAnnouncement }}</p>
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
      data-wysiwyg-overlay
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
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  unref,
  watch,
} from "vue";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";
import WYSIWYGButtons from "@/components/entityElements/WYSIWYG/WYSIWYGButtons.vue";
import {
  Collection,
  ValidationFields,
  type WysiwygElement,
  type WysiwygElementConfiguration,
  WysiwygExtensions,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import { useFieldLock } from "@/composables/useFieldLock";
import { useEditMode } from "@/composables/useEdit";
import { openDetailModal } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import {
  useElodyTagging,
  type ElodyTaggingInstance,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/useElodyTagging";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import LockedFieldIndicator from "@/components/metadata/LockedFieldIndicator.vue";
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
import WYSIWYGInPlaceActions from "@/components/entityElements/WYSIWYG/WYSIWYGInPlaceActions.vue";
import { canEditWysiwygInPlace } from "@/components/metadata/fieldEditability";
import { useWysiwygInPlaceEditing } from "@/composables/useWysiwygInPlaceEditing";

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
const { t, te } = useI18n();

const { isLocked } = useFieldLock(
  () => props.formId,
  () => props.element.metadataKey,
);

const instanceId = `${props.formId}-${props.element.metadataKey}`;
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

// Per-field editing (docs/design-system/components/wysiwyg-field.md): outside
// the legacy page-wide edit mode the field is read-only until its own edit
// scope opens. Saving sends only this field's key.
const rootRef = ref<HTMLElement | undefined>(undefined);
const fieldPath = `${ValidationFields.IntialValues}.${props.element.metadataKey}`;
const entityFormData = inject<
  | {
      id?: string;
      collection?: Collection;
      onSaved?: (savedEntity: unknown) => void;
    }
  | undefined
>("entityFormData", undefined);
const entityCanUpdate = computed<boolean>(() =>
  ["edit", "edit-delete"].includes(
    unref(useEditHelper.permittedEditMode as any) as string,
  ),
);
const canEditInPlace = computed<boolean>(() =>
  canEditWysiwygInPlace({
    locked: isLocked.value,
    entityCanUpdate: entityCanUpdate.value,
    pageInEditMode: !!useEditHelper.isEdit,
  }),
);
const multilingualEnabled = (): boolean => !!multilingual?.isEnabled?.value;
const inPlace = useWysiwygInPlaceEditing({
  scopeId: () => `${props.formId}:${props.element.metadataKey}`,
  metadataKey: () => props.element.metadataKey,
  entityId: () => entityFormData?.id || props.formId,
  collection: () => entityFormData?.collection ?? Collection.Entities,
  canEdit: () => canEditInPlace.value,
  getEditor: () => editor.value,
  readValue: () =>
    multilingualEnabled()
      ? multilingual!.currentValue.value
      : (form.value?.values.intialValues[props.element.metadataKey] ?? ""),
  writeValue: (value: string) =>
    multilingualEnabled()
      ? multilingual!.updateValue(value)
      : form.value?.setFieldValue(fieldPath, value),
  locale: () =>
    multilingualEnabled() ? multilingual!.selectedLocale.value : undefined,
  onSaved: (value: string, savedEntity: unknown) => {
    initialValue.value = value;
    form.value?.resetField(fieldPath, { value });
    if (savedEntity) entityFormData?.onSaved?.(savedEntity);
  },
  getRoot: () => rootRef.value,
});
const {
  isEditing: isEditingInPlace,
  isDirty: inPlaceDirty,
  saving: inPlaceSaving,
  error: inPlaceError,
  savedAnnouncement,
  save: saveInPlace,
  cancel: cancelInPlace,
  handleKeydown: handleInPlaceKeydown,
} = inPlace;
const isEditable = computed<boolean>(
  () => !!useEditHelper.isEdit || isEditingInPlace.value,
);
const inPlaceHint = computed<string>(() =>
  te("inline-edit.hint-textarea")
    ? t("inline-edit.hint-textarea")
    : "Ctrl+Enter saves · Esc cancels",
);
const editingLocaleLabel = computed<string | undefined>(() => {
  if (!multilingualEnabled()) return undefined;
  const locale = multilingual!.selectedLocale.value;
  return (
    unref(multilingual!.localeOptions).find(
      (option: { value: string }) => option.value === locale,
    )?.label ?? locale
  );
});

// The transliteration toggle only transforms the view, and restores the
// original content when it unmounts; it goes before editing starts so the
// edit begins from the stored text.
const preparingInPlaceEdit = ref<boolean>(false);
const startEditing = async () => {
  if (!canEditInPlace.value || isEditingInPlace.value) return;
  preparingInPlaceEdit.value = true;
  await nextTick();
  inPlace.start();
  preparingInPlaceEdit.value = false;
};
// Clicking the content opens editing too, except on a tagged entity (which
// opens its detail) or while selecting text.
const onContentClick = (event: MouseEvent) => {
  if (!canEditInPlace.value || isEditingInPlace.value) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest?.("[data-entity-id]")) return;
  if (window.getSelection?.()?.toString()) return;
  startEditing();
};

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
        class: `prose prose-sm ${props.displayInline ? "mx-2 min-h-[125px]" : "mx-4 min-h-[250px]"} border border-border-default rounded-input p-2 ${wysiwygElementConfiguration.value?.customEditorStyles || ""} max-w-full!`,
      },
      handleClickOn: (_view, _pos, node, nodePos, event) => {
        if (!node.attrs.entityId) return false;
        if (!isEditable.value || isLocked.value) {
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
    editable: useEditHelper.isEdit && !isLocked.value,
    content: initialValue.value,
    onUpdate({ editor }) {
      if (isSwappingLocale.value) return;
      inPlace.notifyChange();
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
  editorLoaded.value = true;
});

onUnmounted(() => {
  document.removeEventListener("discardEdit", resetContent);
  document.removeEventListener("mousedown", handleDocumentClick);
  editor.value?.destroy();
  tagging.value?.destroy();
  editorLoaded.value = false;
  inPlace.dispose();
});

watch(
  [() => useEditHelper.isEdit, isLocked],
  ([isEdit, locked]) => {
    if (editor.value)
      editor.value.setEditable(
        (!!isEdit || isEditingInPlace.value) && !locked,
      );
  },
  { immediate: true },
);

watch(
  () => form.value?.values.intialValues[props.element.metadataKey],
  () => {
    if (editor.value && !useEditHelper.isEdit && !isEditingInPlace.value) {
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
  unicode-bidi: plaintext;
}
</style>

<style scoped>
.locked-field :deep(.ProseMirror) {
  background: var(--color-background-normal) !important;
}

.wysiwyg-editable-at-rest :deep(.ProseMirror) {
  cursor: pointer;
}

.wysiwyg-editable-at-rest :deep(.ProseMirror:hover) {
  background: var(--color-surface-editable-hover);
}
</style>
