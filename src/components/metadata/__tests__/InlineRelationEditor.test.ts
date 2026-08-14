import { mount } from "@vue/test-utils";
import { describe, expect, it, vi, beforeEach } from "vitest";
import InlineRelationEditor from "../InlineRelationEditor.vue";
import { activeInlineScope } from "@/composables/useInlineEditCoordination";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  cancel: vi.fn(),
  save: vi.fn().mockResolvedValue(true),
  hasChanges: vi.fn().mockReturnValue(true),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

vi.mock("@/composables/useBlockEditor", async () => {
  const { ref } = await import("vue");
  return {
    useBlockEditor: () => ({
      isSaving: ref(false),
      blockError: ref(""),
      savedFlash: ref(false),
      hasChanges: mocks.hasChanges,
      start: mocks.start,
      cancel: mocks.cancel,
      save: mocks.save,
    }),
  };
});

const mountEditor = () =>
  mount(InlineRelationEditor, {
    props: { formId: "entity-1", label: "Auteurs" },
    slots: {
      display: '<span data-cy="display-slot">Verhulst, Dimitri</span>',
      editor: '<input data-cy="editor-slot" />',
    },
    global: { stubs: { unicon: true, SpinnerLoader: true } },
  });

describe("InlineRelationEditor", () => {
  let wrapper: ReturnType<typeof mountEditor> | undefined;

  beforeEach(() => {
    // The one-scope-at-a-time coordination is module-global: unmount the
    // previous editor and release the scope so tests stay isolated.
    wrapper?.unmount();
    activeInlineScope.value = null;
    mocks.start.mockClear();
    mocks.cancel.mockClear();
    mocks.save.mockClear();
  });

  it("shows the display slot at rest and opens the editor on click", async () => {
    wrapper = mountEditor();
    expect(wrapper.find("[data-cy='display-slot']").exists()).toBe(true);
    expect(wrapper.find("[data-cy='editor-slot']").exists()).toBe(false);

    await wrapper.find("[data-cy='inline-relation-toggle']").trigger("click");

    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(wrapper.find("[data-cy='editor-slot']").exists()).toBe(true);
  });

  it("cancel restores the snapshot and returns to rest", async () => {
    wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-relation-toggle']").trigger("click");
    await wrapper.find("[data-cy='inline-relation-cancel']").trigger("click");

    expect(mocks.cancel).toHaveBeenCalledTimes(1);
    expect(wrapper.find("[data-cy='display-slot']").exists()).toBe(true);
  });

  it("save submits the scoped relation diff and closes on success", async () => {
    wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-relation-toggle']").trigger("click");
    await wrapper.find("[data-cy='inline-relation-save']").trigger("click");
    await vi.waitFor(() =>
      expect(wrapper.find("[data-cy='editor-slot']").exists()).toBe(false),
    );

    expect(mocks.save).toHaveBeenCalledTimes(1);
    // fields and fieldPaths stay empty: only the relation diff goes out.
    expect(mocks.save.mock.calls[0][0]).toEqual([]);
    expect(mocks.save.mock.calls[0][1]).toEqual([]);
  });

  it("Escape cancels the editor", async () => {
    wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-relation-toggle']").trigger("click");
    await wrapper
      .find("[data-cy='inline-relation-editor']")
      .trigger("keydown", { key: "Escape" });

    expect(mocks.cancel).toHaveBeenCalledTimes(1);
    expect(wrapper.find("[data-cy='display-slot']").exists()).toBe(true);
  });
});
