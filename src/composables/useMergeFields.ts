import type { MergeField } from "@/composables/useMergeDiff";

const IDENTIFIER_KEY = "id";
const RELATION_KEY = /^ref[A-Z]/;

export const collectMergeFields = (entityView: unknown): MergeField[] => {
  const fields = new Map<string, MergeField>();

  const visit = (node: any, inheritedIsEditable?: boolean) => {
    if (!node || typeof node !== "object") return;

    const isEditable =
      typeof node.isEditable === "boolean"
        ? node.isEditable
        : inheritedIsEditable;

    if (
      isEditable !== false &&
      node.__typename === "PanelMetaData" &&
      node.key !== IDENTIFIER_KEY &&
      !RELATION_KEY.test(node.key)
    ) {
      fields.set(node.key, { key: node.key, label: node.label ?? node.key });
    }

    Object.values(node).forEach((child) => visit(child, isEditable));
  };

  visit(entityView);

  return [...fields.values()];
};
