import { describe, it, expect, afterEach } from "vitest";
import {
  modalTeleportTarget,
  OPENED_MODAL_CLASS,
} from "@/composables/useModalTeleportTarget";

const openModalElement = (id: string) => {
  const element = document.createElement("div");
  element.id = id;
  element.classList.add(OPENED_MODAL_CLASS);
  document.body.appendChild(element);
  return element;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("modalTeleportTarget", () => {
  it("returns the open modal when there is exactly one", () => {
    const modal = openModalElement("thread");
    expect(modalTeleportTarget()).toBe(modal);
  });

  it("returns the modal on top when several are open", () => {
    openModalElement("thread");
    const guidedFlow = openModalElement("guided-flow");
    // AppModals declares the modals in stacking order, so the last open one is
    // the one the user is looking at
    expect(modalTeleportTarget()).toBe(guidedFlow);
  });

  it("falls back to the selector when no modal is open", () => {
    expect(modalTeleportTarget()).toBe(`.${OPENED_MODAL_CLASS}`);
  });
});
