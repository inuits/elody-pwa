import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";

const mocks = vi.hoisted(() => ({
  createdHelpers: [] as { name: string; helper: any }[],
  relatedOptions: [] as any[],
  // How the registry hands out loading state: the creator gets a ref, later
  // callers get the reactive registry entry, where it is a plain boolean.
  loading: undefined as undefined | { as: "ref" | "plain"; value: boolean },
}));

vi.mock("@/composables/useGetDropdownOptions", () => ({
  useGetDropdownOptions: vi.fn((name: string) => {
    const helper = {
      initialize: vi.fn().mockResolvedValue(undefined),
      getAutocompleteOptions: vi.fn().mockResolvedValue(undefined),
      entityDropdownOptions: ref([]),
      entitiesLoading: !mocks.loading
        ? ref(false)
        : mocks.loading.as === "ref"
          ? ref(mocks.loading.value)
          : mocks.loading.value,
      getFormWithRelationFieldCheck: vi.fn(),
    };
    if (name.includes("fetchRelations"))
      helper.initialize.mockImplementation(async () => {
        helper.entityDropdownOptions.value = mocks.relatedOptions;
      });
    mocks.createdHelpers.push({ name, helper });
    return helper;
  }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityUuid: () => "entity-123" }),
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: ref(false) }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    replaceRelationsFromSameType: vi.fn(),
    addRelations: vi.fn(),
    getRelationsBasedOnType: vi.fn(() => undefined),
  }),
}));

vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: () => ({ createEntity: vi.fn() }),
}));

vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({ confirm: vi.fn() }),
}));

vi.mock("@/helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/helpers")>();
  return {
    ...actual,
    getEntityIdFromRoute: () => undefined,
    getFormattersSettings: vi.fn().mockResolvedValue({}),
    goToEntityPageById: vi.fn(),
    looksLikeEntityId: vi.fn(() => false),
    getEntityTitle: vi.fn(() => "title"),
  };
});

vi.mock("vue-router", () => ({
  useRouter: () => ({}),
}));

import ViewModesAutocompleteRelations from "../library/view-modes/ViewModesAutocompleteRelations.vue";

const getDefaultProps = () => ({
  modelValue: undefined,
  advancedFilterInputForSearchingOptions: {},
  relationFilter: undefined,
  relationType: "refEpiDocTag",
  fromRelationType: "",
  formId: "form-1",
  disabled: false,
  mode: "create" as const,
  autoSelectable: false,
  isReadOnly: false,
});

const mountWith = (props: Record<string, unknown> = {}) =>
  shallowMount(ViewModesAutocompleteRelations, {
    props: { ...getDefaultProps(), ...props },
  });

const helperInitializeCalls = (nameIncludes: string) =>
  mocks.createdHelpers
    .filter((entry) => entry.name.includes(nameIncludes))
    .map((entry) => entry.helper.initialize.mock.calls.length)
    .reduce((total, count) => total + count, 0);

describe("ViewModesAutocompleteRelations prefetch on mount", () => {
  beforeEach(() => {
    mocks.createdHelpers.length = 0;
    vi.clearAllMocks();
  });

  it("prefetches all-entity options in create mode without autoSelectable", async () => {
    mountWith({ mode: "create", autoSelectable: false });
    await flushPromises();

    expect(helperInitializeCalls("fetchAll")).toBe(1);
  });

  it("does not prefetch in edit mode without autoSelectable, preserving lazy loading", async () => {
    mountWith({ mode: "edit", autoSelectable: false });
    await flushPromises();

    expect(helperInitializeCalls("fetchAll")).toBe(0);
  });

  it("still prefetches exactly once when autoSelectable is set (podiumnet autoselect path)", async () => {
    mountWith({ mode: "create", autoSelectable: true, modelValue: "some-value" });
    await flushPromises();

    expect(helperInitializeCalls("fetchAll")).toBe(1);
  });
});


describe("ViewModesAutocompleteRelations read-only fallback to related options", () => {
  beforeEach(() => {
    mocks.createdHelpers.length = 0;
    mocks.relatedOptions = [];
    vi.clearAllMocks();
  });

  it("hands the autocomplete the related options as a plain array, not as a ref", async () => {
    mocks.relatedOptions = [
      { label: "Engels", value: "TAAL-1", __typename: "DropdownOption" },
    ];

    const wrapper = shallowMount(ViewModesAutocompleteRelations, {
      props: {
        ...getDefaultProps(),
        mode: "edit",
        isReadOnly: true,
        disabled: true,
        relationType: "refLanguages",
      },
      global: {
        stubs: {
          BaseInputAutocomplete: {
            name: "BaseInputAutocomplete",
            props: ["options"],
            template: "<div />",
          },
        },
      },
    });
    await flushPromises();

    const options = wrapper
      .findComponent({ name: "BaseInputAutocomplete" })
      .props("options");
    expect(Array.isArray(options)).toBe(true);
    expect(options).toEqual(mocks.relatedOptions);
  });


  it("never hands the autocomplete a ref when the related options helper is set up without results", async () => {
    const wrapper = shallowMount(ViewModesAutocompleteRelations, {
      props: {
        ...getDefaultProps(),
        mode: "edit",
        isReadOnly: true,
        disabled: true,
        relationType: "refLanguages",
      },
      global: {
        stubs: {
          BaseInputAutocomplete: {
            name: "BaseInputAutocomplete",
            props: ["options"],
            template: "<div />",
          },
        },
      },
    });
    await flushPromises();

    const options = wrapper
      .findComponent({ name: "BaseInputAutocomplete" })
      .props("options");
    expect(Array.isArray(options)).toBe(true);
  });

});

describe("ViewModesAutocompleteRelations in an inline editor", () => {
  beforeEach(() => {
    mocks.createdHelpers.length = 0;
    mocks.relatedOptions = [];
    vi.clearAllMocks();
  });

  const input = (wrapper: ReturnType<typeof mountWith>) =>
    wrapper.find("base-input-autocomplete-stub");

  it("hides an empty input outside editing, showing the empty value instead", async () => {
    const wrapper = mountWith({ mode: "edit" });
    await flushPromises();
    expect(input(wrapper).attributes("style")).toContain("display: none");
  });

  it("shows the input even when nothing is selected yet while editing in place", async () => {
    const wrapper = mountWith({ mode: "edit", editing: true });
    await flushPromises();
    expect(input(wrapper).attributes("style") ?? "").not.toContain("display: none");
    expect(wrapper.find("p").attributes("style")).toContain("display: none");
  });
});

describe("ViewModesAutocompleteRelations loading state", () => {
  beforeEach(() => {
    mocks.createdHelpers.length = 0;
    mocks.relatedOptions = [];
    vi.clearAllMocks();
  });

  const loadingProp = async (as: "ref" | "plain", value: boolean) => {
    mocks.loading = { as, value };
    const wrapper = mountWith({ mode: "edit", editing: true });
    await flushPromises();
    mocks.loading = undefined;
    return wrapper.find("base-input-autocomplete-stub").attributes("loading");
  };

  it("shows the dropdown's spinner while options load (state as a ref)", async () => {
    expect(await loadingProp("ref", true)).toBe("true");
  });

  it("shows the dropdown's spinner while options load (state from the registry)", async () => {
    expect(await loadingProp("plain", true)).toBe("true");
  });

  it("shows no spinner once loaded", async () => {
    expect(await loadingProp("plain", false)).toBe("false");
  });
});
