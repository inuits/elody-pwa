import { dequal } from "dequal";
import type { FilterListItem } from "@/composables/useStateManagement";

// What a saved search pins down: each active filter's key, matcher and input.
const essence = (items: FilterListItem[]) =>
  items
    .filter((item) => item.isActive)
    .map((item) => ({
      key: item.advancedFilter?.key,
      matcher: item.selectedMatcher,
      input: item.inputFromState,
    }))
    .sort((a, b) => JSON.stringify(a.key).localeCompare(JSON.stringify(b.key)));

// saved-searches.md: the applied saved search's chip gets a "•" once the
// filters differ from it.
export const savedSearchIsModified = (
  saved: FilterListItem[],
  current: FilterListItem[],
): boolean => !dequal(essence(saved), essence(current));
