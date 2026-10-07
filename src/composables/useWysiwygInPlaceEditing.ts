import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { Collection } from "@/generated-types/queries";
import { useEditScope } from "@/composables/useEditScope";
import { buildMetadataInput, saveScope } from "@/composables/useScopedSave";

// Per-field editing for a WYSIWYG field: the field is its own edit scope, and
// saving sends only its key (with the selected language for a multilingual
// field). The editor stays mounted; editing only toggles whether it accepts
// input. See docs/design-system/patterns/per-field-editing.md.

type WysiwygEditor = {
  getHTML: () => string;
  setEditable: (editable: boolean) => void;
  commands: {
    setContent: (content: string) => unknown;
    focus: (position?: "end") => unknown;
  };
};

export type WysiwygInPlaceOptions = {
  scopeId: () => string;
  metadataKey: () => string;
  entityId: () => string;
  collection: () => Collection;
  canEdit: () => boolean;
  getEditor: () => WysiwygEditor | undefined;
  // The stored value, and how to put it back on cancel.
  readValue: () => string;
  writeValue: (value: string) => void;
  locale: () => string | undefined;
  onSaved?: (value: string) => void;
  // The element itself; clicks outside it close an unchanged editor.
  getRoot?: () => HTMLElement | null | undefined;
};

// Clicks in these belong to the editor: its modals, menus and suggestions.
const OVERLAY_SELECTOR =
  "dialog, [role='dialog'], .menu, .multiselect-dropdown, [role='listbox'], [role='tooltip'], [data-wysiwyg-overlay]";

export const useWysiwygInPlaceEditing = (options: WysiwygInPlaceOptions) => {
  const { t, te } = useI18n();
  const translated = (key: string, fallback: string): string =>
    te(key) ? t(key) : fallback;
  const { requestOpen, release } = useEditScope();

  const isEditing = ref<boolean>(false);
  const saving = ref<boolean>(false);
  const error = ref<string | undefined>(undefined);
  const savedAnnouncement = ref<string>("");
  const snapshotHtml = ref<string>("");
  const currentHtml = ref<string>("");
  let storedBeforeEditing = "";

  const isDirty = computed(
    () => isEditing.value && currentHtml.value !== snapshotHtml.value,
  );

  const notifyChange = () => {
    const editor = options.getEditor();
    if (isEditing.value && editor) currentHtml.value = editor.getHTML();
  };

  const handleOutsideMousedown = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target || options.getRoot?.()?.contains(target)) return;
    if (target.closest?.(OVERLAY_SELECTOR)) return;
    if (!isDirty.value) close();
  };

  const close = () => {
    isEditing.value = false;
    error.value = undefined;
    options.getEditor()?.setEditable(false);
    document.removeEventListener("mousedown", handleOutsideMousedown, true);
    release(options.scopeId());
  };

  const cancel = () => {
    if (!isEditing.value) return;
    options.writeValue(storedBeforeEditing);
    options.getEditor()?.commands.setContent(storedBeforeEditing);
    close();
  };

  const save = async (): Promise<void> => {
    if (!isEditing.value || saving.value) return;
    if (!isDirty.value) {
      close();
      return;
    }
    const value = currentHtml.value;
    saving.value = true;
    error.value = undefined;
    try {
      await saveScope({
        entityId: options.entityId(),
        collection: options.collection(),
        formInput: buildMetadataInput(
          options.metadataKey(),
          value,
          options.locale(),
        ),
      });
      options.onSaved?.(value);
      savedAnnouncement.value = translated("inline-edit.saved", "Saved");
      close();
    } catch {
      error.value = translated(
        "inline-edit.save-failed",
        "Saving failed, try again",
      );
    } finally {
      saving.value = false;
    }
  };

  const start = () => {
    const editor = options.getEditor();
    if (!editor || isEditing.value || !options.canEdit()) return;
    const opened = requestOpen({
      id: options.scopeId(),
      isDirty: () => isDirty.value,
      focus: () => options.getEditor()?.commands.focus(),
      close,
      save: async () => {
        await save();
        return !isEditing.value;
      },
      discard: cancel,
    });
    if (!opened) return;
    storedBeforeEditing = options.readValue() ?? "";
    snapshotHtml.value = editor.getHTML();
    currentHtml.value = snapshotHtml.value;
    savedAnnouncement.value = "";
    error.value = undefined;
    isEditing.value = true;
    editor.setEditable(true);
    editor.commands.focus("end");
    if (options.getRoot)
      document.addEventListener("mousedown", handleOutsideMousedown, true);
  };

  // Ctrl/Cmd+Enter saves, Escape cancels. A plain Enter is a new line, and an
  // Escape the editor already handled (closing a suggestion), or a key
  // pressed in one of its dialogs, is left alone.
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isEditing.value || event.defaultPrevented) return;
    if ((event.target as HTMLElement | null)?.closest?.(OVERLAY_SELECTOR))
      return;
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      save();
    }
  };

  const dispose = () => {
    document.removeEventListener("mousedown", handleOutsideMousedown, true);
    release(options.scopeId());
  };

  return {
    isEditing,
    isDirty,
    saving,
    error,
    savedAnnouncement,
    start,
    cancel,
    save,
    notifyChange,
    handleKeydown,
    dispose,
  };
};
