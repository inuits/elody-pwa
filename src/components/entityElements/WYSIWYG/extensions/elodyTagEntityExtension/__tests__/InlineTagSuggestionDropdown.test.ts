/**
 * Keyboard selection in the suggestion dropdown.
 *
 * The listener is on document in the CAPTURE phase so it beats ProseMirror's own keydown
 * handler; that ordering is the whole mechanism, so it is what these tests exercise —
 * dispatching real events rather than calling the handler directly.
 */
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

const entities = [
  { id: "U-1", intialValues: { name: "Ada" } },
  { id: "U-2", intialValues: { name: "Alan" } },
  { id: "U-3", intialValues: { name: "Grace" } },
];

const sentVariables: any[] = [];
vi.mock("@/main", () => ({
  apolloClient: {
    query: ({ variables }: any) => {
      sentVariables.push(variables);
      return Promise.resolve({ data: { Entities: { results: entities } } });
    },
  },
}));

vi.mock("@/composables/useSimpleSearch", () => ({
  useSimpleSearch: () => ({
    buildFilters: (searchTerm: string) => [
      { type: "selection", key: "type", value: ["person", "work_word"], match_exact: true },
      {
        type: "text",
        key: ["vlacc:1|properties.title.value"],
        value: searchTerm,
        operator: "or",
        match_exact: false,
      },
    ],
  }),
}));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: vi.fn() }),
}));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const { default: InlineTagSuggestionDropdown } = await import(
  "../InlineTagSuggestionDropdown.vue"
);

const suggestion = {
  configuration: {
    tag: "user",
    taggableEntityType: "user",
    metadataFilterForTagContent: "vlacc:1|properties.name.value",
  },
  query: "a",
  range: { from: 1, to: 3 },
  anchor: { left: 10, bottom: 20 },
} as any;

const mountDropdown = async (state: any = suggestion) => {
  const wrapper = mount(InlineTagSuggestionDropdown, {
    props: { suggestion: state },
    attachTo: document.body,
  });
  // The result list is fetched in a watcher with immediate: true, so it lands a tick later.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await wrapper.vm.$nextTick();
  return wrapper;
};

const press = (key: string) => {
  const event = new KeyboardEvent("keydown", { key, cancelable: true });
  document.dispatchEvent(event);
  return event;
};

describe("how the dropdown scopes its search", () => {
  it("filters on the single configured type for a typed configuration", async () => {
    sentVariables.length = 0;
    const wrapper = await mountDropdown();

    const filters = sentVariables[0].advancedFilterInputs;
    expect(filters).toEqual([
      { type: "type", value: "user", match_exact: true },
      {
        type: "text",
        key: ["vlacc:1|properties.name.value"],
        value: "a",
        match_exact: false,
      },
    ]);

    wrapper.unmount();
  });

  it("uses the client's simple search for a BaseEntity configuration", async () => {
    sentVariables.length = 0;
    const wrapper = await mountDropdown({
      ...suggestion,
      configuration: {
        ...suggestion.configuration,
        taggableEntityType: "BaseEntity",
      },
    });

    const filters = sentVariables[0].advancedFilterInputs;
    // A `type` filter alongside simple search's own selection filter would AND
    // `type == BaseEntity` against the real list and return nothing.
    expect(filters.some((filter: any) => filter.type === "type")).toBe(false);
    expect(filters[0]).toMatchObject({
      key: "type",
      value: ["person", "work_word"],
    });

    wrapper.unmount();
  });
});

describe("which metadata key the option label is read from", () => {
  it("reads it from the configured filter key, not a built-in list", async () => {
    const wrapper = await mountDropdown();

    // vlacc:1|properties.name.value -> `name`, which is what these entities carry.
    press("Enter");
    expect(wrapper.emitted("pick")?.[0]).toEqual([entities[0], "Ada"]);

    wrapper.unmount();
  });

  it("falls back to the id rather than guessing an unconfigured key", async () => {
    // The mocked simple search filters on `title`; the entities only carry `name`. A
    // hardcoded fallback list would find `name` anyway — and would be a client-specific
    // key living in shared PWA code.
    const wrapper = await mountDropdown({
      ...suggestion,
      configuration: {
        ...suggestion.configuration,
        taggableEntityType: "BaseEntity",
      },
    });

    press("Enter");
    expect(wrapper.emitted("pick")?.[0]).toEqual([entities[0], "U-1"]);

    wrapper.unmount();
  });
});

describe("inline suggestion dropdown keyboard selection", () => {
  it("picks the arrow-navigated entity on Enter", async () => {
    const wrapper = await mountDropdown();

    press("ArrowDown");
    press("ArrowDown");
    press("Enter");

    expect(wrapper.emitted("pick")?.[0]).toEqual([entities[2], "Grace"]);
    wrapper.unmount();
  });

  it("wraps past the last option so a held arrow key never dead-ends", async () => {
    const wrapper = await mountDropdown();

    // Three results, four presses: 0 -> 1 -> 2 -> 0.
    press("ArrowDown");
    press("ArrowDown");
    press("ArrowDown");
    press("Enter");

    expect(wrapper.emitted("pick")?.[0]).toEqual([entities[0], "Ada"]);
    wrapper.unmount();
  });

  it("consumes Enter so ProseMirror cannot also insert a hard break", async () => {
    const wrapper = await mountDropdown();

    expect(press("Enter").defaultPrevented).toBe(true);
    wrapper.unmount();
  });

  it("stops listening once unmounted", async () => {
    const wrapper = await mountDropdown();
    wrapper.unmount();

    // Left registered, this would swallow Enter for the whole app.
    expect(press("Enter").defaultPrevented).toBe(false);
  });
});
