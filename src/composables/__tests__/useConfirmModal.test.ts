import { test, expect } from "vitest";
import { useConfirmModal } from "../useConfirmModal";
import { useBaseModal } from "../useBaseModal";
import { TypeModals } from "@/generated-types/queries";

test("confirm() opens the Confirm modal", () => {
  const { confirm } = useConfirmModal();
  const { getModalInfo } = useBaseModal();

  confirm({ title: "Test", confirmLabel: "Yes", cancelLabel: "No" });

  expect(getModalInfo(TypeModals.Confirm).open).toBe(true);
});

test("resolveConfirm() closes the modal and resolves the promise with the given choice", async () => {
  const { confirm, resolveConfirm } = useConfirmModal();
  const { getModalInfo } = useBaseModal();

  const promise = confirm({ title: "Test", confirmLabel: "Yes", cancelLabel: "No" });
  resolveConfirm("confirm");

  expect(getModalInfo(TypeModals.Confirm).open).toBe(false);
  expect(await promise).toBe("confirm");
});

test("resolveConfirm('cancel') resolves with cancel", async () => {
  const { confirm, resolveConfirm } = useConfirmModal();

  const promise = confirm({ title: "Test", confirmLabel: "Yes", cancelLabel: "No" });
  resolveConfirm("cancel");

  expect(await promise).toBe("cancel");
});
