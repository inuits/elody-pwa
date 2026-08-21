import { describe, expect, it } from "vitest";
import { useFormHelper } from "@/composables/useFormHelper";
import { useFieldLock } from "@/composables/useFieldLock";

const { createForm } = useFormHelper();

describe("useFieldLock", () => {
  it("is not locked when the entity has no lockedProperties", () => {
    createForm("no-lock-entity", {
      intialValues: {} as any,
      relationValues: {},
    });

    const { isLocked } = useFieldLock(
      () => "no-lock-entity",
      () => "reading",
    );

    expect(isLocked.value).toBe(false);
  });

  it("is not locked when the key is absent from lockedProperties", () => {
    createForm("other-key-locked", {
      intialValues: { lockedProperties: ["translation"] } as any,
      relationValues: {},
    });

    const { isLocked } = useFieldLock(
      () => "other-key-locked",
      () => "reading",
    );

    expect(isLocked.value).toBe(false);
  });

  it("is locked when the key is present in lockedProperties", () => {
    createForm("reading-locked", {
      intialValues: { lockedProperties: ["reading"] } as any,
      relationValues: {},
    });

    const { isLocked } = useFieldLock(
      () => "reading-locked",
      () => "reading",
    );

    expect(isLocked.value).toBe(true);
  });

  it("is not locked when there is no key", () => {
    createForm("keyless-entity", {
      intialValues: { lockedProperties: ["reading"] } as any,
      relationValues: {},
    });

    const { isLocked } = useFieldLock(
      () => "keyless-entity",
      () => undefined,
    );

    expect(isLocked.value).toBe(false);
  });

  it("is not locked when the form does not exist", () => {
    const { isLocked } = useFieldLock(
      () => "does-not-exist",
      () => "reading",
    );

    expect(isLocked.value).toBe(false);
  });
});
