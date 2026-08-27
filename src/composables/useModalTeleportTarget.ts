export const OPENED_MODAL_CLASS = "base-modal--opened";

/**
 * Where a tooltip, dropdown or datepicker teleports to while a modal is open.
 *
 * A modal is a <dialog> shown with showModal(), which puts it in the browser's
 * top layer — nothing in the normal stacking context paints above it, at any
 * z-index. So overlay content has to render INSIDE the open modal.
 *
 * Every open modal carries `.base-modal--opened`, and more than one can be open
 * at a time: the guided flow opens on top of the comment thread modal it was
 * launched from. A plain `.base-modal--opened` selector resolves to the FIRST
 * match in document order, which is the modal underneath — the dropdown then
 * renders in the wrong dialog, hidden below the one the user is looking at.
 * The modals are all declared in AppModals, in stacking order, so the last
 * match is the one on top.
 */
export const modalTeleportTarget = (): Element | string => {
  const openedModals = document.querySelectorAll(`.${OPENED_MODAL_CLASS}`);
  return openedModals.length
    ? openedModals[openedModals.length - 1]
    : `.${OPENED_MODAL_CLASS}`;
};
