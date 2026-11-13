# Entity list

The query-driven result list (table, list, grid). Implemented by
`src/components/library/BaseLibrary.vue` and its view modes.

## Header
`ui_kits/clients` (aicap): one white results panel (`data-cy="results-panel"`,
`--color-surface`, 1px `--color-border-panel`, `--radius-card`) holding, top
to bottom:
1. The results band (`data-cy="list-header"`, `--color-surface-panel-header`,
   `--list-band-pad`, hairline below): count chip, pager
   ([pagination](./pagination.md)), view-mode switch (`BaseToggleGroup`: one
   bordered capsule, `--view-switch-size` icon buttons named "List view",
   "Map view"…, `aria-pressed`, active in accent wash + accent ink), page
   size, sort
   ("Order by" select + one direction toggle button) and simple search; it
   wraps when narrow.
2. The [selection bar](./selection-bar.md) row.
3. The list, with its sticky column-header row.

Compact relation lists keep a plain row without the panel (it may hold only
a pager). A disabled library bar hides the count, view modes, page size and
sort; the pager stays.

### Small screens (below md)
Two control rows instead of five (`isCompact`):
1. The simple search, full width (`LibraryBar`, `order-first basis-full`).
2. Filters, one sort button (direction icon, field, ⌄) and the view switch.
   The sort button opens a bottom sheet (`data-cy="sort-sheet"`,
   `--sheet-radius`, `--sheet-padding`, scrim): the sort fields (a pick
   closes it), Ascending / Descending, page size and group-by as chips. The
   sheet stays mounted while closed, since the page size registers the first
   fetch's promise. Filters open as a bottom sheet too (`FiltersPane`).

Below the band a meta row (`data-cy="list-meta-row"`, tinted
`--color-accent-wash` with a selection) holds the select-page checkbox, the
count chip (or "Selection: n" once rows are selected) and the selection
bar's actions; it replaces the "nothing selected" line and the
column-header rows (list and table). The pager moves to the end of the
band. A list page's create pill stays on the title row (`TheHeader`).

### Count chip
`src/components/library/ResultCountChip.vue`. The single source of the list
total; the selection bar and pager don't repeat it.
- White chip on the band: `--color-surface`, `--color-text-panel-header`,
  `--radius-chip`, `--chip-padding`, `--text-chip`, bold.
- Copy: `library.result-count`, with singular and plural forms
  ("1 result" / "1,258 results", "1 resultaat" / "1.258 resultaten").
- Capped totals (above `LISTING_COUNT_CAP`) read "1,000+ results". The chip
  is then a button that loads the exact count, with a spinner while it
  loads and a "?" tooltip explaining the cap.
- Shown in the main library and in relation lists on detail pages
  (`NormalBaseLibrary`, `PreviewBaseLibrary`); not in compact basic-mode
  relation lists. Hidden until the first page has loaded.

## Rows
List and table rows are flat: `--list-row-pad`, `--text-table`, a
`--color-border-faint` hairline below, no per-row border, radius or gap.
Grid view (`ViewModesList.vue`): `auto-fill` columns of at least
`--grid-card-min-width`, `--grid-gap` apart, `--grid-pad` around. Cards in a
row share a height. Each card is a 1px `--color-border-subtle` border,
`--radius-card`, no shadow, and is not itself a link or focusable.
- Media: a square frame (`aspect-square`, `--color-surface-muted`); the
  thumbnail fills it (`object-cover`, `alt` = title). No image: the file-type
  glyph in `--color-text-subtle`. The select checkbox sits on its top-left
  corner (`--grid-card-check-inset`) on a `--color-surface` chip
  (`--grid-card-check-pad`), with an `aria-label`, no visible label.
- Body (`--grid-card-body-pad`, `--text-value`): the first field is the
  title, a link to the detail page (`--text-heading`, bold,
  `--color-text-link`, dashed title underline; hover `--color-text-link-hover`,
  the dashed underline stays on hover, as in list rows), clamped
  to 2 lines with `--grid-card-title-min-height` so rows line up. The eye
  and ⋮ sit beside the title (`--grid-card-title-action-gap`); there is no
  footer. Then every other
  teaser field with its label above its value (`--grid-card-meta-label-gap`
  between, `--grid-card-meta-row-gap` between fields); labels look like the
  list view's field labels (`--text-label`, bold, `--color-text-field-label`), values take the full card width and truncate with the
  full value in the tooltip. Only the client's existing teaser metadata is
  shown, with its own labels.
- Tab order: Select, title, eye, ⋮.
- Card size: in grid view a second segmented switch follows the view switch,
  "Large | Compact" (`BaseToggleGroup` with text segments,
  `--view-switch-text-pad`, group named "Card size"). Compact keeps only
  media and title, in `--grid-card-min-width-compact` columns. Remembered
  per browser (`localStorage` `elody.gridCompact`).
- Selected: `--color-accent-wash` + a `--color-accent` border (no ring: on
  the rounded corners it reads as separate arcs). Preview open: the same
  border, no wash.
- Selection bar: a labelled "Select page" checkbox starts the row. It ticks
  when the whole page is selected, is indeterminate when part of it is, and
  selects the page on click (clears it when ticked).

### Title (list and grid)
The first teaser field is the title: bold, `--color-text-link`, with a 1px
dashed underline in `--color-border-dashed`, `--title-underline-offset`
below the text. A leading pill is not a title and gets none of this. Values
in grid rows never wrap (a pill stays whole; text truncates).

### Column-header row (list mode)
When every row on the page has the same fields, list mode shows one sticky
header row (`ListColumnHeader.vue`; `--list-header-height`, `--text-label`,
bold, `--color-text-field-label`, `--color-surface`, hairline below) with a
select-all checkbox (named "Select page"; ticks when every row on the page
is selected; unticking clears the page), the field labels and "Actions"
on the right and the cells drop their visible labels
(`ListItem` `hideLabels`; the labels stay for screen readers, the header is
`aria-hidden`). Each label is placed over the first row's measured cell, so
it follows the row layout (actions width, wrapping, multi-line, preview
open). Mixed lists and edit mode keep per-cell labels.
(`sharedColumnLabels.ts`, `ViewModesList.vue`)

Table mode's header row (`ViewModesTable.vue`) uses the same tokens
(`--list-header-height`, `--text-label`, bold, `--color-text-field-label`,
`--color-surface`, hairline below). Its column widths are measured with
`--text-label` at bold weight, so they follow the token.

## Row states
`ListItem.vue` (list, grid) and `TableViewRow.vue` (table).

| State | Cue |
|---|---|
| hover | `--color-surface-row-hover` fill only; a navigating row is a link but its text keeps its colour and gets no underline (overrides the base `a:hover`) |
| selected (checkbox) | `--color-accent-wash` + `--shadow-accent-row`; the checkbox owns the wash (grid: wash + accent border) |
| preview open | `--list-row-preview-border` left border in `--color-accent`, no wash; its eye is pressed (grid: accent border) |
| last previewed (`keepLastActiveItemHighlighted`) | same left border, eye not pressed |
| seen (`seenDisplay: dimSeen`) | first field (the row title) in `--color-text-secondary` |
| disabled | greyed out, not clickable |

The eye (`PreviewToggle`) stays on every row while a preview is open:
`aria-pressed` follows "this row's preview is open now"
(`isPreviewOpenForListItem`), not the highlight. Clicking a row switches the
preview; the detail page opens from the preview header.

## Accessibility
- The count chip sits in a `role="status"` region, so new totals are
  announced.
