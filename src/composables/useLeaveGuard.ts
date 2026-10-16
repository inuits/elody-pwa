// Leaving a detail page. A changed in-place editor (useEditScope) saves, as
// leaving the field does, and the page is left only when that save worked.
// The legacy page-wide edit mode asks: discard ("confirm"), stay ("cancel")
// or save ("secondary").

export type LeaveChoice = "confirm" | "cancel" | "secondary" | string;

export const decideLeave = async ({
  pageEditChanged,
  scopeChanged,
  ask,
  savePageEdit,
  saveScope,
}: {
  pageEditChanged: boolean;
  scopeChanged: boolean;
  ask: () => Promise<LeaveChoice>;
  savePageEdit: () => Promise<unknown>;
  saveScope: () => Promise<boolean>;
}): Promise<boolean> => {
  if (scopeChanged) return saveScope();
  if (!pageEditChanged) return true;

  const choice = await ask();
  if (choice === "secondary") {
    await savePageEdit();
    return true;
  }
  return choice === "confirm";
};

// A route update leaves the record only when the path changes. A changed
// query or hash (paging a related list, a tab) stays on the same record, so
// it never asks about unsaved changes.
export const leavesRecord = (
  to: { path: string },
  from: { path: string },
): boolean => to.path !== from.path;
