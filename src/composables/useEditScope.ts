import { computed, shallowRef, type ComputedRef } from "vue";

// Per-field editing: exactly one edit scope (a field, a group or a row) is
// open at a time. A changed scope is never closed or saved implicitly: opening
// another one is refused and focus returns to the changed scope. Leaving the
// page with a changed scope goes through the usual unsaved-changes prompt.
// See docs/design-system/patterns/per-field-editing.md.

export type EditScope = {
  id: string;
  isDirty: () => boolean;
  focus?: () => void;
  close?: () => void;
};

export const createEditScopeStore = () => {
  const activeScope = shallowRef<EditScope | null>(null);

  const isActive = (id: string): boolean => activeScope.value?.id === id;

  const requestOpen = (scope: EditScope): boolean => {
    const current = activeScope.value;
    if (!current || current.id === scope.id) {
      activeScope.value = scope;
      return true;
    }
    if (current.isDirty()) {
      current.focus?.();
      return false;
    }
    current.close?.();
    activeScope.value = scope;
    return true;
  };

  const release = (id: string): void => {
    if (isActive(id)) activeScope.value = null;
  };

  const hasUnsavedChanges: ComputedRef<boolean> = computed(
    () => !!activeScope.value?.isDirty(),
  );

  return { activeScope, isActive, requestOpen, release, hasUnsavedChanges };
};

const store = createEditScopeStore();

export const useEditScope = () => store;
