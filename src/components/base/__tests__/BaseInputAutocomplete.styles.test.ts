import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import BaseInputAutocomplete from "../BaseInputAutocomplete.vue";

vi.mock("@vueform/multiselect", () => ({
  default: defineComponent({
    name: "MockMultiselect",
    props: { classes: { default: () => ({}) }, modelValue: { default: () => [] } },
    template: `<div data-cy="multiselect"><template v-for="option in modelValue" :key="option.value"><slot name="tag" :option="option" :handle-tag-remove="() => {}" :disabled="false" /></template></div>`,
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
  default: {
    name: "BaseInputTextNumberDatetime",
    props: ["size", "modelValue", "inputStyle", "type", "disabled"],
    template: "<div data-cy='tag-input' />",
  },
}));

const classesFor = (
  autocompleteStyle: string,
  extraProps: Record<string, unknown> = {},
) =>
  mount(BaseInputAutocomplete, {
    props: {
      modelValue: [{ label: "A", value: "a" }],
      options: [{ label: "A", value: "a" }],
      autocompleteStyle,
      ...extraProps,
    } as any,
  })
    .findComponent({ name: "MockMultiselect" })
    .props("classes") as Record<string, string>;

describe("BaseInputAutocomplete — design-system styling", () => {
  it("fits the value input on a relation chip (e.g. a page number) inside the chip", () => {
    const tagInput = mount(BaseInputAutocomplete, {
      props: {
        modelValue: [{ label: "A", value: "a" }],
        options: [{ label: "A", value: "a" }],
        autocompleteStyle: "defaultWithBorder",
        relationType: "refBibliographicalReferences",
        displayInputForTag: true,
      } as any,
    }).findComponent({ name: "BaseInputTextNumberDatetime" });
    expect(tagInput.exists()).toBe(true);
    expect(tagInput.props("size")).toBe("compact");
    expect(tagInput.classes().some((c) => c.includes("[26px]"))).toBe(false);
  });

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

  it("renders related entities as relation chips", () => {
    const tag = classesFor("default", { relationType: "hasCreator" }).tag;
    expect(tag).toContain("!bg-chip-relation-bg");
    expect(tag).toContain("!text-chip-relation-text");
  });

  it("renders chosen values as theme-following value chips", () => {
    const tag = classesFor("default").tag;
    expect(tag).toContain("!bg-chip-value-bg");
    expect(tag).toContain("!text-chip-value-text");
    expect(tag).not.toContain("chip-relation");
  });

  it("uses the chip radius for both kinds", () => {
    expect(classesFor("default").tag).toContain("!rounded-chip");
    expect(
      classesFor("default", { relationType: "hasCreator" }).tag,
    ).toContain("!rounded-chip");
  });

  it("lets the field-row hover wash show through a read-only display", () => {
    const container = classesFor("readOnly").container;
    expect(container).toContain("!bg-transparent");
    expect(container).not.toContain("!bg-surface");
  });

  it.each(["readOnly", "readOnlyAsPlainText"])(
    "drops the empty-input spacer in %s mode, so a value row is only as tall as its content",
    (style) => {
      expect(classesFor(style).spacer).toBe("hidden");
    },
  );

  it("renders plain-text relations at the value size, like other values", () => {
    expect(classesFor("readOnlyAsPlainText").tag).toContain("!text-value");
  });

  it("keeps edit-mode controls at the shared control height", () => {
    expect(classesFor("defaultWithBorder").spacer).toContain(
      "h-[calc(var(--control-height)-2px)]",
    );
  });
});
