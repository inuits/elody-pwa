import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import BaseInputAutocomplete from "../BaseInputAutocomplete.vue";

vi.mock("@vueform/multiselect", () => ({
  default: defineComponent({
    name: "MockMultiselect",
    props: { classes: { default: () => ({}) } },
    template: `<div data-cy="multiselect" />`,
  }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityUuid: () => "test-uuid" }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: ref(false) }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: ref(true) }),
}));
vi.mock("@/components/base/BaseInputTextNumberDatetime.vue", () => ({
  default: { template: "<div />" },
}));

const classesFor = (autocompleteStyle: string) =>
  mount(BaseInputAutocomplete, {
    props: {
      modelValue: [{ label: "A", value: "a" }],
      options: [{ label: "A", value: "a" }],
      autocompleteStyle,
    } as any,
  })
    .findComponent({ name: "MockMultiselect" })
    .props("classes") as Record<string, string>;

describe("BaseInputAutocomplete — design-system styling", () => {
  it("uses the one focus ring when active", () => {
    const active = classesFor("default").containerActive;
    expect(active).toContain("outline-2");
    expect(active).toContain("outline-focus-ring");
    expect(active).toContain("outline-offset-1");
  });

  it("draws the default border token when bordered", () => {
    expect(classesFor("defaultWithBorder").container).toContain(
      "!border-border-default",
    );
  });

  it("renders tags as relation chips with the chip radius", () => {
    const tag = classesFor("default").tag;
    expect(tag).toContain("!bg-chip-relation-bg");
    expect(tag).toContain("!rounded-chip");
  });
});
