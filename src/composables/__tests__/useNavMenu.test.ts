import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MenuItem } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  path: "/",
  isAuthenticated: { value: true },
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get path() {
      return mocks.path;
    },
  }),
}));
vi.mock("@/main", () => ({
  auth: { isAuthenticated: mocks.isAuthenticated },
}));

const routeTo = (destination: string) => ({ route: { destination } });

const link = (destination: string, extra: Partial<MenuItem> = {}) =>
  ({
    label: destination,
    typeLink: routeTo(destination),
    ...extra,
  }) as unknown as MenuItem;

const group = (children: Record<string, MenuItem | null>) =>
  ({
    label: "group",
    typeLink: routeTo("group"),
    subMenu: { name: "sub-menu-group", ...children },
  }) as unknown as MenuItem;

const loadComposable = async () => {
  vi.resetModules();
  const module = await import("@/composables/useNavMenu");
  return module;
};

describe("useNavMenu", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.path = "/";
    mocks.isAuthenticated.value = true;
  });

  describe("mode", () => {
    it("is closed by default", async () => {
      const { useNavMenu } = await loadComposable();
      expect(useNavMenu().isOpen.value).toBe(false);
    });

    it("remembers the chosen mode across page loads", async () => {
      const first = await loadComposable();
      first.useNavMenu().setMode(first.NavMode.Expanded);

      const second = await loadComposable();
      expect(second.useNavMenu().isOpen.value).toBe(true);
    });

    it("ignores an unknown stored mode", async () => {
      localStorage.setItem("elody.navMode", "sideways");
      const { useNavMenu } = await loadComposable();
      expect(useNavMenu().isOpen.value).toBe(false);
    });

    it("is open only while the menu is kept open", async () => {
      const { useNavMenu, NavMode } = await loadComposable();
      const { isOpen, setMode } = useNavMenu();
      expect(isOpen.value).toBe(false);
      setMode(NavMode.Expanded);
      expect(isOpen.value).toBe(true);
    });

    it("falls back to closed for the retired hover mode", async () => {
      localStorage.setItem("elody.navMode", "hover");
      const { useNavMenu } = await loadComposable();
      expect(useNavMenu().isOpen.value).toBe(false);
    });
  });

  describe("subItemsOf", () => {
    it("keeps only children that have a link config", async () => {
      const { subItemsOf } = await loadComposable();
      const companies = link("companies");
      expect(subItemsOf(group({ venues: null, companies }))).toEqual([
        companies,
      ]);
    });

    it("returns nothing for a plain link", async () => {
      const { subItemsOf } = await loadComposable();
      expect(subItemsOf(link("library"))).toEqual([]);
    });
  });

  describe("isVisible", () => {
    it("shows a plain link", async () => {
      const { useNavMenu } = await loadComposable();
      expect(useNavMenu().isVisible(link("library"))).toBe(true);
    });

    it("hides a group whose children were all left out", async () => {
      const { useNavMenu } = await loadComposable();
      expect(useNavMenu().isVisible(group({ venues: null }))).toBe(false);
    });

    it("hides a logged-in-only item from an anonymous user", async () => {
      mocks.isAuthenticated.value = false;
      const { useNavMenu } = await loadComposable();
      expect(
        useNavMenu().isVisible(link("library", { isLoggedIn: true })),
      ).toBe(false);
    });
  });

  describe("isCurrent", () => {
    it("matches the last segment of the route against the destination", async () => {
      mocks.path = "/tenant-a/library";
      const { useNavMenu } = await loadComposable();
      expect(useNavMenu().isCurrent(link("library"))).toBe(true);
    });

    it("does not match another destination", async () => {
      mocks.path = "/tenant-a/library";
      const { useNavMenu } = await loadComposable();
      expect(useNavMenu().isCurrent(link("jobs"))).toBe(false);
    });

    it("marks a group current when one of its children is", async () => {
      mocks.path = "/companies";
      const { useNavMenu } = await loadComposable();
      expect(
        useNavMenu().isCurrent(group({ companies: link("companies") })),
      ).toBe(true);
    });
  });
});
