# Working sheet: reconciling the sources

Temporary. Used only while we merge the design sources into one system. Each
decided row moves into its final page (and its tokens and component), and is
then marked **done**. When every row is done, this file can be deleted.

**Rule:** the handoff is the default. We only look at the alternatives when
something seems wrong or conflicts.

Columns:
- **Handoff:** `elody-design-system-handoff/` (docs, specimens, CHANGES Round 2)
- **Catalogue:** `components/*.jsx` + `readme.md`
- **POC:** colleague's branch `redesign/per-field-editing-poc` (`60fd57a6`)
- **Now:** branch `feat-165140-tokens-and-primitives`
- **Decision:** filled in together

---

## 1. Foundations

### 1.1 Tokens

Token values agree between handoff and catalogue (77 shared tokens). The two
use different naming: `--surface` in the catalogue vs `--color-surface` in the
handoff. We keep the handoff names, because Tailwind v4 derives utilities from
the namespace (`--color-*` gives colours, `--text-*` gives font sizes).

| # | Item | Handoff | Catalogue | POC | Now | Decision |
|---|---|---|---|---|---|---|
| F1 | `--color-text-link` | #355BA9 (= label blue) | #1D4ED8 | #355BA9 | #355BA9 | **done:** #355BA9; legacy #1D4ED8 removed |
| F2 | Layout tokens (`--filter-panel-width`, `--nav-rail-width`, `--touch-target-min`, `--page-pad`, gutters) | not defined | defined | not defined | defined | **done:** already defined (composite tokens) |
| F3 | Font-weight tokens (`--weight-regular/bold/black`), `--font-mono` | not defined | defined | not defined | defined | **done:** keep |
| F4 | Entity-named badge aliases (`--badge-work/expression/manifestation`) | no (tones only; the mapping is client config) | yes | no | no | **done:** no aliases; mapping lives in config |
| F5 | Spacing scale `--spacing-*` | defined (2px steps) | defined | not imported (would override Tailwind `p-1`, `gap-2`…) | not imported | **done:** not imported; exact spacing via component tokens |
| F6 | `--color-commit-hover` | mint #6BC6B3 in tokens, #0A9AA3 in specimen | #0A9AA3 | n/a | buttons use #0A9AA3 | **done:** #0A9AA3; `--color-commit-strong-hover` merged into it |

### 1.2 Contrast (WCAG AA, 4.5:1 for text)

Both sources claim "all badge text/background pairs ≥ 4.5:1". Measured:

| # | Pair | Ratio | Passes | Proposal | Decision |
|---|---|---|---|---|---|
| F7 | Badge tone1 #15803d on #DAF1DC | 4.20 | no | text #166534 → 5.97 | **done:** #166534 |
| F8 | Badge tone3 #B95000 on #FDEBD7 | 4.28 | no | text #9A4300 → 5.68 | **done:** #9A4300 |
| F9 | Relation chip white on #6DBBDE | 2.14 | **no** | darker chip bg, or dark text | **done:** body text on the same blue, 5.68 |
| — | Badge tone2 #355BA9 on #C8EAF7 | 5.14 | yes | — | |
| — | Subtype #505F79 on #E8EEF0 | 5.51 | yes | — | |
| — | Link #355BA9 on white | 6.52 | yes | — | |
| — | Placeholder #9CA3AF on white | 2.54 | n/a (placeholder) | keep, never sole label | |

### 1.3 Ground rules

