# Principles

Rules every screen and component follows.

## Shape encodes role
- **Pill** (`--radius-pill`) starts something that is safe and reversible: add,
  search, breadcrumb, stepper.
- **Rectangle** (`--radius-input` / `--radius-button`) executes immediately:
  Bewaar, Open record.
- Never put a pill on an action that changes data.

## Two elevation levels
Cards: 1px border, no shadow. Overlays (menus, listboxes, popovers, modals,
toasts): shadow. There is no third level, and a card never gets a shadow.

## Three chrome layers at most
Panel → block heading → rows. Never nest another bordered box inside a block.

## Two fixed elements
Only the 52px navigation rail and the detail header (breadcrumb, record
stepper, actions) are fixed. Nothing else sticks or floats over content,
except overlays.

## Commit teal is platform-fixed
Commit actions, checks, spinners and the focus ring use commit teal on every
client. Client themes change only the accent (see [theming](./theming.md)).

## Confirm only real loss
A confirmation dialog appears only for true, unrecoverable loss. Everything
reversible executes immediately and offers undo:
- an **inline undo chip** next to the value after a save, alive until the next
  action;
- an **undo toast** after a removal, when there is no value left to attach to.

## Choosing never saves
Picking in a select, date picker or autocomplete only changes the draft.
Saving is always an explicit Bewaar, so every editor behaves the same way.

## Empty is "Geen waarde"
An empty value reads "Geen waarde" / "No value" at `--opacity-empty`. Never
show "-" or a blank.

## Copy
Dutch first, sentence case, verbs on buttons ("Bewaar", "Voeg persoon toe").
NL and EN strings live in the i18n files, never inline in components.

## Open by design
Not part of the system yet. When a screen needs one of these, keep it text-only:
final icon set (Unicons is the interim), empty-state illustrations,
data-visualisation palette, dark mode.
