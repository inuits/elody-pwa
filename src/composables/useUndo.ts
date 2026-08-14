import { useNotification } from "@kyvg/vue3-notification";
import { getTranslatedMessage } from "@/helpers";

// One undo history for both carriers (design R2-3 / IMPLEMENTATION §3.4):
// value edits offer the inline chip next to the value (which lives until the
// next action); removals offer a toast — the row is gone, so there is
// nothing to attach a chip to. Both routes perform a compensating write, so
// the audit trail stays append-only.
export const useUndo = () => {
  const { notify } = useNotification();

  // Shows an undoable-removal toast; `undoAction` performs the compensating
  // write when the user clicks "Ongedaan maken" in the toast body.
  const displayUndoNotification = (
    title: string,
    text: string,
    undoAction: () => Promise<void> | void,
  ): void => {
    notify({
      title: getTranslatedMessage(title),
      text: getTranslatedMessage(text),
      type: "success",
      // With an action attached the toast lives 8s instead of 6s.
      duration: 8000,
      data: { undoAction },
    });
  };

  return { displayUndoNotification };
};
