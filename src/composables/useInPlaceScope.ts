import { nextTick, onBeforeUnmount, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useEditScope, type EditScope } from "@/composables/useEditScope";

// What every in-place editor (field row, list-row value, coordinates) needs
// around its edit scope: opening it, releasing it when the editor goes away,
// the entity-update check and the shared messages.
// See docs/design-system/components/inline-editor.md.

export const useInPlaceScope = (getScopeId: () => string) => {
  const { requestOpen, release, isActive } = useEditScope();
  const { t, te } = useI18n();
  const translated = (key: string, fallback: string): string =>
    te(key) ? t(key) : fallback;

  const open = (scope: Omit<EditScope, "id">): Promise<boolean> =>
    requestOpen({ id: getScopeId(), ...scope });

  const releaseScope = () => release(getScopeId());

  // A field can unmount with its editor open (a refetch, paging, a closed
  // panel). Its scope must not outlive it, or every other field stays locked
  // and every navigation asks about changes nobody can see any more.
  onBeforeUnmount(() => {
    if (isActive(getScopeId())) releaseScope();
  });

  const messages = {
    saved: () => translated("inline-edit.saved", "Saved"),
    saveFailed: () =>
      translated("inline-edit.save-failed", "Saving failed, try again"),
    editField: () => translated("inline-edit.edit-field", "edit"),
  };

  return { open, release: releaseScope, messages };
};

// The entity may be updated by this user (the page's permitted edit mode).
export const canUpdateEntity = (editState: {
  permittedEditMode?: unknown;
}): boolean =>
  ["edit", "edit-delete"].includes(
    unref(editState.permittedEditMode as any) as string,
  );

// A click on a control inside an editable value (a link, the copy button)
// belongs to that control, not to the value.
const INNER_CONTROL_SELECTOR = "a, button, [data-inline-edit-ignore]";

export const isInnerControlClick = (
  event: Event,
  container: Element | null | undefined,
): boolean => {
  const target = event.target as Element | null;
  const control = target?.closest?.(INNER_CONTROL_SELECTOR);
  return !!control && control !== container && !!container?.contains(control);
};

// Leaving an editor saves it, and so does opening the next one: while a save
// is running, a second call shares it instead of sending it again.
export const singleFlight = <Args extends unknown[]>(
  run: (...args: Args) => Promise<void>,
): ((...args: Args) => Promise<void>) => {
  let pending: Promise<void> | undefined;
  return (...args) =>
    (pending ??= run(...args).finally(() => (pending = undefined)));
};

// After a save or cancel, focus returns to the value, unless the user already
// moved it on (Tab, a click on another field). Once the editor is gone, focus
// that was in it is on <body>.
export const focusUnlessMoved = async (
  getTarget: () => HTMLElement | null | undefined,
): Promise<void> => {
  await nextTick();
  const active = document.activeElement;
  if (active && active !== document.body) return;
  getTarget()?.focus();
};
