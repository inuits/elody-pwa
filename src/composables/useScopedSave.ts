import {
  Collection,
  EditStatus,
  MutateEntityValuesDocument,
  type BaseRelationValuesInput,
  type EntityFormInput,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { validate } from "vee-validate";

// Per-field editing saves only what the edited scope changed: one metadata
// key, the added/removed/changed relations, or one relation's changed
// metadata. Nothing outside the scope is ever sent.
// See docs/design-system/patterns/per-field-editing.md.

type MetadataEntry = { key: string; value: unknown };
export type RelationValue = {
  key: string;
  type: string;
  metadata?: MetadataEntry[] | null;
};

// The same conversion the whole-form save applies per key: a formatted value
// is sent as its label, an empty value as "".
export const toMetadataValue = (value: unknown): unknown => {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null) return "";
  if (typeof value === "object" && (value as { formatter?: unknown }).formatter)
    return (value as { label?: unknown }).label ?? "";
  return value;
};

export const buildMetadataInput = (
  key: string,
  value: unknown,
  lang?: string,
): EntityFormInput => ({
  metadata: [lang ? { key, value, lang } : { key, value }],
  relations: [],
  updateOnlyRelations: false,
});

const relationId = (relation: RelationValue): string =>
  `${relation.type}|${relation.key}`;

const changedMetadata = (
  before: MetadataEntry[] = [],
  after: MetadataEntry[] = [],
): MetadataEntry[] => {
  const previous = new Map(before.map((entry) => [entry.key, entry.value]));
  return after.filter(
    (entry) =>
      JSON.stringify(previous.get(entry.key)) !== JSON.stringify(entry.value),
  );
};

export const buildRelationsInput = (
  before: RelationValue[],
  after: RelationValue[],
): EntityFormInput => {
  const previous = new Map(before.map((relation) => [relationId(relation), relation]));
  const next = new Map(after.map((relation) => [relationId(relation), relation]));
  const relations: BaseRelationValuesInput[] = [];

  next.forEach((relation, id) => {
    const old = previous.get(id);
    if (!old) {
      relations.push({ ...relation, editStatus: EditStatus.New } as BaseRelationValuesInput);
      return;
    }
    const metadata = changedMetadata(old.metadata ?? [], relation.metadata ?? []);
    if (metadata.length > 0)
      relations.push({
        key: relation.key,
        type: relation.type,
        editStatus: EditStatus.Changed,
        metadata,
      } as BaseRelationValuesInput);
  });

  previous.forEach((relation, id) => {
    if (!next.has(id))
      relations.push({
        key: relation.key,
        type: relation.type,
        editStatus: EditStatus.Deleted,
      } as BaseRelationValuesInput);
  });

  return { metadata: [], relations, updateOnlyRelations: true };
};

export const buildRelationMetadataInput = (
  relation: Pick<RelationValue, "key" | "type">,
  metadataKey: string,
  value: unknown,
): EntityFormInput => ({
  metadata: [],
  relations: [
    {
      key: relation.key,
      type: relation.type,
      editStatus: EditStatus.Changed,
      metadata: [{ key: metadataKey, value }],
    } as BaseRelationValuesInput,
  ],
  updateOnlyRelations: true,
});

const isEmpty = (formInput: EntityFormInput): boolean =>
  formInput.metadata.length === 0 && formInput.relations.length === 0;

export const saveScope = async ({
  entityId,
  formInput,
  collection = Collection.Entities,
}: {
  entityId: string;
  formInput: EntityFormInput;
  collection?: Collection;
}) => {
  if (isEmpty(formInput)) return undefined;
  const result = await apolloClient.mutate({
    mutation: MutateEntityValuesDocument,
    variables: { id: entityId, formInput, collection },
    errorPolicy: "all",
    context: { skipGlobalErrorHandling: true },
  });
  if (result?.errors?.length)
    throw new Error(result.errors.map((error) => error.message).join("\n"));
  return result?.data?.mutateEntityValues;
};

type FieldValidation = { valid: boolean; errors: string[] };

export const validateScope = async (
  validateField: (path: string) => Promise<FieldValidation>,
  paths: string[],
): Promise<{ valid: boolean; errors: Record<string, string[]> }> => {
  const errors: Record<string, string[]> = {};
  for (const path of paths) {
    const result = await validateField(path);
    if (!result.valid) errors[path] = result.errors;
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

type RelationLike = { editStatus?: string | null };
const withoutRemoved = <T extends RelationLike>(relations: unknown): T[] =>
  Array.isArray(relations)
    ? relations.filter((relation: T) => relation?.editStatus !== EditStatus.Deleted)
    : [];

// A relation field's rules run on its relations as they would be after the
// save: removed relations don't count, neither for the field itself nor for
// rules that read other relation types from the form.
export const validateRelations = async ({
  relations,
  rules,
  label,
  formValues,
}: {
  relations: RelationLike[];
  rules: string;
  label: string;
  formValues: Record<string, any>;
}): Promise<{ valid: boolean; errors: string[] }> => {
  const relationValues = Object.fromEntries(
    Object.entries(formValues?.relationValues ?? {}).map(([type, values]) => [
      type,
      withoutRemoved(values),
    ]),
  );
  const result = await validate(withoutRemoved(relations), rules, {
    name: label,
    label,
    values: { ...formValues, relationValues },
  });
  return { valid: result.valid, errors: result.errors };
};
