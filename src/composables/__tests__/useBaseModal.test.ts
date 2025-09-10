import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBaseModal } from "../useBaseModal";
import { TypeModals, ModalStyle } from "@/generated-types/queries";

describe("useBaseModal", () => {
  beforeEach(() => {
    const { closeAllModals } = useBaseModal();
    closeAllModals();
  });

  describe("Initial State", () => {
    it("should initialize modals with correct default values", () => {
      const { modals } = useBaseModal();

      Object.values(TypeModals).forEach((modalType) => {
        expect(modals[modalType]).toEqual({
          open: false,
          closeConfirmation: false,
          modalStyle: ModalStyle.Center,
        });
      });
    });

    it("should initialize someModalIsOpened as false", () => {
      const { someModalIsOpened } = useBaseModal();
      expect(someModalIsOpened.value).toBe(false);
    });

    it("should initialize modalToCloseAfterConfirm as undefined", () => {
      const { modalToCloseAfterConfirm } = useBaseModal();
      expect(modalToCloseAfterConfirm.value).toBeUndefined();
    });

    it("should initialize deleteQueryOptions as undefined", () => {
      const { deleteQueryOptions } = useBaseModal();
      expect(deleteQueryOptions.value).toBeUndefined();
    });
  });

  describe("getModalInfo", () => {
    it("should return correct modal info for given modal type", () => {
      const { getModalInfo } = useBaseModal();
      const modalInfo = getModalInfo(TypeModals.DynamicForm);

      expect(modalInfo).toEqual({
        open: false,
        closeConfirmation: false,
        modalStyle: ModalStyle.Center,
      });
    });

    it("should return modal with updated values after modification", () => {
      const { getModalInfo, updateModal } = useBaseModal();

      updateModal(TypeModals.DynamicForm, {
        open: true,
        modalStyle: ModalStyle.Right,
        formQuery: "TestQuery",
      });

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo).toMatchObject({
        open: true,
        modalStyle: ModalStyle.Right,
        formQuery: "TestQuery",
        closeConfirmation: false,
      });
    });

    it("should return different instances for different modal types", () => {
      const { getModalInfo } = useBaseModal();

      const dynamicFormModal = getModalInfo(TypeModals.DynamicForm);
      const confirmModal = getModalInfo(TypeModals.Confirm);

      expect(dynamicFormModal).not.toBe(confirmModal);
    });
  });

  describe("openModal", () => {
    it("should open modal with basic properties", () => {
      const { openModal, getModalInfo } = useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.open).toBe(true);
      expect(modalInfo.modalStyle).toBe(ModalStyle.Center);
    });

    it("should not reopen already opened modal", () => {
      const { openModal, getModalInfo } = useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center, "FirstQuery");

      openModal(TypeModals.DynamicForm, ModalStyle.Right, "SecondQuery");

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.formQuery).toBe("FirstQuery");
      expect(modalInfo.modalStyle).toBe(ModalStyle.Center);
    });

    it("should update someModalIsOpened when opening first modal", () => {
      const { openModal, someModalIsOpened } = useBaseModal();

      expect(someModalIsOpened.value).toBe(false);
      openModal(TypeModals.DynamicForm, ModalStyle.Center);
      expect(someModalIsOpened.value).toBe(true);
    });

    it("should handle all optional parameters", () => {
      const { openModal, getModalInfo } = useBaseModal();
      const formQuery = "TestQuery";
      const deleteQueryOptions = {
        deleteEntityLabel: "Test Entity",
        blockingRelationsLabel: "Test Relations",
        deleteRelationsLabel: "Delete Relations",
      };
      const modalTypeSpecificInfo = { customField: "value" };

      openModal(
        TypeModals.DynamicForm,
        ModalStyle.Center,
        formQuery,
        deleteQueryOptions,
        true,
        undefined,
        modalTypeSpecificInfo,
      );

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo).toMatchObject({
        open: true,
        formQuery,
        deleteQueryOptions,
        modalStyle: ModalStyle.Center,
        customField: "value",
        closeConfirmation: false,
      });
    });

    it("should handle askForCloseConfirmation parameter", () => {
      const { openModal, getModalInfo } = useBaseModal();

      openModal(
        TypeModals.DynamicForm,
        ModalStyle.Center,
        undefined,
        undefined,
        true,
      );

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.askForCloseConfirmation).toBe(true);
    });

    it("should preserve existing modal properties when opening", () => {
      const { openModal, updateModal, getModalInfo } = useBaseModal();

      updateModal(TypeModals.DynamicForm, {
        customProp: "shouldStay",
      });

      openModal(TypeModals.DynamicForm, ModalStyle.Center);

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.customProp).toBe("shouldStay");
    });
  });

  describe("updateModal", () => {
    it("should update existing modal properties", () => {
      const { updateModal, getModalInfo } = useBaseModal();

      updateModal(TypeModals.DynamicForm, {
        open: true,
        modalStyle: ModalStyle.Right,
      });

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.open).toBe(true);
      expect(modalInfo.modalStyle).toBe(ModalStyle.Right);
    });

    it("should merge new properties with existing ones", () => {
      const { updateModal, getModalInfo } = useBaseModal();

      updateModal(TypeModals.DynamicForm, {
        formQuery: "InitialQuery",
        customProp: "initial",
      });

      updateModal(TypeModals.DynamicForm, {
        modalStyle: ModalStyle.Right,
        customProp: "updated",
      });

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo).toMatchObject({
        formQuery: "InitialQuery",
        modalStyle: ModalStyle.Right,
        customProp: "updated",
      });
    });

    it("should handle partial updates", () => {
      const { updateModal, getModalInfo } = useBaseModal();

      updateModal(TypeModals.DynamicForm, {
        open: true,
        modalStyle: ModalStyle.Center,
        formQuery: "Query",
      });

      updateModal(TypeModals.DynamicForm, {
        modalStyle: ModalStyle.Right,
      });

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo).toMatchObject({
        open: true,
        modalStyle: ModalStyle.Right,
        formQuery: "Query",
      });
    });
  });

  describe("closeModal", () => {
    it("should close modal directly when closeConfirmation is false", () => {
      const { openModal, closeModal, getModalInfo } = useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);

      closeModal(TypeModals.DynamicForm);

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.open).toBe(false);
    });

    it("should open confirm modal when closeConfirmation is true", () => {
      const { openModal, closeModal, getModalInfo, updateModal } =
        useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);
      updateModal(TypeModals.DynamicForm, { closeConfirmation: true });

      closeModal(TypeModals.DynamicForm);

      const dynamicFormModal = getModalInfo(TypeModals.DynamicForm);
      expect(dynamicFormModal.open).toBe(true);

      const confirmModal = getModalInfo(TypeModals.Confirm);
      expect(confirmModal.open).toBe(true);
    });

    it("should not modify the style of the original modal when confirmation is required", () => {
      const { openModal, closeModal, getModalInfo, updateModal } =
        useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.CenterWide);
      updateModal(TypeModals.DynamicForm, { closeConfirmation: true });

      closeModal(TypeModals.DynamicForm);

      expect(getModalInfo(TypeModals.DynamicForm).modalStyle).toBe(
        ModalStyle.CenterWide,
      );
      expect(getModalInfo(TypeModals.Confirm).modalStyle).toBe(
        ModalStyle.Center,
      );
    });

    it("should update someModalIsOpened when closing last modal", () => {
      const { openModal, closeModal, someModalIsOpened } = useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);
      closeModal(TypeModals.DynamicForm);

      expect(someModalIsOpened.value).toBe(false);
    });

    it("should keep someModalIsOpened true when other modals are open", () => {
      const { openModal, closeModal, someModalIsOpened } = useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);
      openModal(TypeModals.Confirm, ModalStyle.Center);

      closeModal(TypeModals.DynamicForm);

      expect(someModalIsOpened.value).toBe(true);
    });

    it("should not open confirm modal when closing confirm modal itself", () => {
      const { openModal, closeModal, getModalInfo, updateModal } =
        useBaseModal();

      openModal(TypeModals.Confirm, ModalStyle.Center);
      updateModal(TypeModals.Confirm, { closeConfirmation: true });

      closeModal(TypeModals.Confirm);

      const confirmModal = getModalInfo(TypeModals.Confirm);
      expect(confirmModal.open).toBe(false);
    });

    it("should handle errors gracefully", () => {
      const { closeModal } = useBaseModal();
      const consoleSpy = vi.spyOn(console, "info");

      closeModal("NonExistentModal" as TypeModals);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Could not close NonExistentModal modal",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("closeAllModals", () => {
    it("should close all open modals", () => {
      const { openModal, closeAllModals, getModalInfo } = useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);
      openModal(TypeModals.Confirm, ModalStyle.Center);

      closeAllModals();

      Object.values(TypeModals).forEach((modalType) => {
        const modalInfo = getModalInfo(modalType);
        expect(modalInfo.open).toBe(false);
      });
    });

    it("should reset closeConfirmation for all modals", () => {
      const { openModal, closeAllModals, getModalInfo, updateModal } =
        useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);
      updateModal(TypeModals.DynamicForm, { closeConfirmation: true });

      closeAllModals();

      Object.values(TypeModals).forEach((modalType) => {
        const modalInfo = getModalInfo(modalType);
        expect(modalInfo.closeConfirmation).toBe(false);
      });
    });

    it("should set someModalIsOpened to false", () => {
      const { openModal, closeAllModals, someModalIsOpened } = useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center);
      openModal(TypeModals.Confirm, ModalStyle.Center);

      closeAllModals();

      expect(someModalIsOpened.value).toBe(false);
    });

    it("should preserve other modal properties", () => {
      const { closeAllModals, getModalInfo, updateModal } = useBaseModal();

      updateModal(TypeModals.DynamicForm, {
        customProp: "value",
        formQuery: "test",
      });

      closeAllModals();

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.customProp).toBe("value");
      expect(modalInfo.formQuery).toBe("test");
    });
  });

  describe("changeCloseConfirmation", () => {
    it("should update closeConfirmation value for specified modal", () => {
      const { changeCloseConfirmation, getModalInfo } = useBaseModal();

      changeCloseConfirmation(TypeModals.DynamicForm, true);

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.closeConfirmation).toBe(true);
    });

    it("should not affect other modal properties", () => {
      const { openModal, changeCloseConfirmation, getModalInfo } =
        useBaseModal();

      openModal(TypeModals.DynamicForm, ModalStyle.Center, "TestQuery");

      changeCloseConfirmation(TypeModals.DynamicForm, true);

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo).toMatchObject({
        open: true,
        modalStyle: ModalStyle.Center,
        formQuery: "TestQuery",
        closeConfirmation: true,
      });
    });

    it("should not affect other modals", () => {
      const { changeCloseConfirmation, getModalInfo } = useBaseModal();

      changeCloseConfirmation(TypeModals.DynamicForm, true);

      const confirmModalInfo = getModalInfo(TypeModals.Confirm);
      expect(confirmModalInfo.closeConfirmation).toBe(false);
    });
  });

  describe("updateDeleteQueryOptions", () => {
    it("should update deleteQueryOptions value", () => {
      const { updateDeleteQueryOptions, deleteQueryOptions } = useBaseModal();

      const options = {
        deleteEntityLabel: "Delete Entity",
        blockingRelationsLabel: "Blocking Relations",
        deleteRelationsLabel: "Delete Relations",
      };

      updateDeleteQueryOptions(options);

      expect(deleteQueryOptions.value).toEqual(options);
    });

    it("should maintain reactivity", () => {
      const { updateDeleteQueryOptions, deleteQueryOptions } = useBaseModal();

      const options = {
        deleteEntityLabel: "Delete Entity",
        blockingRelationsLabel: "Blocking Relations",
        deleteRelationsLabel: "Delete Relations",
      };

      updateDeleteQueryOptions(options);

      if (deleteQueryOptions.value) {
        deleteQueryOptions.value.deleteEntityLabel = "Updated Label";
      }

      expect(deleteQueryOptions.value?.deleteEntityLabel).toBe("Updated Label");
    });

    it("should be accessible through getModalInfo", () => {
      const { updateDeleteQueryOptions, openModal, getModalInfo } =
        useBaseModal();

      const options = {
        deleteEntityLabel: "Delete Entity",
        blockingRelationsLabel: "Blocking Relations",
        deleteRelationsLabel: "Delete Relations",
      };

      updateDeleteQueryOptions(options);
      openModal(TypeModals.DynamicForm, ModalStyle.Center, undefined, options);

      const modalInfo = getModalInfo(TypeModals.DynamicForm);
      expect(modalInfo.deleteQueryOptions).toEqual(options);
    });
  });

  describe("Edge cases", () => {
    it("should not share state between modal instances", () => {
      const { getModalInfo, updateModal } = useBaseModal();

      updateModal(TypeModals.DynamicForm, { customProp: "formValue" });
      updateModal(TypeModals.Confirm, { customProp: "confirmValue" });

      const formModal = getModalInfo(TypeModals.DynamicForm);
      const confirmModal = getModalInfo(TypeModals.Confirm);

      expect(formModal.customProp).toBe("formValue");
      expect(confirmModal.customProp).toBe("confirmValue");
    });
  });

  it("should return undefined for non existed modal type", () => {
    const { getModalInfo } = useBaseModal();

    const result = getModalInfo("InvalidType" as TypeModals);
    expect(result).toBeUndefined();
  });
});
