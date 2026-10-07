// The unsaved-changes prompt shown when leaving a detail page. It covers both
// the legacy page-wide edit mode and an open in-place editor (useEditScope),
// with the same three choices: discard ("confirm"), stay ("cancel") or save
// ("secondary"). Leaving after a save only happens when the save worked.

export type LeaveChoice = "confirm" | "cancel" | "secondary" | string;

export const decideLeave = async ({
  pageEditChanged,
  scopeChanged,
  ask,
  savePageEdit,
  saveScope,
  discardScope,
}: {
  pageEditChanged: boolean;
  scopeChanged: boolean;
  ask: () => Promise<LeaveChoice>;
  savePageEdit: () => Promise<unknown>;
  saveScope: () => Promise<boolean>;
  discardScope: () => void;
}): Promise<boolean> => {
  if (!pageEditChanged && !scopeChanged) return true;

  const choice = await ask();
  if (choice === "secondary") {
    if (scopeChanged) return saveScope();
    await savePageEdit();
    return true;
  }
  if (choice === "confirm") {
    if (scopeChanged) discardScope();
    return true;
  }
  return false;
};
