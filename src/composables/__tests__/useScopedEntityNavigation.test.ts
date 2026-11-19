import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import {
  provideEntityNavigationScope,
  useScopedEntityNavigation,
  type EntityNavigationTarget,
} from "@/composables/useScopedEntityNavigation";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  resolve: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mocks.push, resolve: mocks.resolve }),
}));

vi.mock("@/helpers", () => ({
  mapUrlToEntityType: (slug: string) =>
    slug === "personen" ? "person" : undefined,
}));

const mountWith = (scope?: (target: EntityNavigationTarget) => void) => {
  let api!: ReturnType<typeof useScopedEntityNavigation>;
  const Child = defineComponent({
    setup() {
      api = useScopedEntityNavigation();
      return () => h("div");
    },
  });
  const Parent = defineComponent({
    setup() {
      if (scope) provideEntityNavigationScope(scope);
      return () => h(Child);
    },
  });
  mount(Parent);
  return api;
};

const entityRoute = { name: "SingleEntity", params: { type: "personen", id: "P-1" } };

describe("useScopedEntityNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolve.mockImplementation((location: any) =>
      typeof location === "string"
        ? location === "/personen/P-2"
          ? { params: { type: "personen", id: "P-2" } }
          : { params: {} }
        : { params: location.params },
    );
  });

  it("pushes on the router outside a scope", () => {
    const { isScoped, navigate } = mountWith();

    navigate(entityRoute);

    expect(isScoped).toBe(false);
    expect(mocks.push).toHaveBeenCalledWith(entityRoute);
  });

  it("hands the entity to the scope instead of the router", () => {
    const scope = vi.fn();
    const { isScoped, navigate } = mountWith(scope);

    navigate(entityRoute);

    expect(isScoped).toBe(true);
    expect(scope).toHaveBeenCalledWith({ id: "P-1", type: "person" });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("resolves a path link to the entity", () => {
    const scope = vi.fn();
    const { navigate } = mountWith(scope);

    navigate("/personen/P-2");

    expect(scope).toHaveBeenCalledWith({ id: "P-2", type: "person" });
  });

  it("keeps an unmapped slug as the type", () => {
    const scope = vi.fn();
    const { navigate } = mountWith(scope);

    navigate({ name: "SingleEntity", params: { type: "work", id: "W-1" } });

    expect(scope).toHaveBeenCalledWith({ id: "W-1", type: "work" });
  });

  it("falls back to the router for a route that is not an entity", () => {
    const scope = vi.fn();
    const { navigate, resolveTarget } = mountWith(scope);

    navigate("/not-found");

    expect(resolveTarget("/not-found")).toBeUndefined();
    expect(scope).not.toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith("/not-found");
  });
});
