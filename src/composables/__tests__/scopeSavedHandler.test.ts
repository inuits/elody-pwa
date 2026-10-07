import { describe, it, expect, vi } from "vitest";
import { createScopeSavedHandler } from "@/composables/scopeSavedHandler";

describe("createScopeSavedHandler", () => {
  const setup = () => {
    const emitSaved = vi.fn();
    const notifySuccess = vi.fn();
    const handler = createScopeSavedHandler({ emitSaved, notifySuccess });
    return { handler, emitSaved, notifySuccess };
  };

  it("hands the saved entity back to the page", () => {
    const { handler, emitSaved } = setup();
    handler({ id: "entity-1" });
    expect(emitSaved).toHaveBeenCalledWith({ id: "entity-1" });
  });

  it("shows the same notification as the whole-form save", () => {
    const { handler, notifySuccess } = setup();
    handler({ id: "entity-1" });
    expect(notifySuccess).toHaveBeenCalledWith(
      "notifications.success.entityUpdated.title",
      "notifications.success.entityUpdated.description",
    );
  });
});
