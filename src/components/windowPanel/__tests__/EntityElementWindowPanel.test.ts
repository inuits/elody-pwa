import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";

const state = vi.hoisted(() => ({
  permittedEditMode: "view",
  rows: undefined as any,
  fields: [] as any[],
  confirmChoice: "confirm",
  saveScope: undefined as any,
  onSaved: undefined as any,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({
    isEdit: false,
    showErrors: false,
    permittedEditMode: state.permittedEditMode,
  }),
}));
vi.mock("@/composables/useRepeatableFields", () => ({
  useRepeatableFields: () =>
    state.rows ?? {
      repeatAmount: ref(1),
      fields: ref([]),
      init: vi.fn(),
      increaseFieldRepeatAmount: vi.fn(),
      decreaseFieldRepeatAmount: vi.fn(),
    },
}));
vi.mock("@/composables/useScopedSave", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/composables/useScopedSave")>()),
  saveScope: (...args: unknown[]) => state.saveScope(...args),
}));
vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({ confirm: async () => state.confirmChoice }),
}));
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({ displayErrorNotification: vi.fn() }),
}));
vi.mock("@/composables/useWindowOrPanelStatus", () => ({
  useWindowOrPanelStatus: () => ({
    getStatusMetadata: () => ({ key: "status" }),
    registerEditableKey: vi.fn(),
  }),
}));
vi.mock("@/components/library/useBaseLibrary", () => ({
  getLibraryDataValue: () => undefined,
}));
vi.mock("@/helpers", () => ({ getMetadataFields: () => state.fields }));
vi.mock("@/types", () => ({
  Unicons: {
    CompressAlt: { name: "compress" },
    ExpandAlt: { name: "expand" },
    Plus: { name: "plus" },
    Check: { name: "check" },
  },
}));

import EntityElementWindowPanel from "../EntityElementWindowPanel.vue";
import {
  SAVED_FLASH_MS,
  useParentSavedFlash,
} from "@/composables/useSavedFlash";

const mountPanel = () =>
  mount(EntityElementWindowPanel, {
    props: {
      panel: {
        panelType: "metadata",
        isCollapsed: false,
        panelHeaderContent: { label: "Status", panelStatus: { key: "status" } },
      } as any,
      identifiers: [],
      isEdit: false,
      formId: "E-1",
    },
    global: {
      stubs: {
        unicon: true,
        WindowPanelContent: true,
        BaseButtonNew: true,
        // A row inside the panel: saving it flashes the panel's check.
        MetadataWrapper: {
          setup: () => ({ flashPanel: useParentSavedFlash() }),
          template:
            "<div data-cy='panel-status'><span data-cy='status-value' @click='flashPanel'>Draft</span></div>",
        },
      },
    },
  });

const isCollapsed = (wrapper: ReturnType<typeof mountPanel>) =>
  wrapper
    .find(".grid.transition-\\[grid-template-rows\\]")
    .classes()
    .includes("grid-rows-[0fr]");

describe("EntityElementWindowPanel header", () => {
  it("collapses the panel from a click on the header", async () => {
    const wrapper = mountPanel();
    await wrapper.find("h2").trigger("click");
    expect(isCollapsed(wrapper)).toBe(true);
  });

  it("keeps the status only as wide as its value, so the rest of the header toggles", () => {
    const status = mountPanel().find('[data-cy="panel-header-status"]');
    expect(status.classes()).toContain("w-fit");
    expect(status.classes()).not.toContain("w-full");
  });

  it("gives the status room again while its inline editor is open", () => {
    const status = mountPanel().find('[data-cy="panel-header-status"]');
    expect(status.classes()).toContain(
      "has-[[data-cy=inline-field-editor]]:w-full",
    );
  });

  it("flashes the saved check in its header for 2s when a row inside saves", async () => {
    vi.useFakeTimers();
    const wrapper = mountPanel();
    const check = () => wrapper.find('[data-cy="panel-saved-check"]');
    expect(check().exists()).toBe(false);
    await wrapper.find('[data-cy="status-value"]').trigger("click");
    expect(check().exists()).toBe(true);
    vi.advanceTimersByTime(SAVED_FLASH_MS);
    await flushPromises();
    expect(check().exists()).toBe(false);
    vi.useRealTimers();
  });

  it("leaves the panel as it is when the status field in the header is clicked (to edit it)", async () => {
    const wrapper = mountPanel();
    await wrapper.find('[data-cy="status-value"]').trigger("click");
    expect(isCollapsed(wrapper)).toBe(false);
  });
});

