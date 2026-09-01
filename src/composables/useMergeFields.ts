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
 * The metadata fields and relation panels an entity view exposes, which
 * together are everything a user can be asked to choose between when merging.
 */
export const collectMergeFields = (entityView: unknown): MergeFields => {
  const metadataFields = new Map<string, MergeField>();
  const relationFields = new Map<string, MergeRelationField>();

  const visit = (node: any) => {
    if (!node || typeof node !== "object") return;

    if (node.__typename === "PanelMetaData" && node.key !== IDENTIFIER_KEY) {
      metadataFields.set(node.key, { key: node.key, label: node.label });
    }
    if (node.__typename === "EntityListElement" && node.relationType) {
      relationFields.set(node.relationType, {
        relationType: node.relationType,
        label: node.label,
      });
    }

    Object.values(node).forEach(visit);
  };

  visit(entityView);

  return {
    metadataFields: [...metadataFields.values()],
    relationFields: [...relationFields.values()],
  };
};
