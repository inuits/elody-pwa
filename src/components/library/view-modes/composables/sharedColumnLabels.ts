import type { Metadata } from "@/generated-types/queries";

// The labels for a list's column-header row, or undefined when the rows on
// the page don't share the same fields (a mixed list keeps per-cell labels).
export const sharedColumnLabels = (
  rows: Metadata[][],
): string[] | undefined => {
  const visible = rows.map((fields) =>
    (fields ?? []).filter((field) => !field?.showOnlyInEditMode),
  );
  if (visible.length === 0) return undefined;
  const keysOf = (fields: Metadata[]) =>
    fields.map((field) => field.key).join("|");
  const firstKeys = keysOf(visible[0]);
  if (visible.some((fields) => keysOf(fields) !== firstKeys)) return undefined;
  const labels = visible[0].map((field) => field.label ?? "");
  return labels.some(Boolean) ? labels : undefined;
};
