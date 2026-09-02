import type { MergeField } from "@/composables/useMergeDiff";

export type MergeRelationField = {
  relationType: string;
  label: string;
};

export type MergeFields = {
  metadataFields: MergeField[];
  relationFields: MergeRelationField[];
};

const IDENTIFIER_KEY = "id";

/**
 * The metadata fields and relation panels a user can be asked to choose
 * between when merging.
 *
 * Panels the client marked `isEditable: false` are skipped: audit timestamps
 * and other derived values describe a record rather than belong to it, so the
 * survivor simply keeps its own.
 */
export const collectMergeFields = (entityView: unknown): MergeFields => {
  const metadataFields = new Map<string, MergeField>();
  const relationFields = new Map<string, MergeRelationField>();

  const visit = (node: any, inheritedIsEditable?: boolean) => {
    if (!node || typeof node !== "object") return;

    const isEditable =
      typeof node.isEditable === "boolean" ? node.isEditable : inheritedIsEditable;
    const isMergeable = isEditable !== false;

    if (
      isMergeable &&
      node.__typename === "PanelMetaData" &&
      node.key !== IDENTIFIER_KEY
    ) {
      // The label is nullable in the schema, and a missing translation key
      // throws where the row is rendered.
      metadataFields.set(node.key, {
        key: node.key,
        label: node.label ?? node.key,
      });
    }
    if (
      isMergeable &&
      node.__typename === "EntityListElement" &&
      node.relationType
    ) {
      relationFields.set(node.relationType, {
        relationType: node.relationType,
        label: node.label ?? node.relationType,
      });
    }

    Object.values(node).forEach((child) => visit(child, isEditable));
  };

  visit(entityView);

  return {
    metadataFields: [...metadataFields.values()],
    relationFields: [...relationFields.values()],
  };
};
