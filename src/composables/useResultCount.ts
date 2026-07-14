/**
 * Centralises how the PWA deals with the *capped* total result count.
 *
 * For performance reasons collection-api caps the total count of a listing/search
 * (env `LISTING_COUNT_CAP`, default 1000). When more results exist than the cap,
 * the backend returns `cap + 1` (e.g. 1001) as a sentinel meaning "more than <cap>".
 *
 * Showing that raw sentinel ("1001 items") is misleading, so the whole frontend
 * routes count formatting and cap-detection through this module:
 *   - `formatResultCount` -> "1,000+" instead of "1001"
 *   - `isCountCapped`      -> drives pagination bounds and "+" indicators
 *
 * The cap is configured once at app start from the backend app-config
 * (see `setListingCountCap` in `main.ts`), mirroring `bulkSelectAllSizeLimit`.
 */

export const DEFAULT_LISTING_COUNT_CAP = 1000;

let listingCountCap = DEFAULT_LISTING_COUNT_CAP;

/**
 * Override the cap, typically from the backend-provided app config.
 * Non-positive / nullish values are ignored so a missing config key keeps the default.
 */
export const setListingCountCap = (cap?: number | null): void => {
  if (typeof cap === "number" && Number.isFinite(cap)) {
    listingCountCap = cap;
  }
};

export const getListingCountCap = (): number => listingCountCap;

/** True when the backend capped the count, i.e. the real total is unknown and larger than the cap. */
export const isCountCapped = (count?: number | null): boolean =>
  typeof count === "number" && listingCountCap > 0 && count > listingCountCap;

/**
 * Human-friendly total: an exact, locale-grouped number, or "<cap>+" when capped.
 * @param locale optional BCP-47 locale; defaults to the runtime locale.
 */
export const formatResultCount = (
  count?: number | null,
  locale?: string,
): string => {
  const cap = listingCountCap;
  if (isCountCapped(count)) return `${cap.toLocaleString(locale)}+`;
  return (count ?? 0).toLocaleString(locale);
};
