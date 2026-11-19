import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { InputFieldTypes } from "@/generated-types/queries";
import EntityElementMetadataEdit from "../EntityElementMetadataEdit.vue";

vi.mock("@/components/metadata/useHiddenField", () => ({
  useHiddenField: vi.fn(),
}));
vi.mock("@/components/metadata/useDefaultValue", () => ({
  useDefaultValue: vi.fn(),
}));
vi.mock("@/composables/useConditionalValidation", () => ({
  useConditionalValidation: () => ({ conditionalFieldIsAvailable: () => true }),
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ addEditableMetadataKeys: vi.fn() }),
}));

const mountEdit = (type: InputFieldTypes, props: Record<string, any> = {}) =>
  shallowMount(EntityElementMetadataEdit, {
    props: {
      fieldKey: "title",
      value: "",
      field: { type, options: [{ label: "A", value: "a" }] } as any,
      formId: "form-1",
      showErrors: false,
      fieldIsValid: true,
      isFieldRequired: false,
      labelledBy: "field-label-1",
      ...props,
    },
  });

describe("EntityElementMetadataEdit - names and errors", () => {
  it.each([
    [InputFieldTypes.Text, "BaseInputTextNumberDatetime"],
    [InputFieldTypes.Dropdown, "AdvancedDropdown"],
    [
      InputFieldTypes.DropdownMultiselectRelations,
      "ViewModesAutocompleteRelations",
    ],
    [
      InputFieldTypes.DropdownMultiselectMetadata,
      "ViewModesAutocompleteMetadata",
    ],
  ])("names a %s field by its visible label", (type, component) => {
    const input = mountEdit(type).findComponent({ name: component });
    expect(input.props("labelledBy")).toBe("field-label-1");
  });

  it("announces a field error and ties it to the text input", () => {
    const wrapper = mountEdit(InputFieldTypes.Text, {
      showErrors: true,
      fieldIsValid: false,
      error: "Title is required",
    });
    const error = wrapper.find('[data-cy="field-error"]');
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("Title is required");

    const input = wrapper.findComponent({
      name: "BaseInputTextNumberDatetime",
    });
    expect(input.props("invalid")).toBe(true);
    expect(input.props("describedBy")).toBe(error.attributes("id"));
  });

  it("leaves the input valid and undescribed without an error", () => {
    const input = mountEdit(InputFieldTypes.Text).findComponent({
      name: "BaseInputTextNumberDatetime",
    });
    expect(input.props("invalid")).toBe(false);
    expect(input.props("describedBy")).toBeUndefined();
  });
});
