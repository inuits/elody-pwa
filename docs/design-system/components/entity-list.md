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
Grid items are cards: `--grid-card-width` × `--grid-card-height`, 1px
border, `--radius-card`, no shadow.
- Media area on top (`--grid-card-media-height`, `--color-surface-muted`),
  thumbnail letterboxed (full IIIF image, `object-contain`). No image: a
  muted glyph and "No media" (`library.no-media`), never a blank box.
- Checkbox and actions overlay the top of the media area.
- Body (`--grid-card-body-pad`): the first field as the title (13px bold,
  2-line clamp), every badge, and the first plain field as one secondary
  line; other fields are hidden. Labels stay for screen readers only.

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

## Row states
`ListItem.vue` (list, grid) and `TableViewRow.vue` (table).

| State | Cue |
|---|---|
| hover | `--color-surface-row-hover` fill only; a navigating row is a link but its text keeps its colour and gets no underline (overrides the base `a:hover`) |
| selected (checkbox) | `--color-accent-wash` + `--shadow-accent-row`; the checkbox owns the wash |
| preview open | `--list-row-preview-border` left border in `--color-accent`, no wash; its eye is pressed |
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
