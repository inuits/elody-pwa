# Handoff deviations: what to revisit

Everything the redesign does differently from the handoff
(`elody-design-system-handoff/`), or did not build yet. Finish the redesign
first, then work through this list to move closer to the handoff.

**Rule:** every new deviation gets a row here when it is decided, with its ID
from `decisions.md` (the full reasoning lives there). Remove a row when it is
resolved.

Kinds:
- **Deviation:** built differently on purpose (user decision or source conflict).
- **Parked:** not built yet; the handoff behaviour is still wanted.
- **Open:** undecided.

## DS 1: tokens and primitives

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| F5 | Deviation | spacing scale `--spacing-*` (2px steps) | not imported (it would redefine Tailwind's `p-1`, `gap-2`…); exact spacing via component tokens | decide whether to migrate spacing to the handoff scale |
| I6 | Open | one bordered input | three input variants kept, on tokens | revisit (filters no longer need the other two?) |
| P2 | Deviation | no `lg` chip | `lg` kept (comparison columns) | check whether comparison columns can use the md chip |
| C2 | Parked | — (catalogue has indeterminate) | no indeterminate checkbox | with "select page" |

## DS 2: per-field editing

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| E1 | Deviation | pencil on hover | always visible (catalogue): editability must not depend on hover | — |
| E2 | Deviation | dashed underline under the value | under the value text only, none for pills (catalogue) | — |
| E4 | Deviation | pick, then Bewaar; never save on blur | no Bewaar per field: leaving the field or Enter saves, Esc/Annuleer discards (also WYSIWYG) | revisit with users |
| E5 | Deviation | opening a second field keeps the first open, nothing saved | the changed field saves first; on failure it stays open and the second doesn't open | follows E4 |
| E7 | Deviation (interim) | removing a repeatable row executes at once with an undo toast | a saved row asks for confirmation | replace with undo once `useUndo` exists (E14) |
| E8 | Parked | drag handle + ↑/↓ to reorder repeatable rows | not built | build |
| E9 | Deviation | table input rows each their own scope | a relation table saves as one scope (diff-only) | — |
| E10 | Deviation | clicking a value never navigates | a relation chip links to its entity when the link formatter names the relation type | — |
| E11 | Deviation | page-level "Bewerk" toggle removed | opt-in per entity type (`hasEditMetadataButton`), hidden by default | remove the whole-form path |
| E13 | Open | feature flag for one release (migration risk) | no flag | decide before rolling out to vlacc / VLIZ |
| E14 | Parked | undo after save (inline chip) and after removal (toast) | not built | build `useUndo`; then drop E7's confirm |
| E15 | Deviation | coordinates as text + "Toon op kaart" link | text only | — |
| E16 | Parked | image value: 48px thumb, opens the viewer | no image formatter | build with the first field that needs it |
| E17 | Deviation | copy affordance on every value, on hover | only on `copyToClipboard` fields, always visible | — |
| E18 | Parked | group form card (one Bewaar/Annuleer, `role="group"`) | not built (no config marks a group) | build with the first real group |

## DS 3: action discovery

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| A4 | Deviation | unavailable actions shown disabled with a reason | actions without permission are hidden (state-disabled ones stay visible with a reason) | — |
| A10 / D1 | Deviation | md triggers (12px, 6px 14px) | sm triggers in rows (dense rows) | — |
| D3 | Open | "Acties" trigger in label-blue ink | body ink (secondary button) | switch the ink if wanted |
| D5 | Deviation | disabled item explains itself via `title` | help icon with tooltip (keyboard-reachable) | — |
| D7 / D8 | Deviation | "Selectie: 2", "Verwijder 2 records" | "1/1,258 items selected", "Delete (2 selected)" | align copy |
| A8 | Deviation | — | collapse-when-empty bar and the count on the confirm button not taken | — |

## DS 4: lists, panels, filters, navigation

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| L10 / L11 | Deviation | pager and page size in a list footer (`pagination.md`) | in the results header band, per `templates/elody-list-screen` (« ‹ page [n] of N › », "Items: 20") | — |
| L12 | Deviation | — | aicap kit (`ui_kits/clients/aicap.html`) followed over the template for the results panel; view switch and "Items: 20" kept in the band | — |
| L13 | Deviation | selection bar with a split button (DS 3) | the list's selection row shows separate buttons, disabled until they apply (`ui_kits/clients`) | — |
| L18 / FL2 | Deviation | active filter section: count chip | accent-light section surface, no chip, no dot | — |
| L20 | Deviation | filter rail `--filter-panel-width` (250px) | 30% (250px felt too small) | — |
| L20 | Deviation (shortcut) | option counts as data | counts split from "Label (12)" on the client | DS 6: send counts separately |
| V29 | Deviation | filter rail beside every list (`filter-panel.md`) | rail closed by default (L18) and opened from a "Filters" button with a count badge at the start of the list band; the applied saved-search chip sits beside the button while closed (user) | — |
| V30 | Open | 250px filter rail beside the list (`filter-panel.md`) | trial: the filters open as a 300px pane inside the results panel, the Filters button at its top; the rail stays behind a switch | user picks pane or rail; remove the other and `filtersLayout.ts` |
| L22 | Deviation | one global focus ring | the filter input box carries the ring on `:has(input:focus-visible)` | — |
| L26 | Deviation | template page box 11.5px | 13px input | — |
| L27 | Parked | record stepper with a result-list popover | no popover | build |
| L28 | Deviation | account only in the expanded rail's footer row | collapsed rail keeps profile + logout | — |
| L29 | Open | text ≥ 4.5:1 | aicap's theme link colour (#C2A169) is ~2.4:1 on white | client theme decision |
| V19 | Open | client themes derive their accent roles | aicap sets only its accent, so `--color-accent-dark` (pager current page, current guided step) stays the platform blue next to its gold | add `accent-dark` to aicap's theme |
| L30 | Deviation | — | band button bold, selects regular (catalogue Button vs mockup select) | — |
| L31 | Deviation | em dash for an empty value in the preview (`preview-panel.md`) | "No value" (the handoff's foundations deprecate "-") | — |
| DS 4 leftovers | Parked | — | detail-panel add pills; missing "Add entity-translations.inscription" label | pick up as a side task |

## DS 5: viewers and flows

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| V1 | Deviation | dark viewport, translucent dark 26px capsules, filmstrip | catalogue + UI kit: white 40px bar over the checkboard, 28×24 buttons, circle arrows, no filmstrip | revisit if the handoff look is wanted |
| V5 | Deviation | home button | "Reset" text button (catalogue); it does not undo rotation (OpenSeadragon) | — |
| V2 / V8 | Deviation | AV: play/pause, scrubber, volume, fullscreen in the shared toolbar | native browser controls; toolbar has download only | build custom transport if wanted |
| V3 | Parked | IIIF manifest = image mode fed by canvases, filmstrip, no separate chrome | Mirador/Tify kept (Mirador backs the manifest comparison) | decide what replaces Mirador's comparison |
| V9 | Open | — | `base/MediaViewer.vue` (thumbnail column, coghent's media view mode) kept beside `MediaViewerNew` | move `ViewModesMedia` to `MediaViewerNew`? |
| V10 | Deviation | no red/green pairs | heat map keeps green → orange → red (user) | — |
| V10 | Deviation | fit to extent on load | the list map view keeps its initial extent (fitting would trigger the geo filter) | — |
| V12 | Parked | per-row "Retry" for a failed upload | not built | build |
| V13 | Deviation | dropzone button named "Upload bestanden" | named by the configured label (label-in-name) | — |
| V14 | Deviation | per-file bar with % | per-step progress (no upload progress events from `fetch`) | switch to XHR/streams for real % |
| V17 | Open | — | the failed prepare step's tooltip says "Mismatch between mediafiles and CSV" for any failure | general wording |
| — | Open | "rejected" state: toast with the type/size reason | not checked | check Dropzone's rejected files |
| G-A | Deviation | guided flow footer: Vorige · Volgende · Bewaar en sluit | each step's configured form keeps its own submit as "Next"; footer has Back and Save and close | move the submit to the footer if all step forms allow it |
| V20 | Deviation | rail rows: entity-type badge + title + check | step label + title + check (the flow config carries no badge tones) | add badge tones to the step config |
| G-B | Deviation | passed steps clickable to revisit | not clickable (the step's record already exists; revisiting would create a second one); Back stays | revisit-to-edit |
| V21 | Parked | each saved step undoable | no Undo for a chain with an upload step (the upload reports its host's id, not the new mediafile's) | have the upload report created mediafile ids, then delete them on undo |
| V21 | Open | — | a guided-flow upload the server rejects (duplicate) still advances the step | check `DynamicForm`'s upload path |
| V24 | Parked | search pill shows a spinner while searching | no spinner in the pill (the results list shows its own loading) | add a `loading` state to `BaseSearchPill` |
| V24d | Deviation | header search trigger is a pill field (`navigation.md`) | round accent icon button, as the UI kits (user) | none unless the handoff is updated |
| V26 | Open | one step card per step (`guided-flow.md`) | picker steps have no card (the list panel is the chrome); done with a `has-` selector and an `OnWhiteSurface` inject, a minimal fix | redo the picker step cleanly (user): one picker layout for guided-flow steps and the entity-picker modals (`entity-picker.md` library-embedded variant), decide the card vs list chrome there |
| Step 9 | Parked | DAMS tenants: media-first detail layout | not started (needs vliz-dams) | — |
| DS 3 note | Open | every button named | recrop modal close button had no name (found in DS 3) | check |
| V32 | Deviation | confirm body names the record with its type badge (pickers card) | the type in words in brackets, no badge: `confirm()` takes plain strings | pass a badge to `confirm()` when a second caller needs it |
| V39 | Deviation | result rows with type badges; "Kies" per row (pickers card) | no badge (a picker shows one type); multi select toggles rows and commits with "Voeg toe" (`entity-picker.md`), single select picks on the row; the first page of results only, narrowed by the search | badges when a picker spans several types; a "more" row if the first page proves too short |
| V35 | Deviation | WizardSteps: current chip on `--color-accent` with white text, steps to come in `--text-muted` | current on `accent-dark`, to come in `text-secondary` | white on vlacc's accent is 2.80:1 and muted on the faded chip 4.24:1 (11px bold text needs 4.5:1); now 7.33:1 and 6.05:1. Revisit if the catalogue darkens its accent |
| V36 note | Open (user, 2026-11-02: tackle later) | list columns readable in narrow panels | in a narrow side panel (vlacc manifestation → Work(s)) the columns after the badge are cut ("Subty…", "Origi…", "No…") and the last label ("SISO") overlaps "Actions" | decide per narrow panel: fewer columns, horizontal scroll, or a multi-line row |
| V38 note | Open | toast bottom-left, auto-dismiss 6s (8s with an action), pause on hover, `role="status"` (errors `role="alert"`) (`feedback.md`) | toasts sit top-right, stay 10s, no status role checked | move the toast group and timings in one go; check the roles |

## Menu refactor (feat/menu-refactor)

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| N1 | Deviation | the rail stays the collapsed default; the flyout opens on demand (`navigation.md` Round 2) | user, 2026-11-06: one Home Assistant-style ≡› / ≡‹ icon button at the top of the rail (under the logo; beside it when open) keeps the menu open (beside the page, which moves aside; user, 2026-11-09) or collapses it; closed is the default; no open-on-hover (tried and dropped); on the closed rail a group opens a flyout of its sub-items beside its icon instead of opening the whole menu | — |
| N2 | Deviation | tooltip linked with `aria-describedby` (`accessibility.md`) | rail tooltips not linked: they repeat the item's accessible name | — |
| N3 | Done | — | new `NavRail` mounted in `App.vue` (2026-11-06); old `MenuNav`, `MenuItem`, `MenuSubItem` and their dead menu state in `useMenuHelper` removed (2026-11-09) | — |

## Grid view (redesign/grid-view, 2026-11-12)

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| G1 | Deviation | hex colours (`#2B56A0`, `#F1F6FC`, `#DFE6EC`…), blue checkbox | mapped to role tokens (`accent`, `accent-wash`, `border-subtle`, `surface-muted`, `text-link`); checkbox stays commit teal | — |
| G2 | Deviation | short labels ("Access", "Admin") and an "Updated" field | user, 2026-11-12: only existing teaser metadata with its own labels; long labels widen the label column | — |
| G3 | Deviation | footer has select + eye only | ⋮ (`EntityButtons`) next to the eye, same as list rows: only shown when the context menu is configured (`forceShowContextMenuActions` or a relation list) | — |
| G4 | Parked | "Select all" selects every result; "Select all 5,312 results" link after a page | "Select page" (existing key) selects the current page; the off-page note/clear link already exists | cross-page select-all, respecting `bulkSelectAllSizeLimit` |
| G5 | Deviation | status "2 of 5 selected" | existing "Selection: N" copy kept | — |
| G6 | Parked | "Select" footer label | `te('bulk-operations.select')` with English fallback; key not yet in baseGraphql translations | add `bulk-operations.select` (en/nl/ar) |
| G7 | Deviation | Select all in the selection bar in both views | grid only; list keeps its column-header checkbox | — |
| G8 | Deviation | label / value rows; select + eye in the footer | user, 2026-11-13: label above value (labels styled like list field labels), checkbox on the media corner (aria-label only), eye and ⋮ beside the title, no footer, title keeps its dashed underline on hover (as in list rows) | — |
| G9 | Deviation | — | grid card size switch "Large / Compact" after the view switch (user, 2026-11-13); keys `library.grid-size.*` en/nl, ar falls back | — |

## Public docs review (2026-11-13)

The public design-system pages (elody-docs) now describe only what is built. These handoff items were removed from them and are not logged above. **Bug** = a product defect found during the review.

| ID | Kind | Handoff | What we have | Follow-up |
|---|---|---|---|---|
| R1 | Parked | toggle group as `role="radiogroup"`, ←/→ moves, disabled segment | icon buttons with `aria-pressed` in `role="group"`, no arrow keys, no disabled segment; aria-label hard-coded to "view mode" | make generic, add keys |
| R2 | Parked | slider: commit-teal fill, value bubble on drag/focus, disabled | mint `--color-accent-normal` fill, `:tooltips="false"`, no disabled prop; range slider has hard-coded "From:/To:" and raw colours | move to tokens + i18n |
| R3 | Parked | date picker: range, two months, week numbers, min/max, "Today" link, locale format | single date (+ time), fixed `dd/MM/yyyy`, library chrome | decide on range |
| R4 | Parked | autocomplete: chip focus with ←/→, Backspace removes, type badges in results, "create new item" row | none of these | build with the relation picker work |
| R5 | Parked | dropdown: result count while searching, labelled search | not built | — |
| R6 | Parked | dynamic form: tab error dot, tabs pattern with keys, validation summary, Cancel, `role="group"` actions, server error `role="alert"` | none; tabs are clickable divs, the story passes a non-existent `errorTabs` | tabs a11y first |
| R7 | Parked | guided flow: step valid/error dots, clickable step chips, resume at first invalid step | not built | — |
| R8 | Parked | split button submenus | no submenu exists | only when a client needs one |
| R9 | Deviation | never a bare ⋮ | bare ⋮ (with aria-label) in list rows and below 768px (bottom sheet) | keep; documented as the exception |
| R10 | Parked | selection bar "running" state (progress per operation, bar locked); pagination inside the bar | not built (pagination props exist, render nothing) | — |
| R11 | Parked | panel status chip with explanation popover + jump to field; expand panel to modal; SectionHeader band | header status is an editable metadata pill; `--color-surface-section-header` unused | — |
| R12 | Parked | page number in the URL; pager locked while a page loads | not built | — |
| R13 | Parked | undo toast after "Clear all" / "Clear filter" in the filter rail | not built | with `useUndo` (E14) |
| R14 | Parked | modal: Escape blocked while busy, inline `role="alert"` error | Escape always closes; no error slot | — |
| R15 | Parked | saved searches: default/star, share with team, save vs save-as, undo after delete | menu in the filter rail, delete asks to confirm | — |
| R16 | Parked | media viewer: "no media" state, filename + mimetype line, viewport `role="img"`, keyboard shortcuts | not built (only OpenSeadragon defaults) | — |
| R17 | Parked | map: enlarged selected marker, loading state, "no location" line, selection shared with the list | not built | — |
| R18 | Deviation | breadcrumb = entity ancestors with badges | navigation history ("…N", previous route, current) | decide if an ancestor trail is wanted |
| R19 | Parked | record hierarchy as a tree (badges, counts, persisted expansion, Enter opens) | only the import folder tree exists | — |
| R20 | Parked | import browser: two-pane modal, file table with checkboxes, path breadcrumb, retry, progress hand-off | one folder tree + "start import" | — |
| R21 | Parked | audit trail (AuditEntry, `role="log"`), "Compare" from a trail row; diff `role="table"`, "show only changes", "no differences", restore version | history page with a version dropdown per column, red/green diff | — |
| R22 | Parked | comments inline on the record: Reply/Resolve on hover, Ctrl+Enter, `role="log"`, undo after delete | threads in a modal, open/resolved/archived, Edit/Delete, delete asks to confirm | — |
| R23 | Parked | upload: per-file % bar, cancel per file, toast for rejected files | step glyphs per file, trash button; over the file limit a file is dropped silently | at least report dropped files |
| R24 | Parked | WYSIWYG: icon toolbar with link + clear format, `role="toolbar"`, `aria-pressed`; virtual keyboard as a popover (`role="dialog"`, Escape) | text buttons per extension, `is-active` class; keyboard panel fixed bottom-centre | — |
| R25 | Parked | field values: image thumbnails, "Show on map" for coordinates | not built | — |
| R26 | Parked | multilingual inline editor (locale chips above one input, dirty dot) | one language per edit | — |
| R27 | Parked | list: arrow-key row cursor, table mode as a real table | divs without table roles, no row cursor | — |
| R28 | Bug | — | toasts have no `role="status"`/`"alert"` (library outputs no live region) | add a live region |
| R29 | Bug | — | virtual-keyboard trigger is a clickable `<div>`: not reachable by keyboard | make it a button |
| R30 | Bug | — | import folder tree rows are clickable `<div>`/`<a>` without ARIA: not usable by keyboard | tree pattern |
| R31 | Bug | — | comment thread card is a clickable `<div>` without tabindex; comment edit button has no aria-label | make them buttons |
| R32 | Open | — | checkbox: disabled + checked fills with label-blue (`text-text-light`), disabled labels keep body ink and a pointer cursor | done 2026-11-16: muted grey via `--checkbox-disabled-*` tokens |

## Stage 1 docs review findings (2026-11-16)

Found while writing the stage 1 component pages; not fixed in the docs branch. **Check** = reported from reading the code, not yet confirmed in the app.

| ID | Kind | Where | Finding | Follow-up |
|---|---|---|---|---|
| S1 | Bug | `useDropzone.ts:12,27` | `maxFileSize` is not a dropzone.js option (`maxFilesize`), so the configured size limit is ignored (dropzone default 256 MB) | user decides: fixing it starts enforcing limits |
| S2 | Security (check) | `useUpload.ts:1056,1090` | upload error/warning messages inserted with `innerHTML`; XSS if a message contains file names or CSV content | trace message sources; escape or use text |
| S3 | Bug (check) | `useBaseRangeSlider.ts:16-17,69` | min/max copied once at setup; `RangeMatcher` sets them in `onMounted`, so the range filter may get a 0–0 scale | confirm in the app |
| S4 | Bug | `BaseRangeSlider.vue:94` | composable `unit` shadows `props.unit`; the unit never renders | — |
| S5 | A11y | `BaseRangeSlider.vue:32,50,44,63,20` | hard-coded "From:/To:" divs (inputs unnamed), error not announced, raw colours (`text-red-default`, `text-gray-300`) | with R2 |
| S6 | A11y | `BaseSlider.vue:2,35` | handles have no accessible name; own grey focus ring with `outline: none` instead of the global ring | with R2 |
| S7 | A11y | `BaseToggleGroup.vue:7,29` | `overflow-hidden` clips the focus ring; icon segments read their name twice (aria-label + tooltip) | — |
| S8 | A11y | `BaseToggle.vue:2` | clickable `<div>`, no role/keyboard/name; only use is behind `v-if="false"` | delete or rebuild |
| S9 | Bug | `Dropzone.vue:66` | files over the max count removed silently (= R23) | report dropped files |
| S10 | A11y | `BaseProgressStep.vue:8,36` | status only in `title`; spinning cog ignores reduced motion | — |
| S11 | A11y | `DropzonePreview.vue:34` | remove button "Remove file" without the file name | — |
| S12 | Bug (check) | dropzone | a rejected file type probably shows no error and may still queue | confirm |
| S13 | Out of date | R1 | toggle group now has a `groupLabel` prop (default "View") and text segments | update R1 |
| S14 | A11y | `MetadataTitle.vue:31,43-50` | help-tooltip trigger and info-panel trigger are unfocusable `div`s (info trigger also unnamed): keyboard users can't reach either | make them buttons |
| S15 | A11y | `BaseInfoPanel.vue:5,18` | `role="dialog"` without name/`aria-modal`, no focus move, no Escape; close button label `t('close')` has no key (raw "close") | use `actions.labels.close` |
| S16 | A11y | `BasePagination.vue:41-45` | help icon next to a capped count is an unfocusable `span` | — |
| S17 | Bug | `BasePagination.vue:101` | `Number(localPage)` accepts decimals (2.5 becomes the page) | round/validate |
| S18 | Bug (check) | `BaseModal.vue:104-128` | each modal adds a document Escape listener; one Escape may close stacked modals together | confirm |
| S19 | Bug | `BaseTooltip.vue:3,74` | auto placement ignores `position`; `top-right` (MetadataTitle, LogInLogout) is not a valid placement; anchors to a block wrapper | — |
| S20 | A11y | `BlockingOverlay.vue:13` | `role="alert"` with no message says nothing | require a message |
| S21 | A11y | `SpinnerLoader.vue:4`, skeletons | no `prefers-reduced-motion` handling anywhere in the project | add a global rule |
| S22 | Tokens | `ListItemSkeleton.vue:9`, `DynamicFormSkeleton.vue` | literals `bg-gray-300`, `h-[16px]` | move to tokens |
| S23 | A11y | `DeleteModal.vue:2-6` | no title: delete dialog has no accessible name; without blocking relations the whole header (and close button) is hidden | — |
| S24 | Consistency | `InlineConfirmButtons.vue:2` | confirm left / cancel right, opposite of the confirm dialog | align order |
| S25 | Dead code | `BaseModal.vue:80` | `modalColor` prop unused | remove |
| S26 | A11y | `AdvancedDropdown.vue:25` | lists of ≤ 10 options (no search) get `tabindex=-1` + `aria-hidden` from the library: not reachable by Tab, ✕ unreachable too | high priority |
| S27 | A11y | `AdvancedDropdown.vue` | no `aria` prop to VueSelect: combobox named by its value, not the field label; placeholder text in `aria-describedby` | pass label |
| S28 | Bug | `AdvancedDropdown.vue:245` | clearable single select always lists "— No value", so loading skeleton and "No options" never show | — |
| S29 | A11y | `BaseInputAutocomplete.vue:102` | Enter on a chip ✕ does nothing (library ignores non-mouse events), Space unhandled | — |
| S30 | Bug/A11y | `main.css:712`, `multiselect-custom-theme.css:142` | `--bg-multiselect-remove` undefined: clear-all button invisible but tabbable and unnamed | — |
| S31 | A11y | `BaseInputAutocomplete.vue:2,5` | combobox not named by the field label; shared ids `assist`/`multiselect-options` across instances; Escape drops focus to body; "No results found" untranslated; nothing renders when `modelValue` is undefined | — |
| S32 | A11y | `BaseDatePicker.vue:2` | field always named "Datepicker input"; no arrow keys in the calendar (42 tab stops); weekday headers are `gridcell`; invalid typed text shows no error | — |
| S33 | A11y | `BaseInputColor.vue:14` | swatch and hex field unnamed, no prop to name them | — |
| S34 | Bug | `BaseInputTextNumberDatetime.vue:60` | `resizableTextarea` mode drops `disabled`, `readonly`, `placeholder`: a disabled growing textarea stays editable | — |
| S35 | Dead code | `InputField.vue` | old separate input, only used by its own stories | delete |

## Stage 2 docs review findings (2026-11-16)

Found while writing the stage 2 composite pages. **Check** = from reading the code, not confirmed in the app. Fixed in the docs branch: T1–T3 (keyboard + `aria-expanded`, with tests).

| ID | Kind | Where | Finding | Follow-up |
|---|---|---|---|---|
| T1 | A11y | `BaseExpandButton.vue` | expand tab was a clickable `div` | **fixed**: button, `aria-expanded`, named Expand/Collapse (English fallback; add `expand-button.expand/collapse` keys in baseGraphql) |
| T2 | A11y | `EntityElementWindowPanel.vue` | block collapse only via a clickable header `div` | **fixed**: the expand/compress icon is a button named by the block title, `aria-expanded` |
| T3 | A11y | `EntityElementWrapper.vue` | panel collapse chevron was a clickable `span` | **fixed**: button named by the panel title, `aria-expanded` |
| T4 | Not built | group form card (E18) | no grouped editing in code; the old story faked `isGroup` | page stays hidden; story removed |
| T5 | A11y | `FolderTreeLine.vue:21,41` | rows are clickable divs, chevron an `<a>` without href: mouse-only; no tree ARIA; selection by colour only; raw colours (`bg-blue-75`, blue-500) | rebuild (reverted POC `ab3fdc7b`) |
| T6 | A11y | `ListItem.vue:61-79`, `TableViewRow.vue:17-29` | row checkboxes in list and table mode have no accessible name | — |
| T7 | i18n | `ListItem.vue:120` | `bulk-operations.select` missing from en.json (falls back to "Select") | add key |
| T8 | A11y | `PreviewHost.vue:9` | small-screen preview `role="dialog"` without accessible name | — |
| T9 | Bug | `PreviewWrapper.vue:119` | changes-preview body `max-h-[calc(100vh-29rem)]` collapses to 0 in short viewports | — |
| T10 | i18n | `metadata.tooltips.locked-field` (`LockedFieldIndicator.vue:16`) | only ugent-aicap defines it; others show the raw key | add key |
| T11 | i18n | `navigation.close-menu` (`NavRail.vue:45`), `navigation.open-menu` (`MobileTopBar.vue:12`), `map.center-map` (`HeatMap.vue:136`) | keys missing; raw key is read out / shown | add keys |
| T12 | Copy | en.json:500, :530 | "1 of these fields are required"; "Entity successfully Updated" | fix copy |
| T13 | Tokens | `EntityElementWindowPanel.vue:181`, `MenuBadge.vue:5`, `useMaps.ts:166` | raw palette classes / rgb heat colours instead of role tokens | — |
| T14 | Legacy UI | `ImportFromNetworkDrive.vue:24,249`, `MediaViewerNew.vue:117,141,166` | raw `<button>`s with `bg-accent-accent` / `bg-accent-normal` instead of `BaseButtonNew`; "no directories" text has no padding (:18) | — |
| T15 | Dead code | `ImportListItem.vue` | unused | delete |
| T16 | Bug | `FiltersToggle.vue:34` | applied saved-search chip shown only while the pane is closed; pane layout has no `FiltersHeader` | — |
| T17 | Rules | `SavedSearches.vue:26` | Delete is neither danger ink nor last (recent searches follow it) | use the overflow-menu rules |
| T18 | A11y | `SavedSearchesPickerModal.vue:2,63` | modal has no title (no accessible name); select-all shown although limit is 1 | — |
| T19 | A11y | `BreadCrumbs.vue:96` | history list closes only by backdrop click: no Escape, no focus handling | — |
| T20 | Bug | `BaseSearchPill.vue:20` | `dimensions="3"` string to a number prop (Vue warning) | — |
| T21 | Behaviour | `FiltersBase.vue:311` | filters that resolve option ids apply on input, not on Apply | design decision |
| T22 | Licence | `BaseMap.vue:11` | `attributionControl: false`: no OSM attribution on the location map; uses Leaflet zoom, not `MapChrome`; leftover `console.log` (:106,108) | show attribution |
| T23 | Tokens | `PointMap.vue:56` | without clustering, points use OpenLayers' default blue style, not the accent marker | — |
| T24 | Bug | `TextViewer.vue:78` + `SanitizedHtml.vue:49` | `<br/>` vs DOMPurify `<br>`: every multi-line text file shows the "sanitized" notice | compare after normalising |
| T25 | A11y | `main.css:465-466`, `ViewerToolbar.vue` | viewer buttons 28×24 (< `--touch-target-min`); rotate/zoom/fullscreen have no tooltip | — |
| T26 | A11y/i18n | `WYSIWYGButtons.vue:47,262` | hard-coded English labels; no `role="toolbar"`/`aria-pressed`; raw `0.25rem`; stray `s` attribute | — |
| T27 | A11y | `MetadataTitle.vue:3` | field label is a `<p>`, not tied to its input: dynamic-form fields have no programmatic label | — |
| T28 | Not built | DynamicForm, BaseTabs | handoff extras: tab error dots, validation summary, `role="group"` submit zone, pristine-disabled Save | — |
| T29 | Not built | guided flow, media viewer, map viewer | Escape-without-asking when pristine; filmstrip, file title line, +/−/0/F shortcuts; keyboard panning | — |
| T30 | Not built | list/table | real `<table>`, arrow-key rows, SectionHeader, StatusChip quality popover, expand-to-modal panel, promoted row pills | — |
| T31 | Design | `MetadataWrapper.vue` `underlineValue` | Yes/No values get the dashed underline, chips don't | design look |
| T32 | Docs | internal `components/field-row.md`, `inline-editor.md` | coordinates edit via `EntityElementCoordinateEdit.vue`; multilingual fields do have an inline editor now | update notes |
| T33 | Tooling (check) | Storybook | every story logs one generic 404 resource; HMR sometimes fails once with "Cannot redefine property: $route" | — |

## Stage 3 docs review findings (2026-11-17)

Found while writing history diff, comments and the three pattern pages. **Check** = from reading the code, not confirmed in the app. Docs corrected on the way: split-button.md (several promoted actions → one primary, the rest lead the menu; the impossible `promoted-and-menu` story removed) and inline-editor.md (no focus-back claim, see U2).

| ID | Kind | Where | Finding | Follow-up |
|---|---|---|---|---|
| U1 | A11y | @kyvg/vue3-notification 3.4.1 | notifications have no role / live region (not announced), can't be closed by keyboard, don't pause on hover | wrap with a `role="status"`/`alert` region or replace |
| U2 | A11y | `useEditScope.requestOpen` + `MetadataWrapper.vue:1031`, `ListItemInlineField`, `EntityElementCoordinateEdit` | after a failed save blocks another field, focus doesn't return to the failing field (only WYSIWYG passes `focus`) | pass `focus` callbacks |
| U3 | Bug | edit scopes | no `beforeunload` guard: closing the tab or reloading drops an open field's draft silently | add guard while a scope is dirty |
| U4 | Rules | `TheHeader.vue` | danger Delete sits before History and the Actions menu (not last) | — |
| U5 | Rules | `LogInLogout.vue:117`, `ViewModesAutocompleteRelations.vue:385` | confirm dialogs that guard no loss (logout, create from dropdown) | drop or justify |
| U6 | Bug (check) | inline save on blur | rows shift up after a save, so a click aimed at the next field can land on another row (seen once in Storybook) | confirm |
| U7 | A11y | `CommentItem.vue` | discussion card is a click-only div (no role/tabindex): keyboard users can't open a discussion; tag chips are mouse-only | make it a button/link |
| U8 | A11y | `CommentThreadModal` | close control is a div, not a button (Esc works) | — |
| U9 | A11y | comments | Edit/Delete names don't say which comment; nothing announces a new or posted comment | — |
| U10 | Contrast (check) | comments | white on `--color-accent-normal` (New/Open), accent-normal text (Edit/Delete), `text-placeholder` dates: likely < 4.5:1 | measure, use role tokens |
| U11 | Tokens/UI | comment components, `HistoryComparison.vue` | primitive colour classes; composer Post is full-width, Cancel unstyled | — |
| U12 | A11y | `EntityHistoryWindowPanel` | panel header is a clickable div (same as T2) | reuse the T2 fix |
| U13 | A11y | `EntityHistoryWindow` | window title is an `h1` → several h1s on the page | — |
| U14 | A11y | history diff | changed rich-text blocks are marked by border and tint only; old/new only by colour and column | add a text cue |
| U15 | Tokens | history diff | changed values coloured from the client pill config (`pill.modified`/`pill.added`), not `--color-diff-*` | decide which wins |
| U16 | Dead code | `WysiwygDiffFlag.vue` | stories and tests, no use in the app | delete or use |
| U17 | Docs | internal `components/field-row.md`; code comments | "nothing saved implicitly" is wrong (opening another scope saves the changed one); comments point to a non-existent `patterns/per-field-editing.md` | update notes |
| U18 | Bug | `BaseLibrary.vue:2` vs `EntityPickerComponent.vue:19-22` | root `h-full` overrides `h-(--entity-picker-height)` in filters mode: the picker resizes with its results (411px instead of 70vh) | — |
| U19 | Bug | `BaseLibrary.vue:1259-1260` | "select page" skips an already-linked entity only when both id and uuid match (`\|\|` should be `&&`): linked entities can be enqueued | fix with a test |
| U20 | A11y | `ListItem.vue:61-78` | list-mode row checkbox has no `aria-label` (grid card has one); confirmed in the picker DOM (= T6) | — |
| U21 | Bug | `ViewModesList.vue:95-99`, `useEntityListHelpers.ts:80` | already-linked (greyed) rows still open in the detail modal on click; the disabled check only covers Navigate | — |
| U22 | Dead config | `DynamicForm.vue:66-95` | `highlightedEntityIds` / `highlightLabel` never passed; only the guided flow highlights | — |
| U23 | Check | entity picker DOM | 12 checkbox inputs for 5 rows + header (a second set per row) | find the source |
| U24 | Docs | entity-picker.md | the main picker is `EntityPickerComponent` (library + filters); the page documented only `RelationPickerModal`. Rewritten; relation picker stories renamed `modals-relationpicker--*` | done |

## Story audit (2026-11-17)

Every docs embed checked against the component the app actually shows. 16 stories rebuilt on the real container (HistoryComparison view, EntityElementComments + CommentThreadModal, MediaViewerNew, DynamicFormModal, Dropzone + useUpload, EntityElementWindow, ListItem, MetadataWrapper, RepetitiveFlow picker step). Storybook gets `.storybook/queryLoader.ts` (history queries are not in this client's generated types). Findings:

| ID | Kind | Where | Finding | Follow-up |
|---|---|---|---|---|
| U25 | Bug | `useDropzone.ts:16` | `dropzone = ref<Dropzone>;` stores Vue's `ref` function, not a ref: `.value` is shared by every instance | fix with a test |
| U26 | A11y | `EntityElementMetadataEdit.vue:94-96` | form field errors are a plain red div: no `aria-describedby`, `aria-invalid`, `role="alert"` or red border (inline editor has all) | align with the inline editor |
| U27 | Tokens | `main.css:194` | `--color-surface-section-header` unused; client theme doesn't reach block headers as client-theming.md implies | check the page claim |
| U28 | Test | `useBreadcrumbs.test.ts:416` | `typePillLabel` passed as a string; real data is `{label, formatter}` | fix test data |
| U29 | Bug | `helpers.ts:751`, `ElodyAction.vue` | `getChildrenOfHomeRoutes` returns undefined without `routerConfig`; `.map` then crashes | default to [] |
| U30 | Layout | `HistoryComparison.vue:13,56` | long version labels widen the dropdown past its column at ~800px, clipping the chevron | truncate |
| U31 | Dead code | `FolderTree.vue` | not imported anywhere | delete |
| U32 | Bug | `ImportFromNetworkDrive.vue:12-13` | passes `selected-directory` props FolderTreeLine doesn't declare (it injects them): stray attributes | remove |
| U33 | Bug (check) | `useViewModes.ts:216-217` | no `_displayPreferences` → no view mode on, library shows no rows until a route change; may hit a fresh browser | confirm in the app |
| U34 | Bug | `useMetadataWrapperDropdownOptions.ts:177-183` | relation field throws without `advancedFilterInputForSearchingOptions` | guard |
| U35 | Config | generated `GetEntityPickerForm` | no `label`, no `entityPickerSearchConfig`: title only from the opener, search mode only from client form queries | — |
| U36 | Docs | chip-and-badge.md | tones and letter badges are supported config no client uses; the only real badge is the breadcrumb type badge (full value) | page reframed |

## View modes, bulk edit, merge, multi-entity view (2026-11-17)

New pages view-modes, bulk-edit, merge-entities, multi-entity-view. Fixed on the way: `MultiEntityView.vue` empty state fell back to the raw key `multi-entity.no-results` for clients without it (English fallback, with test).

| ID | Kind | Where | Finding | Follow-up |
|---|---|---|---|---|
| U37 | i18n | `multi-entity.no-results` | only one client defines it | **fixed** (fallback); add the key to baseGraphql |
| U38 | Bug | `MultiEntityView.vue:78` | a failed query shows the same "no results" as an empty result; no error state | — |
| U39 | A11y | `MultiEntityColumn.vue:5-19` | heading link named only by the type letter ("W") | add the record title |
| U40 | Tokens | `MultiEntityColumn.vue:2-4,38`, `MultiEntityView.vue:2,17` | palette/Tailwind values instead of role tokens; header buttons centred | — |
| U41 | Cleanup | `MultiEntityColumn.vue:116-117` | `useEditMode` called twice | — |
| U42 | Deprecated | `ViewModesMedia`, `useViewModes.ts:172` | media mode deprecated in the schema, no client enables it; its toggle reuses `displayPreview` | remove |
| U43 | A11y | `PipelineCanvas.vue:7-10` | pipeline pans only by dragging | keyboard pan |
| U44 | Behaviour | `useViewModes.ts:265,299`, `BaseToggleGroup.vue` | one remembered mode for all libraries; first mode differs between "nothing saved" (first toggle) and "something saved" (list wins) | decide |
| U45 | Bug (check) | `SearchModal.vue:28` | forces list view but keeps `saveViewPreferences` true | — |
| U46 | Bug | `BulkOperationsMergeModal.vue:174-177` | compares only selection items 0 and 1; relies on config min/max 2 | guard |
| U47 | i18n | `BulkOperationsMergeModal.vue` ~300, ~355 | failed merge shows `String(error)`, not the translated description | — |
| U48 | UI/Tokens | `BulkOperationsMergeModal.vue:22-27,78-101`, `MergeDiffTable.vue:46-62` | Cancel stretches; default-blue radios and legacy colour classes; lock only in the right column | — |
| U49 | A11y | `BulkOperationsMergeModal.vue:87` | blocked reason not tied to the disabled Merge button | `aria-describedby` |
| U50 | Bug | `useBulkOperationsActionsBar.ts:519` | `askForCloseConfirmation` passed for bulk edit and merge but never read: Escape/× drop bulk-edit changes silently | wire it up |
| U51 | A11y | `BulkEditClearFieldButton.vue:11`, `BulkEditFieldScopeNote.vue:2` | clear buttons don't name their field; scope note not linked to its field | — |
| U52 | Tokens | `BulkEditRelationModeSelector.vue:2` | legacy classes | — |
| U53 | Docs | `BulkOperationsSubmitBar.stories.ts:12` | says the bar is bulk edit's footer; bulk edit uses DynamicForm's Apply | fix description |
| U54 | Backend | `collection-api/.../merge.py:126` | carrying relations over in a merge is per client | page says so only where implemented — check wording |
| U55 | Layout | bulk edit modal | side by side only from 56rem modal width; docs embed renders it at 1200px (small text) | — |
| U56 | Bug | `EntityElementHierarchyListViewer.vue:2`, `EntityElement.vue:117` | hierarchy panel chevron emits `toggleElementCollapse` but nothing handles it: the panel can't collapse | wire it up |
| U57 | Bug | `EntityElementHierarchyListViewer.vue:84,88` | empty `hierarchyRelationList` or no form returns before `finally`: spinner never stops | fix with a test |
| U58 | Bug | `EntityElementHierarchyListViewer.vue:96-97,135` | no `ref_point` → TypeError; `onMounted` promise not caught (unhandled rejection) | guard |
| U59 | Copy | `EntityElementHierarchyListViewer.vue:36` | empty text is `search.noresult` ("No results match your filters") in a panel without filters | own empty text |
| U60 | A11y | `EntityElementHierarchyListViewer.vue:15` | spinner `aria-hidden`, no status text while loading | — |
| U61 | Bug | `EntityElementHierarchyListViewer.vue:121` | `preferredLanguage` hard-coded "en" | use locale |
| U62 | Config | `HierarchyListElement.can` | never checked in the PWA (maybe enforced in GraphQL, unchecked) | — |
| U63 | Bug | `useResizeHelper.ts:41` | the panel expand button never resized the columns in the app: the guard compared against `currentColumnConfig.value.length` (a Record, always undefined) and always threw | **fixed** (`[entityId]?.length`), with tests |
| U64 | Bug | `useResizeHelper.ts:41-49`, `EntityColumn.vue:191` | with a column count other than 2 the resize still fails silently (`console.log`); several single-column configs turn the expand button on, so it shows and does nothing | hide the button unless there are 2 columns |
| U65 | State | `BaseExpandButton.vue:43` | toggled state lives only in the button, not synced with the column sizes | — |
