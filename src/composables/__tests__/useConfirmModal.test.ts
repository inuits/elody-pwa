import { test, expect } from "vitest";
import { useConfirmModal } from "../useConfirmModal";
import { useBaseModal } from "../useBaseModal";
import { TypeModals } from "../../generated-types/queries";

test("Initialize and open a confirmModal", () => {
  const { initializeConfirmModal } = useConfirmModal();
  const { closeModal, getModalInfo } = useBaseModal();
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        return undefined;
      },
    },
    declineButton: { buttonCallback: () => closeModal(TypeModals.Confirm) },
    translationKey: "test",
    openImmediately: true,
  });

  expect(getModalInfo(TypeModals.Confirm).open).toBe(true);
});

test("Set path to navigate", () => {
  const { setPathToNavigate, pathToNavigate } = useConfirmModal();

  setPathToNavigate("/asset");

  expect(pathToNavigate.value).toBe("/asset");
});

test("Close confirmModal by using decline button", () => {
  const { confirmModalConfiguration } = useConfirmModal();
  const { getModalInfo } = useBaseModal();

  confirmModalConfiguration.value?.declineButton.buttonCallback();

  expect(getModalInfo(TypeModals.Confirm).open).toBe(true);
});
