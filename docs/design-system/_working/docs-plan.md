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
| 8 | Text input | BaseInputTextNumberDatetime, BaseResizableTextarea | done |
| 9 | Tooltip | BaseTooltip | done |
| 10 | Dropdown | AdvancedDropdown | done |
| 11 | Autocomplete | BaseInputAutocomplete | done |
| 12 | Date picker | BaseDatePicker | done |
| 13 | Toggle & toggle group | BaseToggle, BaseToggleGroup | done |
| 14 | Slider | BaseSlider, BaseRangeSlider (R2: raw colours, hard-coded "From:/To:") | done |
| 15 | Modal | BaseModal, ConfirmModal, InlineConfirmButtons | done |
| 16 | Pagination | BasePagination | done |
| 17 | Upload | Dropzone, DropzonePreview, BaseProgressStep | done |
| 18 | Small utilities | decided 2026-11-16: colour input + textarea on Text input, info panel on Tooltip, ConfirmModal + InlineConfirmButtons on Modal; copy-to-clipboard and expand button move to stage 2 (field row, panels) | decided |
| — | Not documented | BaseLabel, BaseVirtualScroll, BasePaginationSkeleton (unused; not deleted in this docs branch, user to decide), BaseVirtualKeyboard (bug R29 first) | |

Stage 1 ends with: user review, push both branches, merge MR !15, docs-dev deploy.

Stage 1 status (2026-11-16): all pages written and checked in the browser; awaiting the user's review. Findings S1–S35 in `handoff-deviations.md`.

## Stage 2: Composite components

Status (2026-11-16): 18 pages written from code, embeds checked on the docs
site, in the sidebar under "Composite components"; awaiting the user's review.
Findings T1–T33 in `handoff-deviations.md` (T1–T3 fixed with tests).

| Group | Pages |
|---|---|
| Fields & editing | field row (+ copy to clipboard), inline editor, repeatable row group |
| Lists & actions | entity list element, preview panel, selection action bar, panel & block shells (+ expand button) |
| Filters & overlays | filter panel, entity picker, saved searches |
| Forms & flows | dynamic form, guided flow, WYSIWYG editor |
| Viewers | media viewer, map viewer |
| Navigation | navigation chrome, folder tree (was "hierarchy tree": no record tree exists), import browser |
| Hidden | group form card: not built (T4) |

Decisions: superseded drafts deleted (autocomplete-tag-input, dropdown-select,
inputs-and-tooltips, primitives, toggle-and-slider); the filter rail layout
(localStorage trial) is not documented; viewers and pickers show their
small-screen layout in the ~690px embed.

## Stage 3: Patterns

Per-field editing, action discovery, feedback (drop the
`components-toast--undo` embed: undo is not built), history diff, comments.
These pages stay in `srcExclude` until then.

## Stage 4: Release and upkeep

- Docs to production (after stage 1 on docs-dev; stages 2–3 follow per MR).
- Check the live Storybook embeds (`VITE_STORYBOOK_BASE=/storybook`).
- a11y panel per story (preview sets `a11y.test: "error"`); a11y bugs R28–R31.
- Optional: the headless story check (render every story, flag errors) in CI.
- Optional, later: a "How to configure" section with GraphQL examples.
