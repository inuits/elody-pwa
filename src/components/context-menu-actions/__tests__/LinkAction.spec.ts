import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { Entitytyping } from "@/generated-types/queries";
import LinkAction from "../LinkAction.vue";

const mockResolve = vi.fn();

const mocks = vi.hoisted(() => ({
  typeUrlMapping: { mapping: {} as Record<string, string> },
}));

vi.mock("@/main", () => ({
  typeUrlMapping: mocks.typeUrlMapping,
}));

vi.mock("@/types", () => ({
  Unicons: {
    UilLink: { name: "uil-link" },
  },
}));

const t = (key: string, args?: string[]) =>
  args?.length ? `${key}:${args[0]}` : key;

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    resolve: mockResolve,
  }),
}));

const getDefaultProps = () => ({
  label: "actions.openEntity",
  icon: "UilLink",
  entityId: "M-12345",
  entityType: Entitytyping.Mediafile,
});

const getWrapper = (props = getDefaultProps()) =>
  shallowMount(LinkAction, {
    props,
    global: {
      mocks: { $t: t },
    },
  });

describe("LinkAction", () => {
  let windowOpenSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.typeUrlMapping.mapping = {};
    mockResolve.mockReturnValue({ href: "/mediafiles/M-12345" });
    windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering", () => {
    it("renders BaseContextMenuItem", () => {
      const wrapper = getWrapper();
      expect(
        wrapper.findComponent({ name: "BaseContextMenuItem" }).exists(),
      ).toBe(true);
    });

    it("passes translated label with entity type interpolated", () => {
      const wrapper = getWrapper();
      const item = wrapper.findComponent({ name: "BaseContextMenuItem" });
      expect(item.props("label")).toBe(
        "actions.openEntity:entity-translations.singular.mediafile",
      );
    });

    it("passes icon name to BaseContextMenuItem", () => {
      const wrapper = getWrapper();
      const item = wrapper.findComponent({ name: "BaseContextMenuItem" });
      expect(item.props("icon")).toBe("uil-link");
    });

    it("does not render any anchor tag", () => {
      // Regression: <router-link> inside <BaseContextMenuItem> created nested <a href="#">
      // which caused browser to navigate to # instead of opening the entity URL
      const wrapper = getWrapper();
      expect(wrapper.find("a").exists()).toBe(false);
    });
  });

  describe("navigation", () => {
    it("opens the resolved entity URL in a new tab when clicked", async () => {
      mockResolve.mockReturnValue({ href: "/mediafiles/M-12345" });
      const wrapper = getWrapper();
      await wrapper
        .findComponent({ name: "BaseContextMenuItem" })
        .vm.$emit("clicked");
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "/mediafiles/M-12345",
        "_blank",
      );
    });

    it("never navigates in the current window", async () => {
      const wrapper = getWrapper();
      await wrapper
        .findComponent({ name: "BaseContextMenuItem" })
        .vm.$emit("clicked");
      expect(windowOpenSpy).not.toHaveBeenCalledWith(
        expect.any(String),
        "_self",
      );
      expect(windowOpenSpy).toHaveBeenCalledWith(expect.any(String), "_blank");
    });

    it("resolves the URL with the correct entity ID", async () => {
      const wrapper = getWrapper({ ...getDefaultProps(), entityId: "E-99999" });
      await wrapper
        .findComponent({ name: "BaseContextMenuItem" })
        .vm.$emit("clicked");
      expect(mockResolve).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ id: "E-99999" }),
        }),
      );
    });

    it("uses typeUrlMapping to resolve URL type when a mapping exists", async () => {
      mocks.typeUrlMapping.mapping = { mediafile: "mediafiles" };
      const wrapper = getWrapper();
      await wrapper
        .findComponent({ name: "BaseContextMenuItem" })
        .vm.$emit("clicked");
      expect(mockResolve).toHaveBeenCalledWith({
        params: { id: "M-12345", type: "mediafiles" },
      });
    });

    it("falls back to entityType in URL when no typeUrlMapping entry exists", async () => {
      mocks.typeUrlMapping.mapping = {};
      const wrapper = getWrapper();
      await wrapper
        .findComponent({ name: "BaseContextMenuItem" })
        .vm.$emit("clicked");
      expect(mockResolve).toHaveBeenCalledWith({
        params: { id: "M-12345", type: "mediafile" },
      });
    });
  });
});
