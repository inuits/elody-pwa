import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ListColumnHeader from "../ListColumnHeader.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";

const getWrapper = (props: Record<string, unknown> = {}) =>
  shallowMount(ListColumnHeader, {
    props: {
      labels: ["metadata.labels.id", "metadata.labels.script"],
      cellStyles: [{ left: "40px" }, { left: "300px" }],
      selectable: true,
      allSelected: false,
      ...props,
    },
    global: { mocks: { $t: (key: string) => key } },
  });

describe("ListColumnHeader", () => {
  it("places each label over its measured cell", () => {
    const labels = getWrapper().findAll('[data-cy="list-column-label"]');
    expect(labels.map((label) => label.text())).toEqual([
      "metadata.labels.id",
      "metadata.labels.script",
    ]);
    expect(labels[1].attributes("style")).toContain("left: 300px");
  });

  it("labels the actions column", () => {
    expect(getWrapper().find('[data-cy="list-column-actions"]').text()).toBe(
      "contextMenu.actions",
    );
  });

  it("is sticky at the top of the list", () => {
    expect(getWrapper().classes()).toEqual(
      expect.arrayContaining(["sticky", "top-0"]),
    );
  });

  it("offers a named select-all checkbox that reflects the page", () => {
    const checkbox = getWrapper({ allSelected: true }).findComponent(
      BaseInputCheckbox,
    );
    expect(checkbox.props("modelValue")).toBe(true);
    expect(checkbox.props("ariaLabel")).toBe("bulk-operations.select-page");
  });

  it("asks to select or clear the page", async () => {
    const wrapper = getWrapper();
    await wrapper
      .findComponent(BaseInputCheckbox)
      .vm.$emit("update:modelValue", true);
    expect(wrapper.emitted("togglePageSelection")?.[0]).toEqual([true]);
  });

  it("has no select-all when rows can't be selected", () => {
    expect(
      getWrapper({ selectable: false }).findComponent(BaseInputCheckbox).exists(),
    ).toBe(false);
  });
});
