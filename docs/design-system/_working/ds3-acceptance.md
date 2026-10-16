# DS 3 (#165144) acceptance: action discovery

Checked 2026-10-16 against implementation plan phase 4 (items 4, 6, 8) and
`specimens/Components - Lists - Actions.dc.html`, live on the aicap client
(inscriptions overview and inscription detail). Decisions: `decisions.md` A1–A12.

## Phase 4 items owned by DS 3

| Item | Requirement | Status |
|---|---|---|
| 4 | Labelled split button; never a bare ⋮; labelled overflow triggers | ✅ rows, panels, page header, selection bar, filter panel |
| 4 | Disabled items stay in the menu with their reason (`aria-disabled`) | ✅ menu items and buttons disabled with a reason stay focusable. Actions without permission are hidden on purpose (A4) |
| 4 | Destructive items: schema flag, danger ink, sorted last | ✅ `tone: Danger` on context-menu actions and bulk options |
| 4 | One submenu level at most | ✅ menus are flat; the bulk "open dropdown" sub-list is one level |
| 6 | Count `role="status"` | ✅ |
| 6 | Select page, capped-count reveal, confirm-selection mode | ✅ existed; "select page" and "undo selection" are now real buttons |
| 6 | Collapsed-empty variant | ➖ not taken (user decision) |
| 8 | Specimen matches | ✅ with the deviations below |
| 8 | Every menu action reachable and labelled | ✅ keyboard pass below |

## Specimen deviations

| # | Specimen | Implementation | Why |
|---|---|---|---|
| D1 | md triggers (12px, 6px 14px) | sm (11.5px, 4px 10px) | dense rows (A10) |
| D2 | ▾ chevron | ⌄ closed / ⌃ open | the design system's chevron pair |
| D3 | "Acties" trigger in label-blue ink | body ink (secondary button) | open: switch the trigger ink if wanted |
| D4 | text-only menu items | 14px icon + text | `split-button.md` anatomy lists 14px icons |
| D5 | disabled item explains itself via `title` | help icon with tooltip | existing tooltip pattern, keyboard-reachable |
| D6 | selection bar: visible bulk buttons + "Wis selectie" | split button like rows; "undo selection" link | user decision (A8) |
| D7 | "Selectie: 2" | "1/1,258 items selected" | existing copy, not in scope |
| D8 | name "Verwijder 2 records" | "Delete (2 selected)" | generic, entity-type independent |

## Keyboard pass (real key events)

| Screen | Trigger (accessible name) | Enter opens, `aria-expanded` | Focus on first item | ↓ moves | Escape closes, focus back |
|---|---|---|---|---|---|
| Inscriptions overview | More actions (bar chevron) | ✅ | ✅ | ✅ | ✅ |
| Inscription detail | More actions (mediafiles bar chevron) | ✅ | ✅ | ✅ | ✅ |
| Inscription detail | Actions for file_example_TIFF_5MB.jpeg (row) | ✅ | ✅ | ✅ | ✅ |

Unnamed buttons: none left on the overview. On the detail page, four remain,
all in the image viewer (see below).

## Found, out of DS 3 scope

- DS 4 (#165146): breadcrumb "… n" history toggle is a clickable `div`, not
  keyboard-reachable. List item rows differ from the specimen (row states,
  grid cards, list mode).
- DS 5 (#165148): image viewer buttons without an accessible name: recrop,
  IIIF operations, one unlabelled toolbar button, recrop modal close.

## Not verified live

- "Saved searches" trigger (aicap has no saved searches).
- Split button on a list row (no aicap row has a promoted action).
- Destructive bulk actions in the selection bar (aicap has none; podiumnet is
  marked but not run).