| # | Rule | Handoff | Catalogue | Decision |
|---|---|---|---|---|
| F10 | Fixed elements | exactly two: 52px rail + detail header | rail + white top bar (+ fixed toast) | **done:** handoff |
| F11 | Pill radius | 14px only | "14–16px" (token 14px) | **done:** 14px |
| F12 | Focus ring | 2px commit teal, 1px offset, `:focus-visible` | 1–2px, inset where flush | **done:** handoff (already built) |
| F13 | Confirm dialogs | only for true unrecoverable loss | only for entity deletion | **done:** handoff |
| F14 | Client-swappable set | accent pair + derived roles | same | agree; handoff text names `--color-accent-accent`, a typo (it's commit teal) |
| — | Two elevation levels, card = border no shadow | yes | yes (but some catalogue components add shadows) | agree |
| — | Pill starts / rectangle executes | yes | yes | agree |
| — | Max three chrome layers | yes | yes | agree |
| — | Dark mode | open, not now | not now (pipeline ships a dark variant) | agree: not now |

---

## 2. Primitives

Order: Button → Checkbox → Input → Tooltip → Spinner → Badge/Pill → Dropdown.

### 2.1 Button: [final page](../components/button.md)

| # | Item | Handoff | Catalogue | POC | Before | Decision |
|---|---|---|---|---|---|---|
| B0 | Variants | primary/secondary/ghost/commit/danger; grey + mint deprecated | 7 incl. mint | handoff set, old names still accepted | handoff set, old names removed | **done:** handoff |
| B1 | Sizes | sm + md | sm/md/lg | normal/small/verySmall | normal/small/verySmall | **done:** sm + md; call sites codemodded |
| B2 | Radius | by variant: secondary 5px, others 6px | by size | 6px all | 6px all | **done:** handoff |
| B3 | md metrics | 12px, 6px 14px, gap 6px | 12px, 5px 11px, gap 5px | 13px/12px pad | 13px, 12px pad | **done:** handoff; sm 11.5px, 4px 10px |
| B4 | Loading width | unchanged | changes | changes | changes without icon | **done:** handoff |
| B5 | Danger hover | not specified | #9b0000 | red-dark | red-dark | **done:** red-dark |

### 2.2 Checkbox: [final page](../components/checkbox.md)

| # | Item | Handoff | Catalogue | POC | Before | Decision |
|---|---|---|---|---|---|---|
| C0 | Element and colour | real input, commit teal, 1.5px border | button role=checkbox, accent blue | handoff | handoff | **done:** handoff |
| C1 | Hit area | 44px minimum on tablet | n/a | 40px | 40px (+24px compact) | **done:** `--checkbox-hit-area` = touch-target min; compact kept |
| C2 | Indeterminate | not specified | yes | no | no | **done:** later, with "Selecteer pagina" |
| C3 | Label size | not specified | 12.5px | inherits | inherits | **done:** inherits from context |

### 2.3 Input: [final page](../components/input.md)

| # | Item | Handoff | Catalogue | POC | Before | Decision |
|---|---|---|---|---|---|---|
| I1 | Hover border | one step darker | #B3BAC5 | n/a | #B3BAC5 | **done:** neutral-50 #C1C7D0 via `--color-input-border-hover` |
| I2 | Disabled | muted surface + disabled ink | ink unchanged | legacy bg | legacy bg | **done:** handoff |
| I3 | Read-only | no border, plain value | yes | no | no | **done:** `readonly` prop |
| I4 | Error message | message below, aria-describedby | role=alert, not linked | caller-rendered | caller-rendered | **done:** `errorMessage` prop, auto-linked |
| I5 | Textarea minimum | 3 rows | free | rows=3 | rows=3 | **done:** `--textarea-min-height` |
| I6 | Variants | one bordered | one | three | three | **done:** keep three on tokens; revisit in filters subtask |
| I7 | Component tokens | — | — | — | literals | **done:** `--text-input`, `--input-padding` |
| I8 | `src/inputStyles.ts` | — | — | — | unused copy | **done:** deleted |

### 2.4 Tooltip: [final page](../components/tooltip.md)

| # | Item | Handoff | Catalogue | POC | Before | Decision |
|---|---|---|---|---|---|---|
| T0 | Surface, delay, a11y | inverted, 300ms, hover+focus, Escape, role=tooltip + describedby | same + shadow | light surface, no delay, no aria | handoff | **done:** handoff |
| T1 | Shadow | none | overlay | overlay | overlay | **done:** removed |
| T2 | Component tokens | — | — | — | literals | **done:** `--text-tooltip`, `--tooltip-padding`, `--radius-tooltip`; delay stays a JS constant |
| T3 | Max width, placement | not specified | top/bottom | auto | 14rem, auto | **done:** keep |

### 2.5 Spinner: [final page](../components/spinner.md)

| # | Item | Handoff | Catalogue | POC | Before | Decision |
|---|---|---|---|---|---|---|
| S0 | Rotation, colour, a11y | .8s, commit teal, container announces | .8s, teal, self role=status | self role=status | handoff | **done:** handoff |
| S1 | On filled buttons | not specified | white track | n/a | current colour | **done:** current colour |
| S2 | Sizes | not specified | 15px default | `dimensions` | `dimensions` | **done:** keep |

### 2.6 Chip and badge: [final page](../components/chip-and-badge.md)

| # | Item | Handoff | Catalogue | POC | Before | Decision |
|---|---|---|---|---|---|---|
| P1 | Chip metrics | 11.5px bold, 2px 8px, 4px | 11.5px bold, 2px 9px | 14px | 14px regular, ~1px 4px | **done:** handoff via `--text-chip`, `--chip-padding` |
| P2 | `lg` size | none | none | yes | yes (comparison columns) | **done:** keep on tokens; revisit in DS 4 |
| P3 | Letter badge | 17px, 10.5px/900, role=img + name | 26px fixed width | no | no | **done:** `shape: "badge"` in pill config |
| P4 | Fallback colour | — | — | slate-800 | slate-800 | **done:** neutral chip tokens |
| P5 | Default relation pill | neutral chip | — | — | hex #d6e2f0/#1f3a5f | **done:** neutral chip tokens |
| P6 | Tone + icon config | — | — | tone replaced the whole config entry | same (bug) | **done:** merged; icon/shape/letter kept |
| P7 | Dropdown chip remove name | "Verwijder {waarde}" | same | value only | value only | **superseded** by D4 (multi select shows a count, no chips) |

### 2.7 Dropdown: [final page](../components/dropdown.md)

| # | Item | Handoff | Catalogue | POC | Before | Decision |
|---|---|---|---|---|---|---|
| D0 | Trigger, popup, option visuals | 5px / 8px + overlay / 12.5px + hover wash | same, popup padding 4px | — | handoff (earlier commit) | **done:** handoff |
| D1 | Search | above 10 options | above 10 | always | always | **done:** library search, only above 10 |
| D2 | "— Geen waarde" | first option in non-required single selects | opt-in | via ✕ only | ✕ only | **done:** leading option when `clearable` |
| D3 | Loading | 3 skeleton rows, aria-busy | same | none | none | **done:** `loading` prop |
| D4 | Multi trigger | "{n} gekozen" + checkboxes | checkboxes | chips | chips | **done:** handoff |
| D5 | Selected option | check, wash on hover only | wash | wash | wash + bold | **done:** check only |
| D6 | Empty list | "Geen opties" | same | library default | library default | **done:** `dropdown.no-options` |
| D7 | Cleanup | — | — | — | console.log, unused `showMenuHeader` | **done:** removed |

## 4. Remaining DS 1 items

| # | Item | Decision |
|---|---|---|
| R1 | Translations for the primitives' copy | **done:** `modules/baseGraphql` branch `feat-165138-redesign` (nl + en) |
| R2 | Client theming wiring | **done:** runtime theme. Colour tokens in each client's app config (`customization.theme`), passed through baseGraphql, applied on `<body>`. No client scopes or names in the PWA. First client migrated; the others move one by one in later phases |
| R3 | AI rules | **done:** `.claude/skills/design-system/SKILL.md` + CLAUDE.md pointer |

Scope note: this branch is DS 1 (tokens, client theming, primitives).
Later subtasks:

| Task | Scope | Rows waiting here |
|---|---|---|
| DS 2 | per-field editing | field-row copy affordance + truncation tooltip, "— Geen waarde" in inline selects, NL keys ("Save block", "Undo") |
| DS 3 | action discovery | split button, overflow menu, selection bar |
| DS 4 | lists, panels, filters, navigation | list screen anatomy per `templates/elody-list-screen`: results in one white panel (surface, border-panel, card radius) with an accent-light header band (title, count chip, sort), flat rows separated by border-faint instead of separate cards, page on surface-app instead of the legacy background-normal; list/table row states (hover = row-hover fill, selected = wash + accent row shadow, preview-active = 3px accent left border; today ListItem has no hover and a 4px dark border when active); FL1–FL3 (stashed filter header), panel/section header size, breadcrumb, nav rail, record stepper; input variants (I6) |
| DS 5 | viewers and flows | media viewport, ViewerToolbar, upload, guided flow |
| DS 6 | backend support | filter option counts (active-count chip), destructive-action flag |
| DS 7 | Storybook + docs | stories, publishing these docs |

## DS 2: per-field editing

| # | Item | Handoff | Catalogue | Decision |
|---|---|---|---|---|
| E1 | Pencil on editable values | appears on hover | always visible, 12px, subtle | **catalogue** (user, 2026-10-07): editability must not depend on hover |
| E2 | Dashed underline | under the value | under the value text only, square ends; none for pills | **catalogue** (user, 2026-10-07) |
| E3 | Inline editor actions | text buttons Bewaar + Annuleer | 26px icon buttons ✓ / ✕ | **handoff** (user, 2026-10-07): text buttons, centred vertically on the input. Bewaar dropped since, see E4 |
| E4 | Commit model | pick-then-Bewaar, "don't auto-save on blur" (also CHANGES.md round 2) | — | **deviation** (user, 2026-10-14): no Bewaar per field; leaving the field (click outside, Tab out) saves a changed value, Enter saves, Annuleer/Esc discard. Also for WYSIWYG |
| E5 | Opening a second field while one is changed | first stays open, nothing saved | — | **deviation** (user, 2026-10-14): the changed field saves first; on failure it stays open with its error and the second doesn't open |
| E6 | Leaving the page with a changed field | (not specified) | — | **done** (2026-10-15): saves without asking, stays when the save fails; the save/discard/stay prompt is only for the page-wide edit mode |
| E7 | Removing a repeatable row | executes at once, undo toast, no confirm | — | **interim** (user, 2026-10-12): a saved row asks for confirmation until undo exists; revisit with `useUndo` |
| E8 | Reordering repeatable rows | drag handle + ↑/↓ | — | **open**: not built (user, 2026-10-12) |
| E9 | Table input fields | a repeatable-row variant, each row its own scope | — | **deviation**: a relation table edits and saves as one scope (diff-only save) |
| E10 | Clicking a value | never navigates | — | **deviation**: a relation chip links to its entity when the client's link formatter names the relation type |
| E11 | Page-level "Bewerk" toggle | removed | — | **deviation** (user, 2026-10-13): opt-in per entity type (`hasEditMetadataButton`), hidden by default; removing the whole-form path is still open |
| E12 | Empty value | "Geen waarde" at 45%, no underline | — | **done**: no underline under an empty value (`underlineValue` in MetadataWrapper) |
| E14 | Undo (`useUndo`: inline chip after a save, toast after a removal) | required | toast after every save | **deferred** (user, 2026-10-15): not now. Annuleer/Esc only discard before a save; after leaving a field there is no one-click way back. E7 (confirm on row removal) stays until undo lands |
| E13 | Feature flag for the new editing (MIGRATION_PLAN risk note) | behind a flag for one release if cataloguers are mid-season | — | **open**: no flag; decide before rolling out to vlacc / VLIZ |
| E15 | Coordinates value | text pair + "Toon op kaart" link | — | **skipped** (user, 2026-10-15): coordinates show as text only |
| E16 | Image value | 48px thumb, click opens the viewer | — | **deferred** (user, 2026-10-15): no image formatter exists and no field needs it yet |
| E17 | Copy affordance | on every value | — | **deviation** (user, 2026-10-15): only on fields configured with `copyToClipboard`, as before, and always visible like the pencil instead of on hover |
| E18 | Group form card (one gesture, one Bewaar/Annuleer, `role="group"`) | required | — | **deferred** (user, 2026-10-15): no config marks a field group yet and no client has one; build it with the first real group (a panel flag in baseGraphql) |
| E19 | Inline editors for file upload and linked-entity fields | required | — | **not applicable** (user, 2026-10-15): upload fields are not panel metadata (they live in upload forms), and values on a list row's entity or relation already edit in place through `ListItemInlineField` |

## DS 3: action discovery

Source: handoff (split-button, overflow-menu, action-discovery, selection-action-bar, IMPLEMENTATION phase 4). The reverted POC branch is not used.

| # | Item | Decision |
|---|---|---|
| A1 | Overflow trigger | secondary (bordered, per specimen) sm `BaseButtonNew` "Acties ⌄/⌃", never a bare ⋮; name "Acties voor {titel}" when the caller passes `contextLabel` (panels pass their title) |
| A2 | Menu behaviour | shared `BaseContextMenu`, so every menu gets it: `role="menu"`, anchored under the trigger when an anchor is passed (pointer position as fallback for not-yet-swept callers), ↑/↓/Home/End, Escape returns focus, Tab closes |
| A3 | Menu look | specimen values as `--menu-*` tokens: card radius, overlay shadow, subtle border, 12.5px, 4px inset, items 6px 10px with button radius, 14px icons, accent-wash hover, disabled ink (not opacity) |
| A5 | Split button | exactly one `showAsButton` action + overflow → one capsule (accent primary + accent chevron, 40% white divider, accent-hover while open); more promoted actions stay separate buttons + "Acties". Promoted buttons move from commit teal to accent primary. Rows name the chevron after their first teaser value |
| A6 | Destructive items | `ActionTone { Default, Danger }` enum + `tone(input:)` on every context-menu action type in baseGraphql (added in DS 3; DS 6 builds on it). Danger items get danger ink and sort last (stable). aicap marks its 12 delete actions |
| A7 | Menu item fit | `--leading-tight` (the body's 1.5 made items ~4px taller than the specimen) and no link underline on hover |
| A9 | 2+ promoted row actions | one primary per entity (user, 2026-10-16): the first `showAsButton` action is the split primary, the other promoted actions move to the top of its menu (danger still last) |
| A10 | Button heights | every `BaseButtonNew` variant gets a 1px border, transparent where not visible (user, 2026-10-16), so primary and secondary line up. Triggers stay `sm` (user: rows stay compact; deliberate deviation from the md specimen) |
| A11 | Disabled with a reason | `BaseButtonNew` with `disabled` + `tooltipLabel` is `aria-disabled` and blocks clicks itself, so the reason is keyboard-reachable (phase 4 item 4) |
| A12 | Sweep (user, 2026-10-16) | filter-panel ⋮ → labelled "Saved searches ⌄" on its own line (shell `triggerLabel`); repeatable "Create new" menu anchored + `aria-haspopup`; aria-labels on nine icon-only actions (record arrows, repeatable/table/overview remove, bulk clear field, upload reset/complete; found live: per-filter clear, search button, repeatable step modal close); squeezed button labels become `sr-only`, promoted labels always shown. Row preview eye became `PreviewToggle` (a real 22px button per lists.card, named, `aria-pressed`), list-row "›" a named button. Kept icon-only on purpose: the row preview eye, the icon-only actions above (well-known glyphs, now named). Left for DS 4: breadcrumb "… n" history toggle (a clickable div, not keyboard-reachable). Not triggers: the upload progress "⋯" separator |
| A13 | Narrow list rows | the labelled trigger (91px vs the old 24px ⋮) was pushed out of rows in narrow columns (mediafiles beside an open preview, 250px) and clipped. List rows now wrap: the text column keeps `--list-row-content-min` (8rem) and the actions drop onto their own line, right-aligned (user, 2026-10-16). Wide rows unchanged. The fixed 250px preview column itself is DS 4 (container tiers) |
| A14 | Selection bar look | specimen anatomy: bordered surface (subtle → default border on selection), 6px 10px padding, 8px gap, 12px; total as a neutral chip (no mint), bold "Selection: n" live text (empty at 0, docs over specimen), "Clear selection" / "Select page" as label-ink underlined link buttons; pager + actions right-aligned. Pager look and moving the total to the list header stay DS 4 (`pagination.md`, `entity-list-element.md`) |
| A4 | Unavailable actions | missing permission → hidden (user, 2026-10-16: no need to show what you may never do). Unavailable because of state (nothing selected, wrong view mode) → visible, disabled, reason in a tooltip |
| A8 | Selection bar | same pattern as rows (user, 2026-10-16, replacing the first "visible row of up to 5"): first primary as split primary, everything else in its menu, "Actions ⌄" without a primary; `role="toolbar"`, count `role="status"`, off-page note, clear/select-page as real buttons; selection actions name the count ("Delete (2 selected)"). Not taken (user): collapse-when-empty, count on the confirm button. Bulk options take the same `tone` (user, 2026-10-16); podiumnet marks its 7 bulk deletes |

## 3. Filters (DS 4)

Already discussed:

| # | Item | Handoff | Catalogue | POC | Now | Decision |
|---|---|---|---|---|---|---|
| FL1 | Section header label | 11.5px bold | 12.5px bold | 11.5px bold | 12.5px bold (uncommitted) | |
| FL2 | Active cue | count chip | 7px accent dot | count chip (always "1", bug) | dot (uncommitted) | |
| FL3 | Chevron | ⌄ closed / ⌃ open | ▾ open / ▸ closed | ⌄ / ⌃ | config icon | |

## DS 4: lists, panels, filters, navigation

| # | Item | Decision |
|---|---|---|
| L1 | List total | moves from the selection bar to a count chip at the start of the list header (`ResultCountChip`), neutral chip, `role="status"`; copy "{n} result(s)" / "{n} resulta(a)t(en)" with singular/plural (handoff wording over the old "items"); capped reveal kept (user, 2026-10-16). Left out of compact basic-mode relation lists, like the rest of the header (mine) |
| L2 | Pager | list footer only (out of the selection bar, and basic-mode lists move it from above the list): page size left as "20 per page", numbered pager right (‹ 1 … 9 10 11 … 63 ›, no first/last arrows), current page in `--color-accent-dark` with white (7:1; the plain accent is 2.9:1). Shown when there is more than one page, in every mode except map, pipeline and grouped tables (user, 2026-10-16). Page size hides while the total fits on the smallest option (mine) |
| L3 | Row states | hover = row-hover fill; selected = accent wash + accent row shadow (checkbox owns it); preview open = 3px accent left border, no wash; the last-previewed row (keepLastActiveItemHighlighted) looks the same as open, but its eye is not pressed; eye pressed = preview open now (new `isPreviewOpenForListItem`); seen = title (first field) in secondary ink, no longer the disabled greyscale; list rows keep the eye while a preview is open and the "›" open button goes (the preview header gets "Open detail page" in step 4) (user, 2026-10-16). `--shadow-accent-row` now derives from `--color-accent` so client themes get their own glow (mine) |
| L4 | Preview panel shell | one panel-shell header for every preview type: title (configured title, else entity title), "Open detail page" (primary rect, only for navigating lists), close × (ghost icon button, named); the deep × on lists inside a preview goes; focus to the header when opened from the eye, back to the row's eye on Escape/×; no focus move when it opens by default (user, 2026-10-16; focus details mine). `--text-panel-title` 14px added for panel titles |
| L5 | Flat rows | per the Lists – Actions specimen (the phase 4 acceptance): list and table rows lose their card border, radius and gap; 7px 8px padding (`--list-row-pad`), 12.5px, faint hairline below. Grid cards unchanged (user: "according to the implementation plan", 2026-10-16). Grid card anatomy and the list column-header row are phase 4 item 5, next |
| L6 | List column-header row | phase 4 item 5: list mode gets one header row when all rows on the page share their fields; cells keep their labels for screen readers only; labels are positioned over the first row's measured cells (the row's actions width varies, so a copied layout can't align); mixed lists and edit mode keep per-cell labels (user, 2026-10-16; measuring mine) |
| L7 | Grid cards | phase 4 item 5: fixed 300×350, 300×220 muted media area with the letterboxed full image (was a square crop), translated no-media placeholder for every card without an image (non-media entities showed nothing), checkbox/actions overlaid on the media area, body = title (13px bold, 2 lines) + badges + one secondary line (user, 2026-10-16) |
| L8 | Empty selection bar | after L1/L2 a list without bulk actions showed an empty bordered bar; it now hides when it has nothing to offer (mine, regression fix) |
| L9 | Container tiers | the main split already followed the handoff (500/630/830/1024 → 40/35/30/25, stacked below 500); the "fixed 250px" column from A13 is the 35% tier of a 636px detail column. Nested splits (inside a preview) used 450/550/755 without a 30% step; now the same tiers (user, 2026-10-16) |
| L10 | Pager placement (revises L2) | the handoff's `pagination.md` puts page size and pager in a list footer; `templates/elody-list-screen` puts them in the results header next to the count and sort. User chose the template (2026-10-19): pager after the count chip, page size before sort, no list footer; lists with a disabled library bar keep the pager above the list. The numbered pager and "20 per page" copy from L2 stay |
| L11 | Results band (template) | user, 2026-10-19: follow `templates/elody-list-screen` for the pager look (« ‹ page [n] of N › » with a page box, first/last arrows; numbered pages from L2 dropped) and page size ("Items: 20"); count, pager, view modes (not in the template), page size, sort and the selection bar's contents in one accent-light band that wraps when narrow ("everything in one row"). The selection bar loses its own border/padding; the count chip is white with accent ink as in the template. The list below is not yet joined to the band in one white panel |
| L12 | aicap UI kit | user, 2026-10-19, from `ui_kits/clients/aicap.html` (a third source; it differs from the template L11 followed): one white results panel holding the band, a selection row (bar moved back out of the band) and the list; the page's own create action (`createEntity`) as a pill next to the page title; list header row with select-all, labels and "Actions", sticky; sort direction as one toggle button. Kept from before: view switch and "Items: 20" in the band (not in the kit), the selection bar's split-button actions (the kit shows flat disabled buttons; DS 3 decided the split button) and "Selection: n" empty at 0 (A14; the kit reads "nothing selected") |
| L13 | Selection row | user, 2026-10-19: the list's selection row shows its actions as separate buttons, disabled until they apply (as in `ui_kits/clients`), instead of the split button (revises DS 3 for this row only; rows keep the split button); no "Select page" link (the header checkbox does it); "Clear selection" only when items are selected on other pages (mine: otherwise those can't be cleared) |
| L14 | Selection row label, view switch | user, 2026-10-19 (seen live): "Selection: nothing selected" at 0 (revises A14's empty-at-0) with the actions right after it, not right-aligned; view switch as one segmented capsule of real, named icon buttons (was clickable divs without names), active in accent wash. Fix: unticking the header select-all now refreshes the row checkboxes |
| L15 | No selection actions | user, 2026-10-19: no "Selection: nothing selected" when the list has no action that acts on a selection. Root fix in `hasBulkOperationsWithItemsSelection`: create plus select-nothing actions (e.g. "Export all entities") no longer count as selection actions, so such lists also lose row checkboxes and select-all (aicap inscriptions; mediafiles already had none) |
| L16 | Row and band sizes | user, 2026-10-19 (rows looked bigger than the rest): row padding and type already matched (7px 8px, 12.5–13px); the height came from the 40px default checkbox, so list and table rows use `size="compact"` (rows 37px single-line). Band controls all 32px: view switch 30px buttons + border, sort toggle md with `min-h-8` |
| L17 | Row hover | user, 2026-10-19: no underline on row text on hover (not in any spec). Navigating rows are `router-link`s and picked up the base `a:hover` underline and link colour; the list and table row wrappers now keep their text colour and no underline; hover stays the row-hover fill |
