import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { createEditScopeStore } from "@/composables/useEditScope";

const scope = (id: string, dirty = false) => {
  const isDirty = ref(dirty);
  return {
    id,
    isDirty: () => isDirty.value,
    focus: vi.fn(),
    close: vi.fn(),
    save: vi.fn().mockResolvedValue(true),
    discard: vi.fn(),
    setDirty: (value: boolean) => (isDirty.value = value),
  };
};

describe("useEditScope", () => {
  let store: ReturnType<typeof createEditScopeStore>;

  beforeEach(() => {
    store = createEditScopeStore();
  });

  it("opens a scope when nothing is being edited", async () => {
    const field = scope("title");
    expect(await store.requestOpen(field)).toBe(true);
    expect(store.isActive("title")).toBe(true);
  });

  it("keeps a scope open when it is requested again", async () => {
    const field = scope("title");
    await store.requestOpen(field);
    expect(await store.requestOpen(field)).toBe(true);
    expect(field.close).not.toHaveBeenCalled();
  });

  it("closes an unchanged scope when another one opens", async () => {
    const title = scope("title");
    const year = scope("year");
    await store.requestOpen(title);
    expect(await store.requestOpen(year)).toBe(true);
    expect(title.close).toHaveBeenCalled();
    expect(title.save).not.toHaveBeenCalled();
    expect(store.isActive("year")).toBe(true);
  });

  it("saves a changed scope before the next one opens", async () => {
    const title = scope("title", true);
    const year = scope("year");
    await store.requestOpen(title);
    expect(await store.requestOpen(year)).toBe(true);
    expect(title.save).toHaveBeenCalled();
    expect(store.isActive("year")).toBe(true);
  });

  it("keeps a changed scope open when its save fails, and refuses the next one", async () => {
    const title = scope("title", true);
    title.save.mockResolvedValue(false);
    await store.requestOpen(title);
    expect(await store.requestOpen(scope("year"))).toBe(false);
    expect(store.isActive("title")).toBe(true);
    expect(title.close).not.toHaveBeenCalled();
    expect(title.focus).toHaveBeenCalled();
  });

  it("releases only the scope that is active", async () => {
    const title = scope("title");
    await store.requestOpen(title);
    store.release("year");
    expect(store.isActive("title")).toBe(true);
    store.release("title");
    expect(store.isActive("title")).toBe(false);
  });

  it("reports unsaved changes while the active scope is changed", async () => {
    const title = scope("title");
    await store.requestOpen(title);
    expect(store.hasUnsavedChanges.value).toBe(false);
    title.setDirty(true);
    expect(store.hasUnsavedChanges.value).toBe(true);
  });

  it("reports no unsaved changes once the scope is released", async () => {
    await store.requestOpen(scope("title", true));
    store.release("title");
    expect(store.hasUnsavedChanges.value).toBe(false);
  });
});

describe("useEditScope — leaving with changes", () => {
  it("saves the active scope and reports whether it worked", async () => {
    const store = createEditScopeStore();
    const title = scope("title", true);
    await store.requestOpen(title);
    expect(await store.saveActive()).toBe(true);
    expect(title.save).toHaveBeenCalled();
  });

  it("reports a failed save so navigation can stop", async () => {
    const store = createEditScopeStore();
    const title = scope("title", true);
    title.save.mockResolvedValue(false);
    await store.requestOpen(title);
    expect(await store.saveActive()).toBe(false);
  });

  it("discards the active scope's changes", async () => {
    const store = createEditScopeStore();
    const title = scope("title", true);
    await store.requestOpen(title);
    store.discardActive();
    expect(title.discard).toHaveBeenCalled();
  });

  it("treats saving with nothing open as done", async () => {
    expect(await createEditScopeStore().saveActive()).toBe(true);
  });
});
