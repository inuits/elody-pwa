import { DocumentTransform } from "@apollo/client/core";
import { Kind, visit, type ArgumentNode, type FieldNode } from "graphql";

// Matched by field name, since a DocumentTransform has no schema to check types against.
const PANEL_METADATA_FIELDS = new Set(["metaData", "uploadMetadata"]);

const keyArgument = (value: string): ArgumentNode => ({
  kind: Kind.ARGUMENT,
  name: { kind: Kind.NAME, value: "key" },
  value: { kind: Kind.STRING, value },
});

const hasKeySelection = (field: FieldNode) =>
  field.selectionSet?.selections.some(
    (selection) => selection.kind === Kind.FIELD && selection.name.value === "key",
  );

const addKeySelection = (field: FieldNode, alias: string): FieldNode => {
  if (!field.selectionSet || hasKeySelection(field)) return field;
  const keyField: FieldNode = {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: "key" },
    arguments: [{ ...keyArgument(alias), name: { kind: Kind.NAME, value: "input" } }],
  };
  return {
    ...field,
    selectionSet: {
      ...field.selectionSet,
      selections: [...field.selectionSet.selections, keyField],
    },
  };
};

// The key argument must reach the cache too: Apollo stores fields by name + arguments, not by alias.
const addKeyArgument = (field: FieldNode, alias: string): FieldNode => {
  if (field.arguments?.some((argument) => argument.name.value === "key")) return field;
  return { ...field, arguments: [...(field.arguments ?? []), keyArgument(alias)] };
};

export const aliasAsKeyTransform = new DocumentTransform((document) =>
  visit(document, {
    Field(field) {
      if (!field.alias) return;
      if (PANEL_METADATA_FIELDS.has(field.name.value))
        return addKeySelection(field, field.alias.value);
      if (field.name.value === "keyValue")
        return addKeyArgument(field, field.alias.value);
    },
  }),
);
