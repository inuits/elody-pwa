import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import EntityNavigationArrows from "@/components/EntityNavigationArrows.vue";

const mockRoute = ref({
  name: "SingleEntity",
  params: { type: "assets", id: "2" } as Record<string, unknown>,
});

const mockPush = vi.fn();

const mockShowNavigationArrows = ref(true);

const mockEntities = ref<{ id: string; type: string }[]>([]);
let mockListItemRouteName = "";

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute.value,
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (k: string, named?: Record<string, unknown>) =>
      named ? `${k} ${JSON.stringify(named)}` : k,
  }),
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => ({
    showNavigationArrows: mockShowNavigationArrows,
  }),
}));

vi.mock("@/composables/useEntityNavigation", () => ({
  useEntityNavigation: () => ({
    hasNavigationEntities: () => mockEntities.value.length > 0,
    getPreviousEntity: (currentId: string) => {
      const index = mockEntities.value.findIndex((e) => e.id === currentId);
      return index > 0 ? mockEntities.value[index - 1] : undefined;
    },
    getNextEntity: (currentId: string) => {
      const index = mockEntities.value.findIndex((e) => e.id === currentId);
      if (index === -1 || index === mockEntities.value.length - 1)
        return undefined;
      return mockEntities.value[index + 1];
    },
    getPosition: (currentId: string) => {
      const index = mockEntities.value.findIndex((e) => e.id === currentId);
      return index === -1
        ? undefined
        : { index: index + 1, total: mockEntities.value.length };
    },
    getNavigationRoute: (entity: { id: string; type: string }) => ({
      name: mockListItemRouteName,
      params: { id: entity.id, type: entity.type },
    }),
  }),
}));

// The stepper listens on window, so every wrapper is unmounted after its test.
const wrappers: { unmount: () => void }[] = [];
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()));

const getWrapper = (ownsRouteState: boolean = true) => {
  const wrapper = shallowMount(EntityNavigationArrows, {
    global: {
      provide: { OwnsRouteState: ownsRouteState },
      stubs: {
        // The real BaseTooltip computes the `on` scoped-slot prop itself;
        // the default auto-stub can't reproduce that, so it renders neither
        // slot and swallows the buttons underneath. This minimal stub keeps
        // both slots (and passes `on` through) so the buttons still render.
        BaseTooltip: {
          template: `<div><slot name="activator" :on="{}" /><slot /></div>`,
        },
      },
    },
  });
  wrappers.push(wrapper);
  return wrapper;
};

describe("EntityNavigationArrows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.value = {
      name: "SingleEntity",
      params: { type: "assets", id: "2" },
    };
    mockShowNavigationArrows.value = true;
    mockEntities.value = [
      { id: "1", type: "assets" },
      { id: "2", type: "assets" },
      { id: "3", type: "assets" },
    ];
    mockListItemRouteName = "SingleEntity";
  });

  it("does not render inside a modal that does not own the route state", () => {
    const wrapper = getWrapper(false);

    expect(
      wrapper.find('[data-cy="entity-navigation-previous"]').exists(),
    ).toBe(false);
    expect(wrapper.find('[data-cy="entity-navigation-next"]').exists()).toBe(
      false,
    );
  });

  it("renders the previous/next buttons when navigation entities are cached", () => {
    const wrapper = getWrapper();

    expect(
      wrapper.find('[data-cy="entity-navigation-previous"]').exists(),
    ).toBe(true);
    expect(wrapper.find('[data-cy="entity-navigation-next"]').exists()).toBe(
      true,
    );
  });

  it("does not render when no navigation entities are cached", () => {
    mockEntities.value = [];

    const wrapper = getWrapper();

    expect(
      wrapper.find('[data-cy="entity-navigation-previous"]').exists(),
    ).toBe(false);
  });

  it("does not render when not on a single-entity page", () => {
    mockRoute.value = { name: "EntityList", params: { type: "assets" } };

    const wrapper = getWrapper();

    expect(
      wrapper.find('[data-cy="entity-navigation-previous"]').exists(),
    ).toBe(false);
  });

  it("does not render when disabled via entity page config", () => {
    mockShowNavigationArrows.value = false;

    const wrapper = getWrapper();

    expect(
      wrapper.find('[data-cy="entity-navigation-previous"]').exists(),
    ).toBe(false);
  });

  it("disables the previous button at the start of the list", () => {
    mockRoute.value = { name: "SingleEntity", params: { type: "assets", id: "1" } };

    const wrapper = getWrapper();

    expect(
      wrapper.find('[data-cy="entity-navigation-previous"]').attributes(
        "disabled",
      ),
    ).toBeDefined();
  });

  it("disables the next button at the end of the list", () => {
    mockRoute.value = { name: "SingleEntity", params: { type: "assets", id: "3" } };

    const wrapper = getWrapper();

    expect(
      wrapper.find('[data-cy="entity-navigation-next"]').attributes(
        "disabled",
      ),
    ).toBeDefined();
  });

  it("navigates to the next entity's route when the next button is clicked", async () => {
    const wrapper = getWrapper();

    await wrapper
      .find('[data-cy="entity-navigation-next"]')
      .trigger("click");

    expect(mockPush).toHaveBeenCalledWith({
      name: "SingleEntity",
      params: { id: "3", type: "assets" },
    });
  });

  it("navigates to the previous entity's route when the previous button is clicked", async () => {
    const wrapper = getWrapper();

    await wrapper
      .find('[data-cy="entity-navigation-previous"]')
      .trigger("click");

    expect(mockPush).toHaveBeenCalledWith({
      name: "SingleEntity",
      params: { id: "1", type: "assets" },
    });
  });

  it("names the icon-only arrows for screen readers", () => {
    const names = getWrapper()
      .findAllComponents({ name: "BaseButtonNew" })
      .map((button) => button.props("ariaLabel"));

    expect(names).toEqual([
      "entity-navigation.open-previous",
      "entity-navigation.open-next",
    ]);
  });

  // Catalogue RecordStepper: "‹ 2 of 3 ›", the record's place in the list.
  it("shows the record's position between the arrows", () => {
    const wrapper = getWrapper();

    expect(wrapper.find('[data-cy="entity-navigation-position"]').text()).toBe(
      'entity-navigation.position {"index":2,"total":3}',
    );
    expect(wrapper.find('[role="group"]').attributes("aria-label")).toBe(
      "entity-navigation.position-label",
    );
  });

  it("steps with Alt + arrow keys", async () => {
    getWrapper();

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", altKey: true }),
    );
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true }),
    );

    expect(mockPush.mock.calls).toEqual([
      [{ name: "SingleEntity", params: { id: "3", type: "assets" } }],
      [{ name: "SingleEntity", params: { id: "1", type: "assets" } }],
    ]);
  });

  it("leaves Alt + arrow alone while typing in a field", () => {
    getWrapper();
    const input = document.createElement("input");
    document.body.appendChild(input);

    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        altKey: true,
        bubbles: true,
      }),
    );

    expect(mockPush).not.toHaveBeenCalled();
    input.remove();
  });

  it("does not step with a plain arrow key", () => {
    getWrapper();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
