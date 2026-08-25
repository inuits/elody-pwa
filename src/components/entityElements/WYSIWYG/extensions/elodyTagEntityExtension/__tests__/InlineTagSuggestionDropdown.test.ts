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
      {
        type: "selection",
        key: "type",
        value: ["person", "work_word"],
        match_exact: true,
      },
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
  configurations: [
    {
      tag: "user",
      taggableEntityType: "user",
      metadataFilterForTagContent: "vlacc:1|properties.name.value",
    },
  ],
  query: "a",
  range: { from: 1, to: 3 },
  anchor: { left: 10, bottom: 20 },
} as any;

const mountDropdown = async (state: any = suggestion) => {
  const wrapper = mount(InlineTagSuggestionDropdown, {
    props: { suggestion: state },
    attachTo: document.body,
  });
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
      configurations: [
        { ...suggestion.configurations[0], taggableEntityType: "BaseEntity" },
      ],
    });

    const filters = sentVariables[0].advancedFilterInputs;
    expect(filters.some((filter: any) => filter.type === "type")).toBe(false);
    expect(filters[0]).toMatchObject({
      key: "type",
      value: ["person", "work_word"],
    });

    wrapper.unmount();
  });
});

describe("two configurations sharing one trigger", () => {
  it("asks for both types in a single query", async () => {
    // One request, not one per type: a selection filter on type is what lets the
    // backend answer from the shared Typesense index and hydrate users and groups
    // from their separate Mongo collections.
    sentVariables.length = 0;
    const wrapper = await mountDropdown({
      ...suggestion,
      configurations: [
        suggestion.configurations[0],
        {
          tag: "group",
          taggableEntityType: "group",
          metadataFilterForTagContent: "vlacc:1|properties.name.value",
        },
      ],
    });

    expect(sentVariables).toHaveLength(1);
    expect(sentVariables[0].advancedFilterInputs).toEqual([
      { type: "selection", key: "type", value: ["user", "group"], match_exact: true },
      {
        type: "text",
        key: ["vlacc:1|properties.name.value"],
        value: "a",
        match_exact: false,
      },
    ]);

    wrapper.unmount();
  });

  it("refuses to mix BaseEntity with a named type", async () => {
    // BaseEntity carries the client's own type list; ANDing it with `user` matches
    // nothing, so this is a misconfiguration rather than something to merge.
    sentVariables.length = 0;
    const wrapper = await mountDropdown({
      ...suggestion,
      configurations: [
        suggestion.configurations[0],
        { ...suggestion.configurations[0], taggableEntityType: "BaseEntity" },
      ],
    });

    expect(sentVariables).toHaveLength(0);
    wrapper.unmount();
  });
});

describe("a typed configuration with no filter key", () => {
  it("searches nothing rather than listing every entity of the type", async () => {
    sentVariables.length = 0;
    const wrapper = await mountDropdown({
      ...suggestion,
      configurations: [
        { ...suggestion.configurations[0], metadataFilterForTagContent: null },
      ],
    });

    expect(sentVariables).toHaveLength(0);
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
    const wrapper = await mountDropdown({
      ...suggestion,
      configurations: [
        { ...suggestion.configurations[0], taggableEntityType: "BaseEntity" },
      ],
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

    expect(press("Enter").defaultPrevented).toBe(false);
  });
});

describe("typesense search highlighting on the suggestions", () => {
  // Search results carry <mark> around the typed text. It has to render as markup in
  // the list, and must never end up in the tag that is written into the document.
  const withHighlightedName = async (run: (wrapper: any) => void | Promise<void>) => {
    const original = entities[0].intialValues.name;
    entities[0].intialValues.name = "<mark>Ad</mark>a";
    const wrapper = await mountDropdown();
    try {
      await run(wrapper);
    } finally {
      entities[0].intialValues.name = original;
      wrapper.unmount();
    }
  };

  it("renders the highlight as markup instead of literal tags", async () => {
    await withHighlightedName(() => {
      const option = document.querySelectorAll("button")[0];
      expect(option.querySelector("mark")).not.toBeNull();
      expect(option.textContent?.trim()).toBe("Ada");
    });
  });

  it("tags the plain text, so no markup is written into the document", async () => {
    await withHighlightedName((wrapper) => {
      press("Enter");
      expect(wrapper.emitted("pick")?.[0]).toEqual([entities[0], "Ada"]);
    });
  });
});
