# Preview panel

The panel a list opens beside itself instead of navigating. Implemented by
`src/components/previews/PreviewWrapper.vue`, mounted by `ViewModesList.vue`
and `ViewModesTable.vue`.

## Anatomy
The shared panel shell: 1px `--color-border-panel`, `--radius-card`,
`--color-surface`, no shadow.
- Header band: `--color-surface-panel-header`, `--panel-header-pad`.
  - Title (`h3`): the configured `previewComponent.title`, else the
    entity's title; `--text-panel-title`, bold, `--color-text-panel-header`,
    truncated.
  - "Open detail page" (`BaseButtonNew` primary, sm): only when the list
    navigates to its entities (`actionOnClick: Navigate`).
  - Close × (`BaseButtonNew` ghost, sm, icon-only, named "Close preview").
- Body per type: column list, media viewer, map, history.

The header is the only close: lists inside a preview no longer carry their
own ×.

## Behaviour
- Opened from the row's eye: focus moves to the header. Opened by default
  on page load: focus stays where it is.
- Escape or × closes it and returns focus to that row's eye (found by
  `data-preview-for`, since the list re-renders when the preview opens).
- Clicking another row swaps the content; the title announces the change
  (`aria-live="polite"`).

## Split
The list and the preview share their container by container queries:
below 500px they stack; 500 / 630 / 830 / 1024px → 40/60, 35/65, 30/70,
25/75. A split nested inside a preview uses the same tiers against its own
container (`preview` container name). While a preview is open the list
shows only its first field (table: first column).

## Accessibility
- `role="complementary"`, named by the title (`aria-labelledby`).

## Not yet
- The window inside a preview repeats the entity title under the header
  (duplicate panel title, DS 4 panel shells step).
