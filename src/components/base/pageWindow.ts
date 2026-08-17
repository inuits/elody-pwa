/** Stands in for a run of pages the pager elides. */
export const PAGE_GAP = "gap" as const;

export type PageWindowEntry = number | typeof PAGE_GAP;

/** Below this many pages the pager simply lists them all. */
const ALWAYS_SHOW_UP_TO = 7;

/**
 * The pages a pager renders: the first and last are always reachable, the
 * current one sits between its neighbours, and anything skipped collapses into
 * a gap marker (pagination.md).
 */
export const getPageWindow = (
  currentPage: number,
  lastPage: number,
): PageWindowEntry[] => {
  if (lastPage <= ALWAYS_SHOW_UP_TO) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = [
    1,
    lastPage,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ].filter((page) => page >= 1 && page <= lastPage);

  const ordered = [...new Set(pages)].sort((a, b) => a - b);

  return ordered.flatMap((page, index) => {
    const previous = ordered[index - 1];
    // A gap marker only earns its place where pages are actually missing.
    return previous !== undefined && page - previous > 1
      ? [PAGE_GAP, page]
      : [page];
  });
};
