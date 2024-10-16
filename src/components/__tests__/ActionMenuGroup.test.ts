import { mount } from "@vue/test-utils";
import ActionMenuGroup from "../ActionMenuGroup.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  Entitytyping,
  ActionContextEntitiesSelectionType,
  TypeModals,
  Permission,
  ActionContextViewModeTypes,
  DropdownOption,
} from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({
    mutate: vi.fn(),
  }),
}));

vi.mock("@/types", () => ({
  Unicons: {
    EllipsisV: { name: "EllipsisV" },
  },
}));

vi.mock("session-vue-3-oidc-library", () => ({
  useAuth: () => ({
    isAuthenticated: { value: true },
  }),
}));

const mocks = vi.hoisted(() => {
  return {
    advancedPermissions: {
      can_do_whatever_you_want: true,
      no_way: false,
    },
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(),
    fetchAdvancedPermission: vi.fn(),
    fetchPermissionsForDropdownOptions: vi.fn(),
  }),
  ignorePermissions: { value: false },
  advancedPermissions: mocks.advancedPermissions,
}));

describe("ActionMenuGroup", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const bulkOption: DropdownOption = {
    label: "bulk-operations.add-relation",
    value: "addRelation",
    actionContext: {
      entitiesSelectionType: ActionContextEntitiesSelectionType.SomeSelected,
      activeViewMode: [
        ActionContextViewModeTypes.ReadMode,
        ActionContextViewModeTypes.EditMode,
      ],
      labelForTooltip: null,
    },
    bulkOperationModal: {
      typeModal: TypeModals.DynamicForm,
      formQuery: "GetForm",
      formRelationType: null,
      askForCloseConfirmation: true,
      neededPermission: Permission.Canupdate,
    },
    can: ["can_do_whatever_you_want"],
  };

  it("contains the option if permission is granted", async () => {
    mocks.advancedPermissions["can_do_whatever_you_want"] = true;

    const wrapper = mount(ActionMenuGroup, {
      props: {
        options: [bulkOption],
        isMainActionDisabled: false,
        entityType: "Entitytyping" as Entitytyping,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(1);
  });

  it("has no option if permission is not granted", async () => {
    mocks.advancedPermissions["can_do_whatever_you_want"] = false;

    const wrapper = mount(ActionMenuGroup, {
      props: {
        options: [bulkOption],
        isMainActionDisabled: false,
        entityType: "Entitytyping" as Entitytyping,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(0);
  });

  it("contains the option to render if permission is not provided", async () => {
    const wrapper = mount(ActionMenuGroup, {
      props: {
        options: [
          { ...bulkOption, can: undefined },
          { ...bulkOption, can: undefined },
        ],
        isMainActionDisabled: false,
        entityType: "Entitytyping" as Entitytyping,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(2);
  });

  it("contains only permitted options", async () => {
    mocks.advancedPermissions["can_do_whatever_you_want"] = true;

    const wrapper = mount(ActionMenuGroup, {
      props: {
        options: [bulkOption, { ...bulkOption, can: ["take_whats_mine"] }],
        isMainActionDisabled: false,
        entityType: "Entitytyping" as Entitytyping,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(1);
  });

  it("contains the option to render if options were provided with delay", async () => {
    const wrapper = mount(ActionMenuGroup, {
      props: {
        options: [],
        isMainActionDisabled: false,
        entityType: "Entitytyping" as Entitytyping,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(0);

    mocks.advancedPermissions["no_way"] = true;
    await wrapper.setProps({
      options: [
        { ...bulkOption, can: ["no_way"] },
        { ...bulkOption, can: undefined },
        { ...bulkOption, can: ["different_no_way"] },
      ],
    });
    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(2);
  });
});
