# Selection bar

Bulk actions on a list's selection. Implemented by
`src/components/bulk-operations/BulkOperationsActionsBar.vue` (the bar) and
`src/components/ActionMenuGroup.vue` (its action row).

## When to use
Above every list that supports selection. Not for single-row actions: those
use the row's split button or "Actions" menu ([menu](./menu.md)).

## Anatomy
- Left: the count chip ("2/40 items selected"), the clear and select-page
  links (real buttons), and a note when selected items sit on other pages
  ("3 selected on other pages").
- Right: the action row. Primary actions (`primary`, or the active
  `primaryFallback`) as accent primary buttons, then the other actions as
  labelled secondary buttons, at most five buttons in total. The rest go into
  a labelled "More actions ⌄" menu. Never a bare ⋮.
- Picker contexts swap the row for the commit-teal "Confirm selection".

## States
| State | Cue |
|---|---|
| action unavailable (needs a selection, wrong view mode, selection constraint) | button stays visible, disabled, reason in its tooltip |
| items selected | count chip shows "n/total", clear link appears |
| selection spans pages | off-page note |
| permission missing | action not shown at all |

## Accessibility
- The bar is `role="toolbar"` named "Actions on selection".
- The count is `role="status"`, so changes are announced.
- An action that needs a selection carries the count in its accessible
  name: "Delete (2 selected)".
- Overflow trigger: `aria-haspopup="menu"`, `aria-expanded`; the menu opens
  under it.
- shortcut: the toolbar has no arrow-key (roving tabindex) navigation; every
  control is reachable with Tab. Add it if users ask for keyboard speed.

## Content
Verb-first action labels from the bulk operation config.
