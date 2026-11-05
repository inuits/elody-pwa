import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MetadataFormatterLink from "@/components/metadata/MetadataFormatterLink.vue";

const mocks = vi.hoisted(() => ({
  formattersSettings: {} as Record<string, any>,
  requiresAuth: false,
}));

vi.mock("@/main", () => ({
  get formattersSettings() {
    return mocks.formattersSettings;
  },
}));

vi.mock("@/helpers", () => ({
  getChildrenOfHomeRoutes: () => [],
  requiresAuthForEntity: () => mocks.requiresAuth,
}));

const mountLink = () =>
  mount(MetadataFormatterLink, {
    props: {
      formatter: "link|production",
      label: "Silent Garden 1",
      link: "/production/PR-000000",
      type: "production",
      openInNewTab: false,
    },
    global: { provide: { config: {} }, stubs: { unicon: true } },
  });

describe("MetadataFormatterLink", () => {
  beforeEach(() => {
    mocks.formattersSettings = {};
    mocks.requiresAuth = false;
  });

  it("sizes a chip link with the chip tokens, like a pill", () => {
    mocks.formattersSettings = {
      link: { production: { background: "#e6f4ea", text: "#2d7a4f" } },
    };
    const classes = mountLink().classes();

    expect(classes).toEqual(
      expect.arrayContaining([
        "text-chip",
        "font-bold",
        "p-(--chip-padding)",
        "rounded-chip",
      ]),
    );
    expect(classes).not.toContain("text-sm");
    expect(classes).not.toContain("rounded-md");
  });

  it("sizes a plain link like any other value", () => {
    const classes = mountLink().classes();

    expect(classes).toEqual(expect.arrayContaining(["text-value", "underline"]));
    expect(classes).not.toContain("text-sm");
  });

  it("sizes a link the viewer may not open like any other value", () => {
    mocks.requiresAuth = true;
    const wrapper = mountLink();

    expect(wrapper.element.tagName).toBe("P");
    expect(wrapper.classes()).toContain("text-value");
  });
});
