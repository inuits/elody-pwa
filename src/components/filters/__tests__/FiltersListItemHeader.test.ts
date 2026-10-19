import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import FiltersListItemHeader from "@/components/filters/FiltersListItemHeader.vue";
import { Unicons } from "@/types";

vi.mock("@/components/base/BaseTooltip.vue", () => ({
  default: { name: "BaseTooltip", template: "<div><slot /></div>" },
}));

const header = (props: Record<string, unknown> = {}) =>
  shallowMount(FiltersListItemHeader, {
    props: { isActive: false, label: "Titel", open: false, ...props },
    global: { stubs: { Unicon: true } },
  });

const root = (props: Record<string, unknown> = {}) =>
  header(props).find('[data-cy="filters-list-item"]');

describe("FiltersListItemHeader", () => {
  it("renders the label at the label text size in bold", () => {
    const label = header().find('[data-cy="filters-list-item-label"]');
    expect(label.classes()).toEqual(
      expect.arrayContaining(["text-label", "font-bold"]),
    );
  });

  it("uses the compact 8/12px section padding", () => {
    expect(root().classes()).toEqual(expect.arrayContaining(["px-3", "py-2"]));
  });

  it("separates sections with a faint bottom border", () => {
    expect(root().classes()).toEqual(
      expect.arrayContaining(["border-b", "border-border-faint"]),
    );
  });

  it("marks an active filter with the accent-light surface", () => {
    expect(root({ isActive: true }).classes()).toEqual(
      expect.arrayContaining(["bg-accent-light", "text-accent-ink"]),
    );
  });

  it("no longer uses the deprecated mint fill when active", () => {
    expect(root({ isActive: true }).classes()).not.toContain(
      "bg-accent-normal",
    );
  });

  it("emits toggle on click", async () => {
    const wrapper = header();
    await wrapper.find('[data-cy="filters-list-item"]').trigger("click");
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("points its chevron down while closed and up while open (handoff)", () => {
    const chevron = (open: boolean) =>
      header({ open })
        .findAllComponents({ name: "Unicon" })
        .at(-1)!
        .attributes("name");
    expect(chevron(false)).toBe(Unicons.AngleDown.name);
    expect(chevron(true)).toBe(Unicons.AngleUp.name);
  });

  it("is a keyboard-operable toggle that says whether it is open", async () => {
    const wrapper = header({ open: true });
    const toggle = wrapper.find('[data-cy="filters-list-item"]');

    expect(toggle.attributes("role")).toBe("button");
    expect(toggle.attributes("tabindex")).toBe("0");
    expect(toggle.attributes("aria-expanded")).toBe("true");
    await toggle.trigger("keydown", { key: "Enter" });
    await toggle.trigger("keydown", { key: " " });
    expect(wrapper.emitted("toggle")).toHaveLength(2);
  });

  it("shows the hint icon only when the config gives a tooltip", () => {
    expect(header().findAllComponents({ name: "BaseTooltip" })).toHaveLength(0);
    expect(
      header({ tooltip: true, tooltipText: "hint" }).findAllComponents({
        name: "BaseTooltip",
      }),
    ).toHaveLength(1);
  });
});
