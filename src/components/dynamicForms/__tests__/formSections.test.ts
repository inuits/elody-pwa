import { describe, expect, it } from "vitest";
import {
  flattenFormFields,
  sectionStartsAt,
} from "@/components/dynamicForms/formSections";

// A form section (baseGraphql FormSection, a SHACL UI sh:PropertyGroup) is
// flattened into the form's field list: every field keeps working as before
// (validation, submission, bulk edit), and carries the section it belongs to.
describe("flattenFormFields", () => {
  const formFields = {
    given: { __typename: "PanelMetaData", key: "given" },
    nameSection: {
      __typename: "FormSection",
      label: "ui.person.group.name",
      formFields: {
        first: { __typename: "PanelMetaData", key: "first" },
        last: { __typename: "PanelMetaData", key: "last" },
        __typename: "FormFields",
      },
    },
    create: { __typename: "FormAction", label: "create" },
    __typename: "FormFields",
  };

  it("lists a section's fields in place, tagged with the section", () => {
    const fields = flattenFormFields(formFields);
    expect(fields.map((field: any) => field.key ?? field.label)).toEqual([
      "given",
      "first",
      "last",
      "create",
    ]);
    expect(fields[1].formSection).toEqual({ key: "nameSection", label: "ui.person.group.name" });
    expect(fields[2].formSection).toEqual({ key: "nameSection", label: "ui.person.group.name" });
    expect(fields[0].formSection).toBeUndefined();
  });

  it("leaves forms without sections unchanged", () => {
    const plain = { a: { __typename: "PanelMetaData", key: "a" }, __typename: "FormFields" };
    expect(flattenFormFields(plain)).toEqual([{ __typename: "PanelMetaData", key: "a" }]);
  });
});

describe("sectionStartsAt", () => {
  const fields = flattenFormFields({
    a: { __typename: "PanelMetaData", key: "a" },
    s1: { __typename: "FormSection", label: "one", formFields: { b: { __typename: "PanelMetaData", key: "b" }, c: { __typename: "PanelMetaData", key: "c" } } },
    s2: { __typename: "FormSection", label: "two", formFields: { d: { __typename: "PanelMetaData", key: "d" } } },
  });

  it("is true where a new section begins", () => {
    expect(fields.map((_, index) => sectionStartsAt(fields, index))).toEqual([false, true, false, true]);
  });
});
