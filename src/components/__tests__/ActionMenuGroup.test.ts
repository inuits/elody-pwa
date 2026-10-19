import { mount } from "@vue/test-utils";
import ActionMenuGroup from "../ActionMenuGroup.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Entitytyping, DropdownOption } from "@/generated-types/queries";
import {
  ActionTone,
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

  describe("split button", () => {
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
        global: {
          stubs: {
            unicon: true,
            BaseTooltip: true,
            BaseContextMenu: { template: '<div data-test="menu"><slot /></div>' },
          },
        },
      });
    // A lone action is a plain button, so look for it by style, not position.
    const primary = (wrapper: ReturnType<typeof mountRow>) =>
      wrapper
        .findAllComponents({ name: "BaseButtonNew" })
        .find((button) => button.props("label")?.startsWith("label."))!;
    const menuLabels = (wrapper: ReturnType<typeof mountRow>) =>
      wrapper
        .find('[data-test="menu"]')
        .findAllComponents({ name: "BaseContextMenuItem" })
        .map((item) => item.props("label"));

    it("joins the primary and the other actions in a split button", async () => {
      const wrapper = mountRow([
        option("create", { primary: true }),
        option("export"),
      ]);
      await flushPromises();

      expect(wrapper.find('[role="group"]').exists()).toBe(true);
      expect(primary(wrapper).props("label")).toBe("label.create");
      expect(primary(wrapper).props("buttonStyle")).toBe("primary");
      expect(menuLabels(wrapper)).toEqual(["label.export"]);
    });

    it("puts further primaries in the menu", async () => {
      const wrapper = mountRow([
        option("create", { primary: true }),
        option("export"),
        option("import", { primary: true }),
      ]);
      await flushPromises();

      expect(primary(wrapper).props("label")).toBe("label.create");
      expect(menuLabels(wrapper)).toEqual(["label.import", "label.export"]);
    });

    it("shows a labelled actions trigger without a primary", async () => {
      const wrapper = mountRow([option("export"), option("delete")]);
      await flushPromises();

      expect(wrapper.find('[data-cy="overflow-menu-trigger"]').text()).toContain(
        "contextMenu.actions",
      );
      expect(menuLabels(wrapper)).toEqual(["label.export", "label.delete"]);
    });

    it("keeps an unavailable primary visible but disabled", async () => {
      const wrapper = mountRow([
        option("edit", { primary: true, ...someSelected }),
      ]);
      await flushPromises();

      expect(primary(wrapper).props("disabled")).toBe(true);
    });

    it("never renders a bare ellipsis trigger", async () => {
      const wrapper = mountRow([option("a", { primary: true }), option("b")]);
      await flushPromises();

      expect(
        wrapper
          .findAllComponents({ name: "BaseButtonNew" })
          .some((b) => b.props("icon") === "EllipsisV"),
      ).toBe(false);
    });

    it("shows destructive actions last in danger ink", async () => {
      const wrapper = mountRow([
        option("create", { primary: true }),
        option("delete", { tone: ActionTone.Danger }),
        option("export"),
      ]);
      await flushPromises();
      const items = wrapper
        .find('[data-test="menu"]')
        .findAllComponents({ name: "BaseContextMenuItem" });

      expect(items.map((item) => item.props("label"))).toEqual([
        "label.export",
        "label.delete",
      ]);
      expect(items[1].attributes("style")).toContain(
        "--menu-item-ink: var(--color-danger-ink)",
      );
    });

    it("names a selection action with the selection count", async () => {
      const wrapper = mountRow(
        [option("delete", { primary: true, ...someSelected })],
        [{ id: "1" }, { id: "2" }],
      );
      await flushPromises();

      expect(primary(wrapper).props("ariaLabel")).toBe(
        "bulk-operations.action-for-selection:label.delete,2",
      );
    });
  });

  describe("flat (the list's selection row)", () => {
    const action = (value: string, extra: Partial<DropdownOption> = {}) =>
      ({
        label: `bulk-operations.${value}`,
        value,
        actionContext: {
          entitiesSelectionType: ActionContextEntitiesSelectionType.SomeSelected,
          activeViewMode: [ActionContextViewModeTypes.ReadMode],
          labelForTooltip: null,
        },
        ...extra,
      }) as DropdownOption;

    const mountFlat = (options: DropdownOption[], itemsSelected = false) =>
      mount(ActionMenuGroup, {
        props: {
          options,
          itemsSelected,
          flat: true,
          entityType: "Entitytyping" as Entitytyping,
          clearSubDropdownOptions: () => {},
        },
      });

    const buttons = (wrapper: ReturnType<typeof mountFlat>) =>
      wrapper.findAllComponents({ name: "BaseButtonNew" });

    it("shows every action as its own button, destructive last", async () => {
      const wrapper = mountFlat([
        action("delete", { tone: ActionTone.Danger }),
        action("export"),
        action("merge"),
      ]);
      await flushPromises();

      expect(buttons(wrapper).map((b) => b.props("label"))).toEqual([
        "bulk-operations.export",
        "bulk-operations.merge",
        "bulk-operations.delete",
      ]);
      expect(wrapper.find('[data-cy="split-button-chevron"]').exists()).toBe(
        false,
      );
    });

    it("disables selection actions until something is selected", async () => {
      const idle = mountFlat([action("export")]);
      const selecting = mountFlat([action("export")], true);
      await flushPromises();

      expect(buttons(idle)[0].props("disabled")).toBe(true);
      expect(buttons(selecting)[0].props("disabled")).toBe(false);
    });

    it("marks a destructive action in danger ink", async () => {
      const wrapper = mountFlat([action("delete", { tone: ActionTone.Danger })]);
      await flushPromises();

      expect(buttons(wrapper)[0].classes()).toContain("!text-danger-ink");
    });

    it("runs an action from its button", async () => {
      const wrapper = mountFlat([action("export")], true);
      await flushPromises();

      await buttons(wrapper)[0].trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toMatchObject({
        value: "export",
      });
    });
  });
});
