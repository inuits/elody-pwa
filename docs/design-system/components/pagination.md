# Pagination

Page navigation and page size, in the list footer. Implemented by
`src/components/base/BasePagination.vue` (pager) and
`src/components/library/PageSizeSelect.vue` (page size), mounted by
`BaseLibrary.vue`.

## When to use
Every paged list. Not when the list fits on one page: the pager hides, and
the page size hides while the total fits on the smallest option.

## Anatomy
List footer row: page size left, pager right.
- Page size: an `AdvancedDropdown` reading "20 per page"
  (`pagination.per-page`; config labels are bare numbers, other labels are
  translation keys).
- Pager: ‹ · numbered pages · ›. Page 1, the last page and the current
  page's neighbours are shown; a gap becomes "…" (a gap of one page shows
  that page). Buttons are `--pager-button-size` high, `--radius-input`,
  `--text-ui`, `--pager-gap` apart; hover = row-hover fill.
- Current page: `--pager-current-bg` (dark accent) with white bold numeral.
- Capped total: the last page reads "50+", with a "?" tooltip
  (`pagination.capped-pages-tooltip`).
- The total lives in the list header count chip ([entity list](./entity-list.md)),
  never here.

## States
| State | Cue |
|---|---|
| first / last page | ‹ / › disabled |
| one page | pager hidden |
| page size change | back to page 1 |

## Accessibility
- `<nav aria-label="Pagination">`; current page `aria-current="page"`.
- ‹ / › named "Previous page" / "Next page"; disabled edges are real
  disabled buttons.
- ←/→ move focus between the pager's buttons; Enter/Space activate.
- The page-size select has a hidden `<label>` "Results per page".

## Not yet
- shortcut: the page is not in the URL (no deep link or back button per
  page); add it with the record stepper if needed.
- shortcut: the pager is not locked while a page loads.
