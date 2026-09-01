import { dequal as isEqual } from "dequal";
import type { MergeRelationField } from "@/composables/useMergeFields";

export type MergeSide = "left" | "right";

export type MergeField = {
  key: string;
  label: string;
};

export type MergeRow = MergeField & {
  leftValue: unknown;
  rightValue: unknown;
};

export type MergeChoices = Record<string, MergeSide>;

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || value === "";

const valuesAreInterchangeable = (left: unknown, right: unknown): boolean => {
  if (isEmpty(left) && isEmpty(right)) return true;
  return isEqual(left, right);
};

/**
 * The fields a user actually has to decide about: those whose value differs
 * between the two records, or that exist on one of them only.
 */
export const buildMergeRows = (
  fields: MergeField[],
  leftValues: Record<string, unknown>,
  rightValues: Record<string, unknown>,
): MergeRow[] =>
  fields
    .map(({ key, label }) => ({
      key,
      label,
      leftValue: leftValues[key],
      rightValue: rightValues[key],
    }))
    .filter((row) => !valuesAreInterchangeable(row.leftValue, row.rightValue));

type RelationValues = Record<string, { key: string }[] | undefined>;

const relationKeys = (relations: RelationValues, relationType: string): string[] =>
  (relations[relationType] ?? []).map((relation) => relation.key);

/** Relation panels whose members differ between the two records. */
export const buildRelationRows = (
  relationFields: MergeRelationField[],
  leftRelations: RelationValues,
  rightRelations: RelationValues,
): MergeRow[] =>
  buildMergeRows(
    relationFields.map(({ relationType, label }) => ({
      key: relationType,
      label,
    })),
    Object.fromEntries(
      relationFields.map(({ relationType }) => [
        relationType,
        relationKeys(leftRelations, relationType),
      ]),
    ),
    Object.fromEntries(
      relationFields.map(({ relationType }) => [
        relationType,
        relationKeys(rightRelations, relationType),
      ]),
    ),
  );

/**
 * The complete relation set to write.
 *
 * Every relation type is included, not just the contested ones: the relations
 * endpoint replaces the whole set, so omitting an uncontested type would
 * delete it.
 */
export const buildMergedRelations = (
  relationFields: MergeRelationField[],
  leftRelations: RelationValues,
  rightRelations: RelationValues,
  choices: MergeChoices,
): { key: string; type: string; editStatus: string }[] =>
  relationFields.flatMap(({ relationType }) => {
    const relations =
      choices[relationType] === "right" ? rightRelations : leftRelations;
    return relationKeys(relations, relationType).map((key) => ({
      key,
      type: relationType,
      // BaseRelationValuesInput requires it, the collection API datasource
      // strips it again — the merge writes the whole set regardless.
      editStatus: "new",
    }));
  });

/**
 * The value to write for each contested field. Anything the user did not
 * decide keeps the surviving record's own value.
 */
export const buildMergedValues = (
  rows: MergeRow[],
  choices: MergeChoices,
): Record<string, unknown> =>
  Object.fromEntries(
    rows.map((row) => {
      const value = choices[row.key] === "right" ? row.rightValue : row.leftValue;
      return [row.key, isEmpty(value) ? "" : value];
    }),
  );
