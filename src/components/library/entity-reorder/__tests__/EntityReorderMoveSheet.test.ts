import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import EntityReorderMoveSheet from "@/components/library/entity-reorder/EntityReorderMoveSheet.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mountSheet = (index: number) =>
  mount(EntityReorderMoveSheet, {
    props: { name: "b.jpg", index, total: 7, pageSize: 3 },
    global: {
      stubs: {
        unicon: true,
        BaseButtonNew: {
          props: ["label", "disabled"],
          template: `<button :disabled="disabled" @click="$emit('click')">{{ label }}</button>`,
        },
      },
    },
  });

const buttonWithText = (wrapper: ReturnType<typeof mountSheet>, text: string) =>
  wrapper.findAll("button").find((button) => button.text().includes(text))!;

describe("EntityReorderMoveSheet", () => {
  it("offers the quick moves relative to the current position", async () => {
    const wrapper = mountSheet(1);
    await buttonWithText(wrapper, "reorder.down-one").trigger("click");
    await buttonWithText(wrapper, "reorder.to-end").trigger("click");

    expect(wrapper.emitted("move")).toEqual([[2], [6]]);
  });

  it("disables moves that would not change the position", () => {
    const wrapper = mountSheet(0);
    expect(
      buttonWithText(wrapper, "reorder.to-start").attributes("disabled"),
    ).toBeDefined();
  });

  it("moves to a typed position", async () => {
    const wrapper = mountSheet(1);
    await wrapper.find("input").setValue("5");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.emitted("move")).toEqual([[4]]);
  });
});
