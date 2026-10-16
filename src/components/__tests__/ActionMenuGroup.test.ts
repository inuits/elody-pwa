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
    AngleDown: { name: "angle-down" },
    AngleUp: { name: "angle-up" },
    QuestionCircle: { name: "question-circle" },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown> | unknown[]) =>
      params && !Array.isArray(params)
        ? `${key}:${Object.values(params).join(",")}`
        : key,
  }),
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

  describe("primaryFallback", () => {
    const create: DropdownOption = {
      label: "bulk-operations.create",
      value: "createEntity",
      primary: true,
      actionContext: {
        entitiesSelectionType: ActionContextEntitiesSelectionType.NoneSelected,
      },
    };
    const download: DropdownOption = {
      label: "bulk-operations.download",
      value: "downloadMediafiles",
      primaryFallback: true,
      actionContext: {
        entitiesSelectionType: ActionContextEntitiesSelectionType.SomeSelected,
      },
    };
    const exportCsv: DropdownOption = {
      label: "bulk-operations.export",
      value: "exportCsv",
      primaryFallback: true,
    };

    const mountSelecting = (options: DropdownOption[], itemsSelected: boolean) =>
      mount(ActionMenuGroup, {
        props: {
          options,
          itemsSelected,
          entityType: "Entitytyping" as Entitytyping,
          clearSubDropdownOptions: () => {},
        },
      });

    const values = (options: DropdownOption[]) =>
      options.map((option) => option.value);

    it("keeps an active primary and leaves the fallback in the menu", async () => {
      const wrapper = mountSelecting([create, download], false);
      await flushPromises();

      expect(values(wrapper.vm.primaryOptions)).toEqual(["createEntity"]);
      expect(values(wrapper.vm.secondaryOptions)).toEqual([
        "downloadMediafiles",
      ]);
    });

    it("promotes the fallback when the primary is unavailable", async () => {
      const wrapper = mountSelecting([create, download], true);
      await flushPromises();

      expect(values(wrapper.vm.primaryOptions)).toEqual(["downloadMediafiles"]);
      expect(values(wrapper.vm.secondaryOptions)).toEqual(["createEntity"]);
    });

    it("skips an unavailable fallback for the next one in declaration order", async () => {
      const addExisting: DropdownOption = {
        ...create,
        value: "addRelation",
        primary: false,
        primaryFallback: true,
      };
      const wrapper = mountSelecting([create, addExisting, exportCsv], true);
      await flushPromises();

      expect(values(wrapper.vm.primaryOptions)).toEqual(["exportCsv"]);
    });

    it("shows the disabled primary when no fallback is available", async () => {
      const wrapper = mountSelecting([create, { ...download, primaryFallback: false }], true);
      await flushPromises();

      expect(values(wrapper.vm.primaryOptions)).toEqual(["createEntity"]);
      expect(wrapper.vm.primaryOptions[0].active).toBe(false);
    });
  });

  describe("visible action row", () => {
    const option = (value: string, extra: Partial<DropdownOption> = {}) =>
      ({ label: `label.${value}`, value, ...extra }) as DropdownOption;
    const someSelected = {
      actionContext: {
        entitiesSelectionType: ActionContextEntitiesSelectionType.SomeSelected,
      },
    };

    const mountRow = (
      options: DropdownOption[],
      selectedItems: { id: string }[] = [],
    ) =>
      mount(ActionMenuGroup, {
        props: {
          options,
          itemsSelected: selectedItems.length > 0,
          selectedItems: selectedItems as any,
          entityType: "Entitytyping" as Entitytyping,
          clearSubDropdownOptions: () => {},
        },
        attachTo: document.body,
        global: { stubs: { unicon: true, BaseTooltip: true } },
      });
    const buttons = (wrapper: ReturnType<typeof mountRow>) =>
      wrapper.findAllComponents({ name: "BaseButtonNew" });

    it("shows secondary actions as visible labelled buttons", async () => {
      const wrapper = mountRow([
        option("create", { primary: true }),
        option("export"),
      ]);
      await flushPromises();

      expect(buttons(wrapper).map((b) => b.props("label"))).toEqual([
        "label.create",
        "label.export",
      ]);
      expect(buttons(wrapper)[0].props("buttonStyle")).toBe("primary");
      expect(buttons(wrapper)[1].props("buttonStyle")).toBe("secondary");
      expect(buttons(wrapper)[1].props("forceShowLabel")).toBe(true);
    });

    it("keeps an action that needs a selection visible but disabled", async () => {
      const wrapper = mountRow([option("edit", someSelected)]);
      await flushPromises();

      expect(buttons(wrapper)[0].props("disabled")).toBe(true);
    });

    it("moves actions beyond five into a labelled overflow menu", async () => {
      const wrapper = mountRow(
        ["a", "b", "c", "d", "e", "f", "g"].map((value) => option(value)),
      );
      await flushPromises();

      const labels = buttons(wrapper).map((b) => b.props("label"));
      expect(labels).toEqual([
        "label.a",
        "label.b",
        "label.c",
        "label.d",
        "label.e",
        "bulk-operations.more-actions",
      ]);
      expect(wrapper.find('[aria-haspopup="menu"]').exists()).toBe(true);
      expect(wrapper.vm.overflowOptions.map((o: DropdownOption) => o.value))
        .toEqual(["f", "g"]);
    });

    it("never renders a bare ellipsis trigger", async () => {
      const wrapper = mountRow(
        ["a", "b", "c", "d", "e", "f"].map((value) => option(value)),
      );
      await flushPromises();

      expect(
        buttons(wrapper).some((b) => b.props("icon") === "EllipsisV"),
      ).toBe(false);
    });

    it("names a selection action with the selection count", async () => {
      const wrapper = mountRow(
        [option("delete", someSelected), option("create")],
        [{ id: "1" }, { id: "2" }],
      );
      await flushPromises();

      expect(buttons(wrapper)[0].props("ariaLabel")).toBe(
        "bulk-operations.action-for-selection:label.delete,2",
      );
      expect(buttons(wrapper)[1].props("ariaLabel")).toBeUndefined();
    });
  });
});
