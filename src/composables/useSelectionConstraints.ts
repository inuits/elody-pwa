import type { InBulkProcessableItem } from "@/composables/useBulkOperations";

export type SelectionConstraints = {
  requiresSameType?: boolean | null;
  minSelectedItems?: number | null;
  maxSelectedItems?: number | null;
};

export type SelectionConstraintViolation =
  | "too-few-items"
  | "too-many-items"
  | "mixed-types";

export const determineSelectionConstraintViolation = (
  constraints: SelectionConstraints | null | undefined,
  selectedItems: InBulkProcessableItem[],
): SelectionConstraintViolation | undefined => {
  if (!constraints) return undefined;

  const { requiresSameType, minSelectedItems, maxSelectedItems } = constraints;

  if (minSelectedItems && selectedItems.length < minSelectedItems)
    return "too-few-items";
  if (maxSelectedItems && selectedItems.length > maxSelectedItems)
    return "too-many-items";
  if (requiresSameType && !selectionSharesOneType(selectedItems))
    return "mixed-types";

  return undefined;
};

const selectionSharesOneType = (
  selectedItems: InBulkProcessableItem[],
): boolean => {
  const types = selectedItems.map((item) => item.type);
  if (types.some((type) => !type)) return false;
  return new Set(types).size <= 1;
};
