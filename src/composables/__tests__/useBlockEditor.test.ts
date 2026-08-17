import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useBlockEditor, type GroupMember } from "@/composables/useBlockEditor";
import { useFieldEditor } from "@/composables/useFieldEditor";

const member = (key: string, overrides: Partial<GroupMember> = {}) => {
  const value = ref<string>(`${key}-original`);
  return {
    member: {
      key,
      snapshot: () => JSON.stringify(value.value),
      restore: (raw: string) => (value.value = JSON.parse(raw)),
      validate: async () => true,
      ...overrides,
    } as GroupMember,
    value,
  };
};

describe("useBlockEditor", () => {
  beforeEach(() => {
    useFieldEditor().reset();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("opens every member together, from a click on any one of them", () => {
    const a = member("a");
    const b = member("b");
    const group = useBlockEditor("panel-1", async () => undefined);
    group.register(a.member);
    group.register(b.member);

    group.open();

    expect(group.isEditing.value).toBe(true);
    expect(useFieldEditor().isEditing("panel-1")).toBe(true);
  });

  it("is dirty when any single member changed", () => {
    const a = member("a");
    const b = member("b");
    const group = useBlockEditor("panel-1", async () => undefined);
    group.register(a.member);
    group.register(b.member);
    group.open();

    expect(group.isDirty.value).toBe(false);
    b.value.value = "changed";
    expect(group.isDirty.value).toBe(true);
  });

  it("restores every member on cancel, not just the changed one", () => {
    const a = member("a");
    const b = member("b");
    const group = useBlockEditor("panel-1", async () => undefined);
    group.register(a.member);
    group.register(b.member);
    group.open();

    a.value.value = "changed-a";
    b.value.value = "changed-b";
    useFieldEditor().cancel();

    expect(a.value.value).toBe("a-original");
    expect(b.value.value).toBe("b-original");
  });

  it("commits once for the whole group rather than once per member", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const group = useBlockEditor("panel-1", submit);
    group.register(member("a").member);
    group.register(member("b").member);
    group.open();

    await useFieldEditor().save();

    expect(submit).toHaveBeenCalledOnce();
  });

  it("fails the whole group when one member is invalid", async () => {
    const submit = vi.fn();
    const group = useBlockEditor("panel-1", submit);
    group.register(member("a").member);
    group.register(member("b", { validate: async () => false }).member);
    group.open();

    await useFieldEditor().save();

    expect(submit).not.toHaveBeenCalled();
    expect(group.isEditing.value).toBe(true);
  });

  it("forgets a member that leaves the panel", () => {
    const a = member("a");
    const group = useBlockEditor("panel-1", async () => undefined);
    group.register(a.member);
    group.unregister("a");
    group.open();

    a.value.value = "changed";

    expect(group.isDirty.value).toBe(false);
  });
});
