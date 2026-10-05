import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/generated-types/queries", () => ({
  DamsIcons: { NoIcon: "NoIcon" },
  ModalStyle: { Center: "Center" },
  TypeModals: {},
}));

const getWrapper = (props: Record<string, unknown> = {}) =>
  shallowMount(BaseButtonNew, {
    props: { label: "Bewaar", ...props },
    global: { stubs: { unicon: true } },
  });

const classesOf = (props: Record<string, unknown> = {}) =>
  getWrapper(props).find("button").classes();

describe("BaseButtonNew", () => {
  it("renders the commit variant as a commit-teal fill", () => {
    expect(classesOf({ buttonStyle: "commit" })).toContain("bg-commit");
  });

  it("darkens the commit variant on hover", () => {
    expect(classesOf({ buttonStyle: "commit" })).toContain(
      "hover:bg-commit-hover",
    );
  });

  it("renders the danger variant as a danger fill", () => {
    expect(classesOf({ buttonStyle: "danger" })).toContain("bg-danger");
  });

  it("renders the primary variant as an accent fill", () => {
    expect(classesOf({ buttonStyle: "primary" })).toContain("bg-accent");
  });

  it("renders the ghost variant without a fill", () => {
    expect(classesOf({ buttonStyle: "ghost" })).toContain("bg-transparent");
  });

  it("defaults to the secondary variant", () => {
    const classes = classesOf();
    expect(classes).toEqual(
      expect.arrayContaining(["bg-neutral-white", "border"]),
    );
  });

  it("shrinks on press", () => {
    expect(classesOf()).toContain("active:scale-[.97]");
  });

  it("uses the button radius token", () => {
    expect(classesOf()).toContain("rounded-button");
  });

  it("is disabled while loading", () => {
    expect(
      getWrapper({ loading: true }).find("button").attributes("disabled"),
    ).toBeDefined();
  });

  it("keeps its label while loading", () => {
    expect(getWrapper({ loading: true }).text()).toContain("Bewaar");
  });

  it("exposes the aria-label", () => {
    expect(
      getWrapper({ label: undefined, ariaLabel: "Sluit" })
        .find("button")
        .attributes("aria-label"),
    ).toBe("Sluit");
  });
});
