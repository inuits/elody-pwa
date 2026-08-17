import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFieldEditor, type EditScope } from "@/composables/useFieldEditor";

const scope = (id: string, overrides: Partial<EditScope> = {}): EditScope => ({
  id,
  isDirty: () => false,
  restore: vi.fn(),
  validate: async () => true,
  submit: async () => undefined,
  ...overrides,
});

describe("useFieldEditor", () => {
  beforeEach(() => {
    useFieldEditor().reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("one scope at a time", () => {
    it("opens a scope and reports it as the editing one", () => {
      const editor = useFieldEditor();
      expect(editor.open(scope("a"))).toBe(true);
      expect(editor.isEditing("a")).toBe(true);
      expect(editor.isEditing("b")).toBe(false);
    });

    it("moves to another scope when the open one has no changes to lose", () => {
      const editor = useFieldEditor();
      editor.open(scope("a"));
      expect(editor.open(scope("b"))).toBe(true);
      expect(editor.isEditing("a")).toBe(false);
      expect(editor.isEditing("b")).toBe(true);
    });

    it("refuses to leave a scope with unsaved changes, and never discards them", () => {
      const editor = useFieldEditor();
      const restore = vi.fn();
      editor.open(scope("a", { isDirty: () => true, restore }));

      expect(editor.open(scope("b"))).toBe(false);
      expect(editor.isEditing("a")).toBe(true);
      expect(editor.isEditing("b")).toBe(false);
      expect(restore).not.toHaveBeenCalled();
    });
  });

  describe("undo", () => {
    it("puts the value back the way it was and commits that", async () => {
      const editor = useFieldEditor();
      const restore = vi.fn();
      const submit = vi.fn().mockResolvedValue(undefined);
      editor.open(scope("a", { restore, submit }));
      await editor.save();

      await editor.undo();

      expect(restore).toHaveBeenCalledOnce();
      expect(submit).toHaveBeenCalledTimes(2);
      expect(editor.canUndo("a")).toBe(false);
    });

    it("withdraws the offer as soon as the next edit starts", async () => {
      const editor = useFieldEditor();
      editor.open(scope("a"));
      await editor.save();

      editor.open(scope("b"));

      expect(editor.canUndo("a")).toBe(false);
    });

    it("keeps the offer standing when undoing fails", async () => {
      const editor = useFieldEditor();
      let attempt = 0;
      editor.open(
        scope("a", {
          submit: async () => {
            attempt += 1;
            if (attempt > 1) throw new Error("conflict");
          },
        }),
      );
      await editor.save();

      await editor.undo();

      expect(editor.canUndo("a")).toBe(true);
    });
  });

  describe("cancel", () => {
    it("restores the value it opened with and closes", () => {
      const editor = useFieldEditor();
      const restore = vi.fn();
      editor.open(scope("a", { isDirty: () => true, restore }));

      editor.cancel();

      expect(restore).toHaveBeenCalledOnce();
      expect(editor.isEditing("a")).toBe(false);
    });
  });

  describe("save", () => {
    it("closes the editor and flags the row as saved", async () => {
      const editor = useFieldEditor();
      const submit = vi.fn().mockResolvedValue(undefined);
      editor.open(scope("a", { submit }));

      await editor.save();

      expect(submit).toHaveBeenCalledOnce();
      expect(editor.isEditing("a")).toBe(false);
      expect(editor.isSaved("a")).toBe(true);
    });

    it("stops showing the saved mark once it has been seen", async () => {
      const editor = useFieldEditor();
      editor.open(scope("a"));
      await editor.save();

      vi.advanceTimersByTime(2000);

      expect(editor.isSaved("a")).toBe(false);
    });

    it("keeps the editor open on a validation failure", async () => {
      const editor = useFieldEditor();
      const submit = vi.fn();
      editor.open(scope("a", { validate: async () => false, submit }));

      await editor.save();

      expect(submit).not.toHaveBeenCalled();
      expect(editor.isEditing("a")).toBe(true);
      expect(editor.status.value).toBe("error");
    });

    it("keeps the editor open and the value intact when the server rejects it", async () => {
      const editor = useFieldEditor();
      const restore = vi.fn();
      editor.open(
        scope("a", {
          restore,
          submit: async () => {
            throw new Error("conflict");
          },
        }),
      );

      await editor.save();

      expect(editor.isEditing("a")).toBe(true);
      expect(editor.status.value).toBe("error");
      expect(editor.errorMessage.value).toBeTruthy();
      // A closed row never renders an error state, so nothing is rolled back.
      expect(restore).not.toHaveBeenCalled();
    });

    it("offers to undo the save it just made", async () => {
      const editor = useFieldEditor();
      editor.open(scope("a"));
      await editor.save();

      expect(editor.canUndo("a")).toBe(true);
      expect(editor.canUndo("b")).toBe(false);
    });

    it("does not offer undo for a save that failed", async () => {
      const editor = useFieldEditor();
      editor.open(
        scope("a", {
          submit: async () => {
            throw new Error("conflict");
          },
        }),
      );

      await editor.save();

      expect(editor.canUndo("a")).toBe(false);
    });

    it("reports saving while the commit is in flight", async () => {
      const editor = useFieldEditor();
      let release: () => void = () => undefined;
      editor.open(
        scope("a", {
          submit: () => new Promise<void>((resolve) => (release = resolve)),
        }),
      );

      const saving = editor.save();
      // save() validates before it commits, so let that settle and submit start.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(editor.status.value).toBe("saving");

      release();
      await saving;
      expect(editor.status.value).toBe("idle");
    });
  });
});
