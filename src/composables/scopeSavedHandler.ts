// After a per-field save: the page takes the saved entity and the user sees
// the same "entity updated" notification as after the whole-form save.
// See docs/design-system/components/inline-editor.md.
export const createScopeSavedHandler =
  <T>({
    emitSaved,
    notifySuccess,
  }: {
    emitSaved: (savedEntity: T) => void;
    notifySuccess: (title: string, text: string) => void;
  }) =>
  (savedEntity: T): void => {
    emitSaved(savedEntity);
    notifySuccess(
      "notifications.success.entityUpdated.title",
      "notifications.success.entityUpdated.description",
    );
  };
