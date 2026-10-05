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

Scope note: this branch is subtask 1 of the epic (tokens + primitives). The
Filters section below belongs to a later subtask.

## 3. Filters (later subtask)

Already discussed:

| # | Item | Handoff | Catalogue | POC | Now | Decision |
|---|---|---|---|---|---|---|
| FL1 | Section header label | 11.5px bold | 12.5px bold | 11.5px bold | 12.5px bold (uncommitted) | |
| FL2 | Active cue | count chip | 7px accent dot | count chip (always "1", bug) | dot (uncommitted) | |
| FL3 | Chevron | ⌄ closed / ⌃ open | ▾ open / ▸ closed | ⌄ / ⌃ | config icon | |
