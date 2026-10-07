import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

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
    it("makes the editor editable and focuses it", () => {
      const { editing, editor } = setup();
      editing.start();
      expect(editing.isEditing.value).toBe(true);
      expect(editor.setEditable).toHaveBeenCalledWith(true);
      expect(editor.commands.focus).toHaveBeenCalled();
    });

    it("does nothing when the field can't be edited in place", () => {
      const { editing, editor } = setup({ canEdit: () => false });
      editing.start();
      expect(editing.isEditing.value).toBe(false);
      expect(editor.setEditable).not.toHaveBeenCalled();
    });

    it("opens its own edit scope", () => {
      const { editing } = setup();
      editing.start();
      expect(useEditScope().isActive("form-1:description")).toBe(true);
    });

    it("stays closed while another changed scope is open", () => {
      useEditScope().requestOpen({ id: "other", isDirty: () => true });
      const { editing } = setup();
      editing.start();
      expect(editing.isEditing.value).toBe(false);
    });
  });

  describe("dirty state", () => {
    it("is pristine right after opening", () => {
      const { editing } = setup();
      editing.start();
      expect(editing.isDirty.value).toBe(false);
    });

    it("is dirty once the content changes", () => {
      const { editing, type } = setup();
      editing.start();
      type("<p>Nieuw</p>");
      expect(editing.isDirty.value).toBe(true);
    });

    it("is pristine again when the change is undone", () => {
      const { editing, type } = setup();
      editing.start();
      type("<p>Nieuw</p>");
      type("<p>Oud</p>");
      expect(editing.isDirty.value).toBe(false);
    });

    it("reports a changed editor to the leave prompt", () => {
      const { editing, type } = setup();
      editing.start();
      type("<p>Nieuw</p>");
      expect(useEditScope().hasUnsavedChanges.value).toBe(true);
    });
  });

  describe("cancelling", () => {
    it("restores the stored value and the editor content", () => {
      const { editing, editor, options, type } = setup();
      editing.start();
      type("<p>Nieuw</p>");
      editing.cancel();
      expect(options.writeValue).toHaveBeenCalledWith("<p>Oud</p>");
      expect(editor.commands.setContent).toHaveBeenCalledWith("<p>Oud</p>");
    });

    it("closes and makes the editor read-only again", () => {
      const { editing, editor } = setup();
      editing.start();
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
      editing.start();
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
      editing.start();
      type("<p>New</p>");
      await editing.save();
      expect(mocks.saveScope.mock.calls[0][0].formInput.metadata).toEqual([
        { key: "description", value: "<p>New</p>", lang: "en" },
      ]);
    });

    it("closes without saving when nothing changed", async () => {
      const { editing } = setup();
      editing.start();
      await editing.save();
      expect(mocks.saveScope).not.toHaveBeenCalled();
      expect(editing.isEditing.value).toBe(false);
    });

    it("closes, reports the saved value and announces it after a save that worked", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, options, type } = setup();
      editing.start();
      type("<p>Nieuw</p>");
      await editing.save();
      expect(editing.isEditing.value).toBe(false);
      expect(options.onSaved).toHaveBeenCalledWith("<p>Nieuw</p>", {});
      expect(editing.savedAnnouncement.value).toBe("Saved");
    });

    it("keeps the editor open with the change and shows an error when saving fails", async () => {
      mocks.saveScope.mockRejectedValue(new Error("boom"));
      const { editing, editor, type } = setup();
      editing.start();
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
      editing.start();
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
      editing.start();
      type("<p>Nieuw</p>");
      await expect(useEditScope().saveActive()).resolves.toBe(true);
      expect(mocks.saveScope).toHaveBeenCalled();
    });

    it("tells the leave prompt when saving failed", async () => {
      mocks.saveScope.mockRejectedValue(new Error("boom"));
      const { editing, type } = setup();
      editing.start();
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
      editing.start();
      type("<p>Nieuw</p>");
      editing.handleKeydown(key({ key: "Enter", ctrlKey: true }));
      await vi.waitFor(() => expect(mocks.saveScope).toHaveBeenCalled());
    });

    it("saves on Cmd+Enter", async () => {
      mocks.saveScope.mockResolvedValue({});
      const { editing, type } = setup();
      editing.start();
      type("<p>Nieuw</p>");
      editing.handleKeydown(key({ key: "Enter", metaKey: true }));
      await vi.waitFor(() => expect(mocks.saveScope).toHaveBeenCalled());
    });

    it("leaves a plain Enter to the editor", () => {
      const { editing } = setup();
      editing.start();
      const event = key({ key: "Enter" });
      editing.handleKeydown(event);
      expect(event.defaultPrevented).toBe(false);
      expect(editing.isEditing.value).toBe(true);
    });

    it("cancels on Escape", () => {
      const { editing } = setup();
      editing.start();
      editing.handleKeydown(key({ key: "Escape" }));
      expect(editing.isEditing.value).toBe(false);
    });

    it("leaves an Escape the editor already handled (closing a suggestion)", () => {
      const { editing } = setup();
      editing.start();
      const event = key({ key: "Escape" });
      event.preventDefault();
      editing.handleKeydown(event);
      expect(editing.isEditing.value).toBe(true);
    });

    it("leaves keys pressed inside the editor's dialogs alone", () => {
      const { editing } = setup();
      editing.start();
      const dialog = document.createElement("dialog");
      const input = document.createElement("input");
      dialog.appendChild(input);
      document.body.appendChild(dialog);
      const event = key({ key: "Escape", bubbles: true });
      Object.defineProperty(event, "target", { value: input });
      editing.handleKeydown(event);
      expect(editing.isEditing.value).toBe(true);
    });

    it("ignores keys while not editing", () => {
      const { editing } = setup();
      const event = key({ key: "Escape" });
      editing.handleKeydown(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe("clicking outside", () => {
    const outsideClick = (target: Element) =>
      target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    it("closes an unchanged editor", () => {
      const root = document.createElement("div");
      document.body.appendChild(root);
      const { editing } = setup({ getRoot: () => root });
      editing.start();
      outsideClick(document.body);
      expect(editing.isEditing.value).toBe(false);
    });

    it("keeps a changed editor open", () => {
      const root = document.createElement("div");
      document.body.appendChild(root);
      const { editing, type } = setup({ getRoot: () => root });
      editing.start();
      type("<p>Nieuw</p>");
      outsideClick(document.body);
      expect(editing.isEditing.value).toBe(true);
    });

    it("treats the editor's own overlays (dialogs, menus) as inside", () => {
      const root = document.createElement("div");
      const dialog = document.createElement("dialog");
      document.body.append(root, dialog);
      const { editing } = setup({ getRoot: () => root });
      editing.start();
      outsideClick(dialog);
      expect(editing.isEditing.value).toBe(true);
    });

    it("treats clicks inside the element as inside", () => {
      const root = document.createElement("div");
      const toolbarButton = document.createElement("button");
      root.appendChild(toolbarButton);
      document.body.appendChild(root);
      const { editing } = setup({ getRoot: () => root });
      editing.start();
      outsideClick(toolbarButton);
      expect(editing.isEditing.value).toBe(true);
    });
  });
});
