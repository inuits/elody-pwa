import { describe, expect, it } from "vitest";
import { showsFormSkeleton } from "@/components/dynamicForms/formSkeleton";

describe("showsFormSkeleton", () => {
  it("shows the skeleton while a fetched form is loading", () => {
    expect(
      showsFormSkeleton({
        dynamicFormLoaded: false,
        hasFieldsFromProps: false,
      }),
    ).toBe(true);
  });

  it("hides it once the fetched form is loaded", () => {
    expect(
      showsFormSkeleton({ dynamicFormLoaded: true, hasFieldsFromProps: false }),
    ).toBe(false);
  });

  // A multi-tab form first renders as a single form; when its tabs are known
  // that form unmounts and resets the shared dynamicFormLoaded flag after the
  // tab forms have mounted. A tab form has its fields already, so it must not
  // wait for that flag, or the wizard spins forever.
  it("never shows it for a form whose fields come in as a prop", () => {
    expect(
      showsFormSkeleton({ dynamicFormLoaded: false, hasFieldsFromProps: true }),
    ).toBe(false);
  });
});
