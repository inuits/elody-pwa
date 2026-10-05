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
| F1 | `--color-text-link` | #355BA9 (= label blue) | #1D4ED8 | #355BA9 | #355BA9 || **done:** #355BA9; legacy #1D4ED8 removed |
| F2 | Layout tokens (`--filter-panel-width`, `--nav-rail-width`, `--touch-target-min`, `--page-pad`, gutters) | not defined | defined | not defined | defined || **done:** already defined (composite tokens) |
| F3 | Font-weight tokens (`--weight-regular/bold/black`), `--font-mono` | not defined | defined | not defined | defined || **done:** keep |
| F4 | vlacc badge aliases (`--badge-work/expression/manifestation`) | no (tones only; W/E/M is vlacc's mapping) | yes | no | no || **done:** no aliases; mapping lives in config |
| F5 | Spacing scale `--spacing-*` | defined (2px steps) | defined | not imported (would override Tailwind `p-1`, `gap-2`…) | not imported || **done:** not imported; exact spacing via component tokens |
| F6 | `--color-commit-hover` | mint #6BC6B3 in tokens, #0A9AA3 in specimen | #0A9AA3 | n/a | buttons use #0A9AA3 || **done:** #0A9AA3; `--color-commit-strong-hover` merged into it |

### 1.2 Contrast (WCAG AA, 4.5:1 for text)

Both sources claim "all badge text/background pairs ≥ 4.5:1". Measured:

| # | Pair | Ratio | Passes | Proposal | Decision |
|---|---|---|---|---|---|
| F7 | Badge tone1 #15803d on #DAF1DC | 4.20 | no | text #166534 → 5.97 || **done:** #166534 |
| F8 | Badge tone3 #B95000 on #FDEBD7 | 4.28 | no | text #9A4300 → 5.68 || **done:** #9A4300 |
| F9 | Relation chip white on #6DBBDE | 2.14 | **no** | darker chip bg, or dark text || **open:** compare both options in the browser |
| — | Badge tone2 #355BA9 on #C8EAF7 | 5.14 | yes | — | |
| — | Subtype #505F79 on #E8EEF0 | 5.51 | yes | — | |
| — | Link #355BA9 on white | 6.52 | yes | — | |
| — | Placeholder #9CA3AF on white | 2.54 | n/a (placeholder) | keep, never sole label | |

### 1.3 Ground rules

| # | Rule | Handoff | Catalogue | Decision |
|---|---|---|---|---|
| F10 | Fixed elements | exactly two: 52px rail + detail header | rail + white top bar (+ fixed toast) || **done:** handoff |
| F11 | Pill radius | 14px only | "14–16px" (token 14px) || **done:** 14px |
| F12 | Focus ring | 2px commit teal, 1px offset, `:focus-visible` | 1–2px, inset where flush || **done:** handoff (already built) |
| F13 | Confirm dialogs | only for true unrecoverable loss | only for entity deletion || **done:** handoff |
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

Scope note: this branch is DS 1 (tokens, client theming, primitives).
Later subtasks:

| Task | Scope | Rows waiting here |
|---|---|---|
| DS 2 | per-field editing | field-row copy affordance + truncation tooltip, "— Geen waarde" in inline selects, NL keys ("Save block", "Undo") |
| DS 3 | action discovery | split button, overflow menu, selection bar |
| DS 4 | lists, panels, filters, navigation | FL1–FL3 (stashed filter header), panel/section header size, breadcrumb, nav rail, record stepper; input variants (I6) |
| DS 5 | viewers and flows | media viewport, ViewerToolbar, upload, guided flow |
| DS 6 | backend support | filter option counts (active-count chip), destructive-action flag |
| DS 7 | Storybook + docs | stories, publishing these docs |

## 3. Filters (DS 4)

Already discussed:

| # | Item | Handoff | Catalogue | POC | Now | Decision |
|---|---|---|---|---|---|---|
| FL1 | Section header label | 11.5px bold | 12.5px bold | 11.5px bold | 12.5px bold (uncommitted) | |
| FL2 | Active cue | count chip | 7px accent dot | count chip (always "1", bug) | dot (uncommitted) | |
| FL3 | Chevron | ⌄ closed / ⌃ open | ▾ open / ▸ closed | ⌄ / ⌃ | config icon | |
