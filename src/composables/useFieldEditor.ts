import { computed, ref } from "vue";

/**
 * One editable scope: a field row today, a group card once WP4.4 lands. The
 * scope owns its own value handling; this composable only decides which one is
 * open and what happens when it commits.
 */
export type EditScope = {
  id: string;
  /** Whether the user has changed anything since the editor opened. */
  isDirty: () => boolean;
  /** Put the value back the way it was when the editor opened. */
  restore: () => void;
  /** Validate this scope alone — validation never crosses the boundary. */
  validate: () => Promise<boolean>;
  submit: () => Promise<void>;
};

export type FieldEditorStatus = "idle" | "saving" | "error";

/** How long the saved check stays up before the row goes quiet again. */
const SAVED_MARK_MS = 2000;

const activeScope = ref<EditScope | undefined>();
const savedScopeId = ref<string | undefined>();
const status = ref<FieldEditorStatus>("idle");
const errorMessage = ref<string | undefined>();
let savedTimeout: ReturnType<typeof setTimeout> | undefined;

/**
 * The per-field editing pattern: edit scope = save scope = validation scope.
 * Only one scope edits at a time, and opening a second one neither commits nor
 * discards the first — a dirty editor simply refuses to be left.
 */
export const useFieldEditor = () => {
  const clearSavedMark = () => {
    if (savedTimeout) clearTimeout(savedTimeout);
    savedTimeout = undefined;
    savedScopeId.value = undefined;
  };

  const close = () => {
    activeScope.value = undefined;
    status.value = "idle";
    errorMessage.value = undefined;
  };

  /**
   * Returns false when the request was refused because another scope holds
   * unsaved changes; the caller leaves the row as it is.
   */
  const open = (scope: EditScope): boolean => {
    const current = activeScope.value;
    if (current && current.id !== scope.id && current.isDirty()) return false;

    clearSavedMark();
    activeScope.value = scope;
    status.value = "idle";
    errorMessage.value = undefined;
    return true;
  };

  const cancel = () => {
    activeScope.value?.restore();
    close();
  };

  const save = async (): Promise<void> => {
    const scope = activeScope.value;
    if (!scope) return;

    status.value = "saving";
    errorMessage.value = undefined;

    if (!(await scope.validate())) {
      // The field's own validation message is already rendered by the input.
      status.value = "error";
      return;
    }

    try {
      await scope.submit();
    } catch (error) {
      // A failed save always leaves the editor open: a closed row never
      // renders an error state, and the user's input is never thrown away.
      status.value = "error";
      errorMessage.value =
        error instanceof Error && error.message
          ? error.message
          : "inline-editor.save-failed";
      return;
    }

    clearSavedMark();
    savedScopeId.value = scope.id;
    savedTimeout = setTimeout(() => {
      savedScopeId.value = undefined;
      savedTimeout = undefined;
    }, SAVED_MARK_MS);
    close();
  };

  const isEditing = (scopeId: string): boolean =>
    activeScope.value?.id === scopeId;

  const isSaving = (scopeId: string): boolean =>
    isEditing(scopeId) && status.value === "saving";

  const isSaved = (scopeId: string): boolean => savedScopeId.value === scopeId;

  /** Test seam: drops all state so one spec cannot leak into the next. */
  const reset = () => {
    clearSavedMark();
    close();
  };

  return {
    activeScopeId: computed(() => activeScope.value?.id),
    status,
    errorMessage,
    open,
    cancel,
    save,
    isEditing,
    isSaving,
    isSaved,
    reset,
  };
};