describe("EntityElementWindowPanel — repeatable rows edited in place", () => {
  const rowsHelper = () => ({
    repeatAmount: ref(2),
    fields: ref([{ isLast: false }, { isLast: true }]),
    init: vi.fn(),
    increaseFieldRepeatAmount: vi.fn(),
    decreaseFieldRepeatAmount: vi.fn(),
    fieldKey: "isbn_group",
    addRow: vi.fn(),
    isStoredRow: vi.fn((index: number) => index === 0),
    canRemoveRow: vi.fn(() => true),
    rowsWithout: vi.fn(() => [{ isbn: "222" }]),
    removeSavedRow: vi.fn(),
    discardUnsavedRow: vi.fn(),
  });

  const mountRepeatable = (
    panel: Record<string, unknown> = {},
    stubs: Record<string, unknown> = {},
  ) =>
    mount(EntityElementWindowPanel, {
      attachTo: document.body,
      props: {
        panel: {
          panelType: "metadata",
          isCollapsed: false,
          isEditable: true,
          panelHeaderContent: { label: "ISBN" },
          repetitionConfig: { repetitionKey: "isbn_group" },
          ...panel,
        } as any,
        identifiers: [],
        isEdit: false,
        formId: "E-1",
      },
      global: {
        provide: { entityFormData: { id: "E-1", onSaved: state.onSaved } },
        stubs: {
          unicon: true,
          WindowPanelContent: true,
          BaseButtonNew: {
            props: ["label", "ariaLabel"],
            emits: ["click"],
            template:
              '<button :aria-label="ariaLabel" @click="$emit(\'click\', $event)">{{ label }}</button>',
          },
          MetadataWrapper: true,
          ...stubs,
        },
      },
    });

  beforeEach(() => {
    document.body.innerHTML = "";
    state.permittedEditMode = "edit";
    state.rows = rowsHelper();
    state.fields = [{ key: "isbn", inputField: { type: "text" } }];
    state.confirmChoice = "confirm";
    state.saveScope = vi.fn().mockResolvedValue({ id: "E-1" });
    state.onSaved = vi.fn();
  });

  it("adds a row from the header when the entity can be updated", async () => {
    const wrapper = mountRepeatable();
    const add = wrapper.find('[data-cy="repeatable-add-row"]');
    expect(add.text()).toBe("actions.labels.add-more");
    await add.trigger("click");
    expect(state.rows.addRow).toHaveBeenCalled();
  });

  it("offers no rows to add or remove when the entity can't be updated", () => {
    state.permittedEditMode = "view";
    const wrapper = mountRepeatable();
    expect(wrapper.find('[data-cy="repeatable-add-row"]').exists()).toBe(false);
    expect(wrapper.find('[data-cy="repeatable-remove-row"]').exists()).toBe(
      false,
    );
  });

  it("always offers Add more, also while a row isn't saved yet", () => {
    state.rows.isStoredRow.mockReturnValue(false);
    expect(
      mountRepeatable().find('[data-cy="repeatable-add-row"]').exists(),
    ).toBe(true);
  });

  it("moves the focus to the first field of the row it adds", async () => {
    state.rows.addRow.mockReturnValue(1);
    const wrapper = mountRepeatable(
      {},
      {
        WindowPanelContent: {
          template:
            "<div><span data-cy='field-value' role='button' tabindex='0'>x</span></div>",
        },
      },
    );
    await wrapper.find('[data-cy="repeatable-add-row"]').trigger("click");
    await flushPromises();
    const rows = wrapper.findAll('[data-cy="field-value"]');
    expect(document.activeElement).toBe(rows[1].element);
    wrapper.unmount();
  });

  it("offers no rows to add when no field of the panel has an input", () => {
    state.fields = [{ key: "isbn" }];
    expect(
      mountRepeatable().find('[data-cy="repeatable-add-row"]').exists(),
    ).toBe(false);
  });

  it("makes the rows a list, one list item per row", () => {
    const wrapper = mountRepeatable();
    expect(wrapper.findAll('[role="list"]')).toHaveLength(1);
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(2);
  });

  it("stripes the rows and fills a row on hover", () => {
    const row = mountRepeatable().find('[role="listitem"]');
    expect(row.classes()).toEqual(
      expect.arrayContaining([
        "even:bg-surface-repeat-row",
        "hover:bg-surface-row-hover",
      ]),
    );
  });

  it("names each remove button after the row's value, else its number", () => {
    state.rows.fields.value = [
      { isLast: false, value: { isbn: "978-90-01" } },
      { isLast: true, value: { isbn: "" } },
    ];
    const labels = mountRepeatable()
      .findAll('[data-cy="repeatable-remove-row"]')
      .map((b) => b.attributes("aria-label"));
    expect(labels).toEqual(["Remove row: 978-90-01", "Remove row: ISBN 2"]);
  });

  it("keeps a panel that doesn't repeat out of the list roles", () => {
    expect(mountPanel().find('[role="list"]').exists()).toBe(false);
  });

  it("offers removing only rows that can go", () => {
    state.rows.canRemoveRow.mockImplementation((index: number) => index === 0);
    expect(
      mountRepeatable().findAll('[data-cy="repeatable-remove-row"]'),
    ).toHaveLength(1);
  });

  it("heads each removable row with a line: its number and the remove button", () => {
    const headers = mountRepeatable().findAll(
      '[data-cy="repeatable-row-header"]',
    );
    expect(headers).toHaveLength(2);
    expect(headers[1].text()).toContain("ISBN 2");
    const remove = headers[1].find('[data-cy="repeatable-remove-row"]');
    expect(remove.attributes("aria-label")).toBe("Remove row: ISBN 2");
  });

  it("lets the row headers separate the rows, without an extra line", () => {
    expect(mountRepeatable().findAll("hr")).toHaveLength(0);
  });

  it("keeps the separator line in a panel that can't be edited", () => {
    state.permittedEditMode = "view";
    expect(mountRepeatable().findAll("hr")).toHaveLength(1);
  });

  it("centres the row's number and remove button between two rules", () => {
    const header = mountRepeatable().find('[data-cy="repeatable-row-header"]');
    const children = Array.from(header.element.children);
    expect(children[0].getAttribute("aria-hidden")).toBe("true");
    expect(children[children.length - 1].getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  // BaseButtonNew is full width by default; in the header it would push the
  // rules away and wrap the label.
  it("keeps the row's number and remove button at their own width", () => {
    const header = mountRepeatable().find('[data-cy="repeatable-row-header"]');
    expect(header.find('[data-cy="repeatable-remove-row"]').classes()).toEqual(
      expect.arrayContaining(["!w-max", "shrink-0"]),
    );
    expect(header.find('[data-cy="repeatable-row-label"]').classes()).toEqual(
      expect.arrayContaining(["whitespace-nowrap", "shrink-0"]),
    );
  });

  it("gives a row that can't be removed no header line", () => {
    state.rows.canRemoveRow.mockReturnValue(false);
    expect(
      mountRepeatable().findAll('[data-cy="repeatable-row-header"]'),
    ).toHaveLength(0);
  });

  it("drops an unsaved row at once, without asking or saving", async () => {
    const wrapper = mountRepeatable();
    await wrapper
      .findAll('[data-cy="repeatable-remove-row"]')[1]
      .trigger("click");
    await flushPromises();
    expect(state.rows.discardUnsavedRow).toHaveBeenCalledWith(1);
    expect(state.saveScope).not.toHaveBeenCalled();
  });

  it("removes a row after confirming, saving the list without it", async () => {
    const wrapper = mountRepeatable();
    await wrapper.find('[data-cy="repeatable-remove-row"]').trigger("click");
    await flushPromises();
    expect(state.rows.rowsWithout).toHaveBeenCalledWith(0);
    expect(state.saveScope.mock.calls[0][0]).toMatchObject({
      entityId: "E-1",
      formInput: {
        metadata: [{ key: "isbn_group", value: [{ isbn: "222" }] }],
      },
    });
    expect(state.rows.removeSavedRow).toHaveBeenCalledWith(0, [
      { isbn: "222" },
    ]);
    expect(state.onSaved).toHaveBeenCalledWith({ id: "E-1" });
  });

  it("keeps the row when removing isn't confirmed", async () => {
    state.confirmChoice = "cancel";
    const wrapper = mountRepeatable();
    await wrapper.find('[data-cy="repeatable-remove-row"]').trigger("click");
    await flushPromises();
    expect(state.saveScope).not.toHaveBeenCalled();
    expect(state.rows.removeSavedRow).not.toHaveBeenCalled();
  });

  it("keeps the row when saving fails", async () => {
    state.saveScope = vi.fn().mockRejectedValue(new Error("no"));
    const wrapper = mountRepeatable();
    await wrapper.find('[data-cy="repeatable-remove-row"]').trigger("click");
    await flushPromises();
    expect(state.rows.removeSavedRow).not.toHaveBeenCalled();
  });
});
