import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { Collection } from "@/generated-types/queries";
import { useEditScope } from "@/composables/useEditScope";
import { buildMetadataInput, saveScope } from "@/composables/useScopedSave";
import { singleFlight } from "@/composables/useInPlaceScope";

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
  // Gets the saved value and the saved entity the server returned.
  onSaved?: (value: string, savedEntity: unknown) => void;
  // The element itself; leaving it saves a changed editor, closes an
  // unchanged one.
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

  const isOutside = (target: HTMLElement): boolean =>
    !options.getRoot?.()?.contains(target) &&
    !target.closest?.(OVERLAY_SELECTOR);
  // Leaving the field (a click or Tab elsewhere) saves it; save closes an
  // unchanged editor.
  const handleOutsideMousedown = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target && isOutside(target)) save();
  };
  // Focus going nowhere (a closed dialog, another window) isn't leaving.
  const handleFocusout = (event: FocusEvent) => {
    const next = event.relatedTarget as HTMLElement | null;
    if (isEditing.value && options.getRoot && next && isOutside(next)) save();
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

  const save = singleFlight(async (): Promise<void> => {
    if (!isEditing.value) return;
    if (!isDirty.value) {
      close();
      return;
    }
    const value = currentHtml.value;
    saving.value = true;
    error.value = undefined;
    try {
      const savedEntity = await saveScope({
        entityId: options.entityId(),
        collection: options.collection(),
        formInput: buildMetadataInput(
          options.metadataKey(),
          value,
          options.locale(),
        ),
      });
      options.onSaved?.(value, savedEntity);
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
  });

  const start = async () => {
    const editor = options.getEditor();
    if (!editor || isEditing.value || !options.canEdit()) return;
    const opened = await requestOpen({
      id: options.scopeId(),
      isDirty: () => isDirty.value,
      focus: () => options.getEditor()?.commands.focus(),
      close,
      save: async () => {
        await save();
        return !isEditing.value;
      },
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
    handleFocusout,
    dispose,
  };
};
