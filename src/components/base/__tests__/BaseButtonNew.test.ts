import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/types", () => ({
  Unicons: { Check: { name: "check" }, QuestionCircle: { name: "q" } },
}));

vi.mock("@/generated-types/queries", () => ({
  DamsIcons: { NoIcon: "NoIcon", Check: "Check" },
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

  describe("radius follows the variant", () => {
    it("gives secondary the input radius", () => {
      expect(classesOf({ buttonStyle: "secondary" })).toContain(
        "rounded-input",
      );
    });

    it.each(["primary", "commit", "danger", "ghost"])(
      "gives %s the button radius",
      (buttonStyle) => {
        expect(classesOf({ buttonStyle })).toContain("rounded-button");
      },
    );
  });

  describe("sizes", () => {
    it("defaults to md", () => {
      expect(classesOf()).toEqual(
        expect.arrayContaining([
          "text-button-md",
          "p-(--button-md-padding)",
        ]),
      );
    });

    it("renders sm with the small text and padding tokens", () => {
      expect(classesOf({ buttonSize: "sm" })).toEqual(
        expect.arrayContaining([
          "text-button-sm",
          "p-(--button-sm-padding)",
        ]),
      );
    });

    it("pads an icon-only button evenly", () => {
      expect(
        classesOf({ label: undefined, icon: "Check", ariaLabel: "Bewaar" }),
      ).toContain("p-(--button-md-padding-icon)");
    });

    it("spaces icon and label with the gap token", () => {
      expect(classesOf()).toContain("gap-(--button-gap)");
    });
  });

  it("is disabled while loading", () => {
    expect(
      getWrapper({ loading: true }).find("button").attributes("disabled"),
    ).toBeDefined();
  });

  describe("loading keeps the button width", () => {
    it("keeps its label", () => {
      expect(getWrapper({ loading: true }).text()).toContain("Bewaar");
    });

    it("puts the spinner in place of the icon", () => {
      const wrapper = getWrapper({ loading: true, icon: "Check" });
      expect(wrapper.findComponent({ name: "SpinnerLoader" }).exists()).toBe(
        true,
      );
      expect(wrapper.find("unicon-stub").exists()).toBe(false);
    });

    it("overlays the spinner when there is no icon to replace", () => {
      const wrapper = getWrapper({ loading: true });
      expect(
        wrapper.findComponent({ name: "SpinnerLoader" }).classes(),
      ).toContain("absolute");
      expect(wrapper.find("span").classes()).toContain("invisible");
    });

    it("shows the label normally when not loading", () => {
      expect(getWrapper().find("span").classes()).not.toContain("invisible");
    });

    it("marks itself busy", () => {
      expect(
        getWrapper({ loading: true }).find("button").attributes("aria-busy"),
      ).toBe("true");
    });
  });

  it("exposes the aria-label", () => {
    expect(
      getWrapper({ label: undefined, ariaLabel: "Sluit" })
        .find("button")
        .attributes("aria-label"),
    ).toBe("Sluit");
  });
});
