# Selection bar

Bulk actions on a list's selection. Implemented by
`src/components/bulk-operations/BulkOperationsActionsBar.vue` (the bar) and
`src/components/ActionMenuGroup.vue` (its action row). The list total is
not here: it is the list header count chip ([entity list](./entity-list.md)).

## When to use
Above every list that supports selection. Not for single-row actions: those
use the row's split button or "Actions" menu ([menu](./menu.md)).

## Anatomy
A row of its own under the list's results band, inside the results panel
([entity list](./entity-list.md)): `--list-band-pad` sides, hairline below,
no surface of its own. `--selection-bar-gap`, `--text-ui`. Items wrap when narrow.
- Left: the bold selection count ("Selection: 2", hidden at 0) and, when
  selected items sit on other pages, a note ("3 selected on other pages")
  with a "Clear selection" link (label ink, `--text-label`, underlined).
  Selecting or clearing the page is the list header's checkbox, so there is
  no "Select page" link.
- Right (`ActionMenuGroup` `flat`, `ui_kits/clients`): every action as its
  own secondary sm button, disabled with its reason (tooltip) until it
  applies, destructive (`tone: Danger`) last in danger ink. Actions that open
  a sub-menu (`OpenDropdown`) stay behind the labelled "Actions ⌄" trigger.
  Rows and other places keep the split button.
- Picker contexts swap the row for the commit-teal "Confirm selection".
- The page's own list (not a relation list or search) moves its
  `createEntity` action out of the bar into a primary pill next to the page
  title (`TheHeader` `#page-header-create`, via `Teleport`), as in
  `ui_kits/clients`. It fires the same bulk-operation handler.

## States
Hidden (`v-show`) when it has nothing to offer: no selection, no "Select
page", no actions.

| State | Cue |
|---|---|
| action unavailable (needs a selection, wrong view mode, selection constraint) | button stays visible, disabled, reason in its tooltip |
| items selected | "Selection: n" appears, clear link appears |
| selection spans pages | off-page note |
| permission missing | action not shown at all |

## Accessibility
- The bar is `role="toolbar"` named "Actions on selection".
- The count is `role="status"`, so changes are announced.
- An action that needs a selection carries the count in its accessible
  name: "Delete (2 selected)".
- Chevron or "Actions" trigger: `aria-haspopup="menu"`, `aria-expanded`;
  the menu opens under it.
- shortcut: the toolbar has no arrow-key (roving tabindex) navigation; every
  control is reachable with Tab. Add it if users ask for keyboard speed.

## Content
Verb-first action labels from the bulk operation config.
