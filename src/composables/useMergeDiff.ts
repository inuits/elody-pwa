import { dequal as isEqual } from "dequal";

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
