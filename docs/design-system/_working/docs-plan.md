# Design-system docs plan (#165152)

Public docs: elody-docs `docs/design-system/`. Stories: this repo. Branches:
PWA `feat-165152-docs-components`, elody-docs `feat/design-system-foundations`
(MR !15, not merged until stage 1 is done).

Rule: public pages describe only what is built. Anything not built goes to
`handoff-deviations.md`.

## Page template

H1 + one-line purpose → default story → When to use → When not to use →
Anatomy (role tokens, no px) → Variants → States (table + story) →
Keyboard & accessibility → Content → Related. No GraphQL/config section yet.

## Definition of done (per page)

1. Every statement checked against the component code.
2. Embedded stories exist, render without errors and fit the 320px embed
   (menus need ≥ 250px below the trigger to open downwards).
3. Checked in the browser on `docs.localhost:8000`: embeds, keyboard, tooltips.
4. Links only to visible pages; docs build passes (dead links).
5. Page back in the sidebar and removed from `srcExclude` in `config.mts`.
6. Product bugs found: fixed with a test first, or logged in `handoff-deviations.md`.

## Stage 1: Foundations and base components

| # | Page | Components | Status |
|---|---|---|---|
| 1 | Foundations (8 pages) | tokens, icons, theming | done |
| 2 | Button | BaseButtonNew | done |
| 3 | Checkbox | BaseInputCheckbox | done |
| 4 | Split button | ContextMenuActionsShell, BaseContextMenu(Item) | done |
| 5 | Overflow menu | ContextMenuActionsShell, BaseContextMenu(Item) | done |
| 6 | Chip & badge | MetadataFormatterPill, relation chips, ResultCountChip, BaseSearchPill | done (add hex pill colours once `feat-168903-pill-colors` is merged; unconfigured value uses literal `text-sm`) |
| 7 | Loading | SpinnerLoader, skeletons, LoadingList, BlockingOverlay | done |
| 8 | Text input | BaseInputTextNumberDatetime, BaseResizableTextarea | |
| 9 | Tooltip | BaseTooltip | |
| 10 | Dropdown | AdvancedDropdown | |
| 11 | Autocomplete | BaseInputAutocomplete | |
| 12 | Date picker | BaseDatePicker | |
| 13 | Toggle & toggle group | BaseToggle, BaseToggleGroup | |
| 14 | Slider | BaseSlider, BaseRangeSlider (R2: raw colours, hard-coded "From:/To:") | |
| 15 | Modal | BaseModal, ConfirmModal, InlineConfirmButtons | |
| 16 | Pagination | BasePagination | |
| 17 | Upload | Dropzone, DropzonePreview, BaseProgressStep | |
| 18 | Small utilities | decided 2026-11-16: colour input + textarea on Text input, info panel on Tooltip, ConfirmModal + InlineConfirmButtons on Modal; copy-to-clipboard and expand button move to stage 2 (field row, panels) | decided |
| — | Not documented | BaseLabel, BaseVirtualScroll, BasePaginationSkeleton (unused; not deleted in this docs branch, user to decide), BaseVirtualKeyboard (bug R29 first) | |

Stage 1 ends with: user review, push both branches, merge MR !15, docs-dev deploy.

Stage 1 status (2026-11-16): all pages written and checked in the browser; awaiting the user's review. Findings S1–S35 in `handoff-deviations.md`.

## Stage 2: Composite components (hidden pages)

Fields & editing: field row, inline editor, group form card, repeatable row
group. Lists & actions: entity list element, preview panel, selection action
bar, panel & block shells. Filters & overlays: filter panel, entity picker,
saved searches. Forms & flows: dynamic form, guided flow, WYSIWYG editor.
Viewers: media viewer (ImageViewer, PDFViewer, TextViewer,
AudioAndVideoPlayer), map viewer (BaseMap). Navigation: navigation chrome,
hierarchy & folder trees, import browser.

Stories to fix before their page:

| Story | Problem |
|---|---|
| `bulkoperations-selectionactionbar--default` | renders nothing |
| `bulkoperations-selectionactionbar--selected` | count only, no actions (needs bulk-operation fixtures) |
| `components-mediaviewer--with-toolbar` | no image (fixture 404) |
| `components-pointmap--default` | points without map tiles (check) |
| `entityelements-entityelementwindowpanel--group-editing` | ignores `isGroup` |
| `modals-savedsearches--picker` | skeletons only, missing query fixtures |
| `navigation-navrail--*` | missing `Menu` / `getElodyUser` fixtures (renders) |
| InlineFieldEditor stories | old API |

## Stage 3: Patterns

Per-field editing, action discovery, feedback (drop the
`components-toast--undo` embed: undo is not built), history diff, comments.

## Stage 4: Release and upkeep

- Docs to production (after stage 1 on docs-dev; stages 2–3 follow per MR).
- Check the live Storybook embeds (`VITE_STORYBOOK_BASE=/storybook`).
- a11y panel per story (preview sets `a11y.test: "error"`); a11y bugs R28–R31.
- Optional: the headless story check (render every story, flag errors) in CI.
- Optional, later: a "How to configure" section with GraphQL examples.
