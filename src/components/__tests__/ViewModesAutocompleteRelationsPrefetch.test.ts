import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";

const mocks = vi.hoisted(() => ({
  createdHelpers: [] as { name: string; helper: any }[],
}));

vi.mock("@/composables/useGetDropdownOptions", () => ({
  useGetDropdownOptions: vi.fn((name: string) => {
    const helper = {
      initialize: vi.fn().mockResolvedValue(undefined),
      getAutocompleteOptions: vi.fn().mockResolvedValue(undefined),
      entityDropdownOptions: ref([]),
      entitiesLoading: ref(false),
      getFormWithRelationFieldCheck: vi.fn(),
    };
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
