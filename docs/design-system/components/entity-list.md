# Entity list

The query-driven result list (table, list, grid). Implemented by
`src/components/library/BaseLibrary.vue` and its view modes.

## Header
One row above the list (`data-cy="list-header"`): the count chip, the pager
([pagination](./pagination.md)), the view-mode switch, page size, sort and
simple search (`LibraryBar.vue`).

### Count chip
`src/components/library/ResultCountChip.vue`. The single source of the list
total; the selection bar and pager don't repeat it.
- Neutral chip: `--color-chip-neutral-bg` / `--color-chip-neutral-text`,
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
When every row on the page has the same fields, list mode shows one header
row (`--list-header-height`, `--text-label`, bold, `--color-text-field-label`,
hairline below) and the cells drop their visible labels
(`ListItem` `hideLabels`; the labels stay for screen readers, the header is
`aria-hidden`). Each label is placed over the first row's measured cell, so
it follows the row layout (actions width, wrapping, multi-line, preview
open). Mixed lists and edit mode keep per-cell labels.
(`sharedColumnLabels.ts`, `ViewModesList.vue`)

## Row states
`ListItem.vue` (list, grid) and `TableViewRow.vue` (table).

| State | Cue |
|---|---|
| hover | `--color-surface-row-hover` fill |
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
