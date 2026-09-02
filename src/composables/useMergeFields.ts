import type { MergeField } from "@/composables/useMergeDiff";

const IDENTIFIER_KEY = "id";

// Relations are unioned by the merge itself, so they are never a choice. A
// metadata panel keyed on a relation type is only a read-only projection of
// one anyway — the schema rejects the key outright on a write.
const RELATION_KEY = /^ref[A-Z]/;

/**
 * The metadata fields a user can be asked to choose between when merging.
 *
 * Panels the client marked `isEditable: false` are skipped: audit timestamps
 * and other derived values describe a record rather than belong to it, so the
 * survivor simply keeps its own.
 */
export const collectMergeFields = (entityView: unknown): MergeField[] => {
  const fields = new Map<string, MergeField>();

  const visit = (node: any, inheritedIsEditable?: boolean) => {
    if (!node || typeof node !== "object") return;

    const isEditable =
      typeof node.isEditable === "boolean" ? node.isEditable : inheritedIsEditable;

    if (
      isEditable !== false &&
      node.__typename === "PanelMetaData" &&
      node.key !== IDENTIFIER_KEY &&
      !RELATION_KEY.test(node.key)
    ) {
      // The label is nullable in the schema, and a missing translation key
      // throws where the row is rendered.
      fields.set(node.key, { key: node.key, label: node.label ?? node.key });
    }

    Object.values(node).forEach((child) => visit(child, isEditable));
  };

  visit(entityView);

  return [...fields.values()];
};
