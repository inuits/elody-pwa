# Pagination

Page navigation and page size, in the list header. Implemented by
`src/components/base/BasePagination.vue` (pager) and
`src/components/library/PageSizeSelect.vue` (page size), mounted by
`BaseLibrary.vue`.

## When to use
Every paged list. Not when the list fits on one page: the pager hides, and
the page size hides while the total fits on the smallest option.

## Anatomy
Follows `templates/elody-list-screen` (chosen over the handoff's footer
placement and numbered pages). In the list's results band
([entity list](./entity-list.md)): count chip · pager · view modes · page
size · sort · selection bar.
- Pager: « ‹ page [n] of N › ». First / previous / next / last are
  `--pager-button-size` icon buttons (`--radius-input`, hover = row-hover
  fill); the page box is a `BaseInputTextNumberDatetime`
  (`--pager-input-width`) that jumps on Enter or blur; an out-of-range
  number snaps back. Text `--text-label` in `--color-text-panel-header`.
- Capped total: "of 50+", with a "?" tooltip
  (`pagination.capped-pages-tooltip`).
- Page size: an `AdvancedDropdown` reading "Items: 20" (`library.items`).
- The total lives in the count chip, never here.

## States
| State | Cue |
|---|---|
| first / last page | « ‹ / › » disabled |
| one page | pager hidden |
| total fits the smallest page size | page size hidden |
| page size change | back to page 1 |

## Accessibility
- `<nav aria-label="Pagination">`.
- Arrows named "First page", "Previous page", "Next page", "Last page";
  disabled edges are real disabled buttons. The page box is named "Page
  number".
- The page-size select has a hidden `<label>` "Results per page".

## Not yet
- shortcut: the page is not in the URL (no deep link or back button per
  page); add it with the record stepper if needed.
- shortcut: the pager is not locked while a page loads.
