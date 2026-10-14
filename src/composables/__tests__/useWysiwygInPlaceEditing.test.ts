import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";

const mocks = vi.hoisted(() => ({ saveScope: vi.fn() }));

vi.mock("@/composables/useScopedSave", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/composables/useScopedSave")>()),
  saveScope: mocks.saveScope,
}));

vi.mock("@/main", () => ({ apolloClient: {} }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

import { useWysiwygInPlaceEditing } from "@/composables/useWysiwygInPlaceEditing";
import { useEditScope } from "@/composables/useEditScope";

const fakeEditor = (html = "<p>Oud</p>") => {
  const editor = {
    html,
    editable: false,
    getHTML: () => editor.html,
    setEditable: vi.fn((value: boolean) => (editor.editable = value)),
    commands: {
      setContent: vi.fn((content: string) => (editor.html = content)),
      focus: vi.fn(),
    },
  };
  return editor;
};

const setup = (overrides: Record<string, unknown> = {}) => {
  const editor = fakeEditor();
  let stored = "<p>Oud</p>";
  const options = {
    scopeId: () => "form-1:description",
    metadataKey: () => "description",
    entityId: () => "entity-1",
    collection: () => "entities" as any,
    canEdit: () => true,
    getEditor: () => editor as any,
    readValue: () => stored,
    writeValue: vi.fn((value: string) => (stored = value)),
    locale: () => undefined as string | undefined,
    onSaved: vi.fn(),
    ...overrides,
  };
  const editing = useWysiwygInPlaceEditing(options);
  const type = (html: string) => {
    editor.html = html;
    editing.notifyChange();
  };
  return { editing, editor, options, type, stored: () => stored };
};

describe("useWysiwygInPlaceEditing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const scope = useEditScope();
    if (scope.activeScope.value) scope.release(scope.activeScope.value.id);
  });

  describe("opening", () => {
    it("makes the editor editable and focuses it", async () => {
      const { editing, editor } = setup();
      await editing.start();
      expect(editing.isEditing.value).toBe(true);
      expect(editor.setEditable).toHaveBeenCalledWith(true);
      expect(editor.commands.focus).toHaveBeenCalled();
    });

    it("does nothing when the field can't be edited in place", async () => {
      const { editing, editor } = setup({ canEdit: () => false });
      await editing.start();
      expect(editing.isEditing.value).toBe(false);
      expect(editor.setEditable).not.toHaveBeenCalled();
    });

    it("opens its own edit scope", async () => {
      const { editing } = setup();
      await editing.start();
      expect(useEditScope().isActive("form-1:description")).toBe(true);
    });

    it("stays closed while another changed scope is open", async () => {
      useEditScope().requestOpen({ id: "other", isDirty: () => true });
      const { editing } = setup();
      await editing.start();
      expect(editing.isEditing.value).toBe(false);
    });
  });

  describe("dirty state", () => {
    it("is pristine right after opening", async () => {
      const { editing } = setup();
      await editing.start();
      expect(editing.isDirty.value).toBe(false);
    });

    it("is dirty once the content changes", async () => {
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      expect(editing.isDirty.value).toBe(true);
    });

    it("is pristine again when the change is undone", async () => {
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      type("<p>Oud</p>");
      expect(editing.isDirty.value).toBe(false);
    });

    it("reports a changed editor to the leave prompt", async () => {
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      expect(useEditScope().hasUnsavedChanges.value).toBe(true);
    });
  });

  describe("cancelling", () => {
    it("restores the stored value and the editor content", async () => {
      const { editing, editor, options, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      editing.cancel();
      expect(options.writeValue).toHaveBeenCalledWith("<p>Oud</p>");
      expect(editor.commands.setContent).toHaveBeenCalledWith("<p>Oud</p>");
    });

    it("closes and makes the editor read-only again", async () => {
      const { editing, editor } = setup();
      await editing.start();
      editing.cancel();
      expect(editing.isEditing.value).toBe(false);
      expect(editor.setEditable).toHaveBeenLastCalledWith(false);
      expect(useEditScope().isActive("form-1:description")).toBe(false);
    });
  });

  describe("saving", () => {
    it("sends only this field's key with the editor's HTML", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      await editing.save();
      expect(mocks.saveScope).toHaveBeenCalledWith({
        entityId: "entity-1",
        collection: "entities",
        formInput: {
          metadata: [{ key: "description", value: "<p>Nieuw</p>" }],
          relations: [],
          updateOnlyRelations: false,
        },
      });
    });

    it("sends the selected language for a multilingual field", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, type } = setup({ locale: () => "en" });
      await editing.start();
      type("<p>New</p>");
      await editing.save();
      expect(mocks.saveScope.mock.calls[0][0].formInput.metadata).toEqual([
        { key: "description", value: "<p>New</p>", lang: "en" },
      ]);
    });

    it("closes without saving when nothing changed", async () => {
      const { editing } = setup();
      await editing.start();
      await editing.save();
      expect(mocks.saveScope).not.toHaveBeenCalled();
      expect(editing.isEditing.value).toBe(false);
    });

    it("closes, reports the saved value and announces it after a save that worked", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, options, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      await editing.save();
      expect(editing.isEditing.value).toBe(false);
      expect(options.onSaved).toHaveBeenCalledWith("<p>Nieuw</p>", {});
      expect(editing.savedAnnouncement.value).toBe("Saved");
    });

    it("keeps the editor open with the change and shows an error when saving fails", async () => {
      mocks.saveScope.mockRejectedValue(new Error("boom"));
      const { editing, editor, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      await editing.save();
      expect(editing.isEditing.value).toBe(true);
      expect(editor.html).toBe("<p>Nieuw</p>");
      expect(editing.error.value).toBe("Saving failed, try again");
    });

    it("is busy while the save is in flight", async () => {
      let resolve: (value: unknown) => void = () => {};
      mocks.saveScope.mockReturnValue(new Promise((r) => (resolve = r)));
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      const pending = editing.save();
      await nextTick();
      expect(editing.saving.value).toBe(true);
      resolve({});
      await pending;
      expect(editing.saving.value).toBe(false);
    });

    it("lets the leave prompt save the open editor", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      await expect(useEditScope().saveActive()).resolves.toBe(true);
      expect(mocks.saveScope).toHaveBeenCalled();
    });

    it("tells the leave prompt when saving failed", async () => {
      mocks.saveScope.mockRejectedValue(new Error("boom"));
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      await expect(useEditScope().saveActive()).resolves.toBe(false);
    });
  });

  describe("keyboard", () => {
    const key = (init: KeyboardEventInit) =>
      new KeyboardEvent("keydown", { cancelable: true, ...init });

    it("saves on Ctrl+Enter", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      editing.handleKeydown(key({ key: "Enter", ctrlKey: true }));
      await vi.waitFor(() => expect(mocks.saveScope).toHaveBeenCalled());
    });

    it("saves on Cmd+Enter", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, type } = setup();
      await editing.start();
      type("<p>Nieuw</p>");
      editing.handleKeydown(key({ key: "Enter", metaKey: true }));
      await vi.waitFor(() => expect(mocks.saveScope).toHaveBeenCalled());
    });

    it("leaves a plain Enter to the editor", async () => {
      const { editing } = setup();
      await editing.start();
      const event = key({ key: "Enter" });
      editing.handleKeydown(event);
      expect(event.defaultPrevented).toBe(false);
      expect(editing.isEditing.value).toBe(true);
    });

    it("cancels on Escape", async () => {
      const { editing } = setup();
      await editing.start();
      editing.handleKeydown(key({ key: "Escape" }));
      expect(editing.isEditing.value).toBe(false);
    });

    it("leaves an Escape the editor already handled (closing a suggestion)", async () => {
      const { editing } = setup();
      await editing.start();
      const event = key({ key: "Escape" });
      event.preventDefault();
      editing.handleKeydown(event);
      expect(editing.isEditing.value).toBe(true);
    });

    it("leaves keys pressed inside the editor's dialogs alone", async () => {
      const { editing } = setup();
      await editing.start();
      const dialog = document.createElement("dialog");
      const input = document.createElement("input");
      dialog.appendChild(input);
      document.body.appendChild(dialog);
      const event = key({ key: "Escape", bubbles: true });
      Object.defineProperty(event, "target", { value: input });
      editing.handleKeydown(event);
      expect(editing.isEditing.value).toBe(true);
    });

    it("ignores keys while not editing", async () => {
      const { editing } = setup();
      const event = key({ key: "Escape" });
      editing.handleKeydown(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe("clicking outside", () => {
    const outsideClick = (target: Element) =>
      target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    it("closes an unchanged editor", async () => {
      const root = document.createElement("div");
      document.body.appendChild(root);
      const { editing } = setup({ getRoot: () => root });
      await editing.start();
      outsideClick(document.body);
      expect(editing.isEditing.value).toBe(false);
    });

    it("saves a changed editor", async () => {
      mocks.saveScope.mockResolvedValue({ id: "entity-1" });
      const root = document.createElement("div");
      document.body.appendChild(root);
      const { editing, type } = setup({ getRoot: () => root });
      await editing.start();
      type("<p>Nieuw</p>");
      outsideClick(document.body);
      await flushPromises();
      expect(mocks.saveScope).toHaveBeenCalledTimes(1);
      expect(editing.isEditing.value).toBe(false);
    });

    it("treats the editor's own overlays (dialogs, menus) as inside", async () => {
      const root = document.createElement("div");
      const dialog = document.createElement("dialog");
      document.body.append(root, dialog);
      const { editing } = setup({ getRoot: () => root });
      await editing.start();
      outsideClick(dialog);
      expect(editing.isEditing.value).toBe(true);
    });

    it("treats clicks inside the element as inside", async () => {
      const root = document.createElement("div");
      const toolbarButton = document.createElement("button");
      root.appendChild(toolbarButton);
      document.body.appendChild(root);
      const { editing } = setup({ getRoot: () => root });
      await editing.start();
      outsideClick(toolbarButton);
      expect(editing.isEditing.value).toBe(true);
    });
  });

  describe("focus leaving (Tab)", () => {
    const mountRoot = () => {
      const root = document.createElement("div");
      const toolbarButton = document.createElement("button");
      const outside = document.createElement("button");
      root.appendChild(toolbarButton);
      document.body.append(root, outside);
      return { root, toolbarButton, outside };
    };
    const focusout = (relatedTarget: EventTarget | null) =>
      new FocusEvent("focusout", { relatedTarget });

    it("saves a changed editor when focus moves outside it", async () => {
      mocks.saveScope.mockResolvedValue({ id: "entity-1" });
      const { root, outside } = mountRoot();
      const { editing, type } = setup({ getRoot: () => root });
      await editing.start();
      type("<p>Nieuw</p>");
      editing.handleFocusout(focusout(outside));
      await flushPromises();
      expect(mocks.saveScope).toHaveBeenCalledTimes(1);
    });

    it("closes an unchanged editor when focus moves outside it", async () => {
      const { root, outside } = mountRoot();
      const { editing } = setup({ getRoot: () => root });
      await editing.start();
      editing.handleFocusout(focusout(outside));
      await flushPromises();
      expect(editing.isEditing.value).toBe(false);
      expect(mocks.saveScope).not.toHaveBeenCalled();
    });

    it("stays open when focus moves to the toolbar or goes nowhere", async () => {
      const { root, toolbarButton } = mountRoot();
      const { editing, type } = setup({ getRoot: () => root });
      await editing.start();
      type("<p>Nieuw</p>");
      editing.handleFocusout(focusout(toolbarButton));
      editing.handleFocusout(focusout(null));
      await flushPromises();
      expect(editing.isEditing.value).toBe(true);
      expect(mocks.saveScope).not.toHaveBeenCalled();
      editing.cancel();
    });
  });

  describe("opening another field", () => {
    it("saves once when leaving the editor and opening the other field go together", async () => {
      mocks.saveScope.mockResolvedValue({ id: "entity-1" });
      const root = document.createElement("div");
      document.body.appendChild(root);
      const { editing, type } = setup({ getRoot: () => root });
      await editing.start();
      type("<p>Nieuw</p>");
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      const opened = await useEditScope().requestOpen({
        id: "other",
        isDirty: () => false,
      });
      await flushPromises();
      expect(opened).toBe(true);
      expect(mocks.saveScope).toHaveBeenCalledTimes(1);
      useEditScope().release("other");
    });
  });
});
