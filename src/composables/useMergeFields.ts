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

// A metadata panel keyed on a relation type shows a read-only projection of
// that relation. The schema rejects the key outright on a write, so the only
// way to offer it is as the relation itself.
const RELATION_KEY = /^ref[A-Z]/;

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
  const relationLabels = new Map<string, string | undefined>();

  // A relation reached both as a metadata projection and as a list panel is one
  // choice. Whichever of the two carries a label wins; the relation type is
  // only readable enough to be a last resort.
  const noteRelation = (relationType: string, label?: string) => {
    relationLabels.set(relationType, label ?? relationLabels.get(relationType));
  };

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
      if (RELATION_KEY.test(node.key)) noteRelation(node.key, node.label);
      // The label is nullable in the schema, and a missing translation key
      // throws where the row is rendered.
      else metadataFields.set(node.key, { key: node.key, label: node.label ?? node.key });
    }
    if (
      isMergeable &&
      node.__typename === "EntityListElement" &&
      node.relationType
    ) {
      noteRelation(node.relationType, node.label);
    }

    Object.values(node).forEach((child) => visit(child, isEditable));
  };

  visit(entityView);

  return {
    metadataFields: [...metadataFields.values()],
    relationFields: [...relationLabels].map(([relationType, label]) => ({
      relationType,
      label: label ?? relationType,
    })),
  };
};
