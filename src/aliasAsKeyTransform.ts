import { DocumentTransform } from "@apollo/client/core";
import { Kind, visit, type ArgumentNode, type FieldNode } from "graphql";

// Matched by field name, since a DocumentTransform has no schema to check types against.
const PANEL_METADATA_FIELDS = new Set(["metaData", "uploadMetadata"]);

const keyArgument = (value: string): ArgumentNode => ({
  kind: Kind.ARGUMENT,
  name: { kind: Kind.NAME, value: "key" },
  value: { kind: Kind.STRING, value },
});

const findSelection = (field: FieldNode, name: string) =>
  field.selectionSet?.selections.find(
    (selection): selection is FieldNode =>
      selection.kind === Kind.FIELD && !selection.alias && selection.name.value === name,
  );

const inputArgument = (value: string): ArgumentNode => ({
  kind: Kind.ARGUMENT,
  name: { kind: Kind.NAME, value: "input" },
  value: { kind: Kind.STRING, value },
});

const explicitKey = (field: FieldNode) => {
  const value = findSelection(field, "key")?.arguments?.find(
    (argument) => argument.name.value === "input",
  )?.value;
  return value?.kind === Kind.STRING ? value.value : undefined;
};

// A bare selection (no input) gets the default too; Apollo caches sibling metaData by field name + arguments.
const withDefaultInput = (field: FieldNode, name: string, value: string): FieldNode => {
  if (!field.selectionSet) return field;
  const existing = findSelection(field, name);
  if (existing?.arguments?.length) return field;
  const defaulted: FieldNode = {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: name },
    arguments: [inputArgument(value)],
  };
  const selections = existing
    ? field.selectionSet.selections.map((selection) =>
        selection === existing ? defaulted : selection,
      )
    : [...field.selectionSet.selections, defaulted];
  return { ...field, selectionSet: { ...field.selectionSet, selections } };
};

const addPanelMetadataDefaults = (field: FieldNode): FieldNode => {
  const alias = field.alias?.value;
  const withKey = alias ? withDefaultInput(field, "key", alias) : field;
  const key = explicitKey(withKey);
  return key ? withDefaultInput(withKey, "label", `metadata.labels.${key}`) : withKey;
};

// The key argument must reach the cache too: Apollo stores fields by name + arguments, not by alias.
const addKeyArgument = (field: FieldNode, alias: string): FieldNode => {
  if (field.arguments?.some((argument) => argument.name.value === "key")) return field;
  return { ...field, arguments: [...(field.arguments ?? []), keyArgument(alias)] };
};

export const aliasAsKeyTransform = new DocumentTransform((document) =>
  visit(document, {
    Field(field) {
      if (PANEL_METADATA_FIELDS.has(field.name.value)) return addPanelMetadataDefaults(field);
      if (!field.alias) return;
      if (field.name.value === "keyValue")
        return addKeyArgument(field, field.alias.value);
    },
  }),
);
