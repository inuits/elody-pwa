import { computed, ref } from "vue";
import { useFieldEditor } from "@/composables/useFieldEditor";

/**
 * One field inside a group. The field row keeps owning its own value; the
 * group only needs to be able to snapshot it, put it back and validate it.
 */
export type GroupMember = {
  key: string;
  snapshot: () => string;
  restore: (snapshot: string) => void;
  validate: () => Promise<boolean>;
};

/**
 * The group scope of per-field editing: fields that make no sense apart open,
 * validate and commit as one (group-form-card.md). A group is an edit scope
 * like any other, so `useFieldEditor` still guarantees that only one thing on
 * the screen is being edited at a time.
 */
export const useBlockEditor = (
  groupId: string,
  submit: () => Promise<void>,
) => {
  const fieldEditor = useFieldEditor();
  const members = ref<Map<string, GroupMember>>(new Map());
  /** Each member's value as it stood when the group opened. */
  const openedWith = ref<Map<string, string>>(new Map());

  const register = (member: GroupMember) => {
    members.value.set(member.key, member);
  };

  const unregister = (key: string) => {
    members.value.delete(key);
    openedWith.value.delete(key);
  };

  const isEditing = computed(() => fieldEditor.isEditing(groupId));
  const isSaving = computed(() => fieldEditor.isSaving(groupId));

  const isDirty = computed(() => {
    if (!isEditing.value) return false;
    return [...members.value.values()].some(
      (member) => member.snapshot() !== openedWith.value.get(member.key),
    );
  });

  const restoreAll = () => {
    members.value.forEach((member) => {
      const snapshot = openedWith.value.get(member.key);
      if (snapshot !== undefined) member.restore(snapshot);
    });
  };

  /** Validation stops at the group boundary, but covers all of it. */
  const validateAll = async (): Promise<boolean> => {
    const results = await Promise.all(
      [...members.value.values()].map((member) => member.validate()),
    );
    return results.every(Boolean);
  };

  /**
   * One gesture: a click on any member opens the whole group. Returns false
   * when another scope is holding unsaved changes.
   */
  const open = (): boolean => {
    openedWith.value = new Map(
      [...members.value.values()].map((member) => [
        member.key,
        member.snapshot(),
      ]),
    );

    return fieldEditor.open({
      id: groupId,
      isDirty: () => isDirty.value,
      restore: restoreAll,
      validate: validateAll,
      submit,
    });
  };

  return {
    register,
    unregister,
    open,
    isEditing,
    isSaving,
    isDirty,
  };
};
