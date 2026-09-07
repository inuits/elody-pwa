import { mount } from "@vue/test-utils";
import ActionMenuGroup from "../ActionMenuGroup.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Entitytyping, DropdownOption } from "@/generated-types/queries";
import {
  ActionContextEntitiesSelectionType,
  TypeModals,
  Permission,
  ActionContextViewModeTypes,
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
      formQueries: ["GetForm"],
      formRelationType: null,
      askForCloseConfirmation: true,
      neededPermission: Permission.Canupdate,
    },
    can: ["can_do_whatever_you_want"],
  };

  const mountWith = (options: DropdownOption[]) =>
    mount(ActionMenuGroup, {
      props: {
        options,
        isMainActionDisabled: false,
        entityType: "Entitytyping" as Entitytyping,
      },
    });

  it("renders every option graphql returned", async () => {
    const wrapper = mountWith([bulkOption, { ...bulkOption, can: undefined }]);

    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(2);
  });

  it("hides an option that requires a login from an anonymous visitor", async () => {
    const { auth } = await import("@/main");
    // @ts-expect-error the global test mock hands out a plain ref
    auth.isAuthenticated.value = false;

    const wrapper = mountWith([
      { ...bulkOption, requiresAuth: true },
      { ...bulkOption, requiresAuth: false },
    ]);
    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(1);

    // @ts-expect-error see above
    auth.isAuthenticated.value = true;
  });

  it("picks up options that arrive after mount", async () => {
    const wrapper = mountWith([]);
    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(0);

    await wrapper.setProps({
      options: [bulkOption, { ...bulkOption, can: undefined }],
    });
    await flushPromises();

    expect(wrapper.vm.availableOptions.length).toBe(2);
  });
});
