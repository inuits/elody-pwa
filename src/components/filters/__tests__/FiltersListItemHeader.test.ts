import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import FiltersListItemHeader from "@/components/filters/FiltersListItemHeader.vue";

vi.mock("@/components/base/BaseTooltip.vue", () => ({
  default: { name: "BaseTooltip", template: "<div><slot /></div>" },
}));

const header = (props: Record<string, unknown> = {}) =>
  shallowMount(FiltersListItemHeader, {
    props: { isActive: false, label: "Titel", icon: "angle-down", ...props },
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
});
