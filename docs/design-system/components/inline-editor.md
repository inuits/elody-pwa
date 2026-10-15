# Inline editor

The input a field row swaps to while one field is being edited. Implemented by
`src/components/metadata/InlineFieldEditor.vue`, opened and saved by
`MetadataWrapper.vue`. Part of
[per-field editing](../patterns/per-field-editing.md).

## When to use
Only through a field row (or a group card). It is never mounted on its own
and never in a modal.

## Anatomy
The input for the field type, then **Annuleer** (ghost button, `sm`) inline
on the right, vertically centred on the input. There is no Bewaar: leaving
the field saves it. Inputs take the row's width; a checkbox is only as wide
as its box, so Annuleer sits right after it. A dropdown keeps its options'
width; where Annuleer doesn't fit beside it (a narrow window), it wraps below
it. While saving, a spinner sits before Annuleer.

Under the editor:
- the error message, when there is one;
- a keyboard hint ("Enter bewaart · Esc annuleert", or
  "Ctrl+Enter bewaart · Esc annuleert" for a textarea).

## Inputs per field type
| Field type | Input |
|---|---|
| text, number, date | [input](./input.md) (bordered) |
| textarea, resizable textarea | input in textarea mode |
| checkbox | [checkbox](./checkbox.md) |
| dropdown, metadata single / multi select | [dropdown](./dropdown.md), clearable ("— Geen waarde") unless required, multiple for multi-selects |
| coordinates | two number inputs, Latitude and Longitude; both or neither, latitude within -90…90, longitude within -180…180; emptying both clears the value |
| relation single / multi select | the relation autocomplete, with its value inputs when the field has metadata on the relation (for example a page number) |
| relation table | the table with its rows editable: add a row, change a cell, remove a row. Saving sends only the added, changed and removed relations; a row with no entity chosen is left out, and every visible cell validates first |

Rich text has its own editor on the [WYSIWYG field](./wysiwyg-field.md).
Relation dropdowns edit in place only when they save as the entity's own
relations: not when they save as metadata, belong to a linked entity or are
inherited. Multilingual fields and metadata-on-relation fields shown as their
own rows don't have an inline editor yet. They stay read-only in place.

A field in a repeatable panel (ISBN, EAN, …) edits in its own row: each row
has its own scope, and saving sends the panel's whole stored list (one key,
for example `isbn_group`) with that one value changed. Keys a row has but no
field shows are kept. An "Add more" pill in the panel header adds an empty row; you
click the field to fill in. The row is saved with its first saved field and
is left out of every other save until then. "Add more" is always shown and
always adds a row at the bottom, so several rows can be unsaved at once; the
focus moves to the new row's first field. Saved rows stay on top in their
stored order: a row that saves moves up to right after the saved rows. An unsaved row's trash button just takes it away. A saved row's trash button
asks for confirmation (there is no undo yet), then saves the list without
it. Each removable row is headed by its number and the trash button,
centred between two rules (`──── ISBN 2 🗑 ────`), which also separates
the rows (no extra separator line). A row's fields keep their full width side by side. A lone empty row (a panel without values) has no line. Rows are not reordered.

## States
| State | Cue |
|---|---|
| pristine | leaving closes the editor |
| dirty | leaving saves |
| saving | spinner before Annuleer, input locked |
| error | danger border + message below (`role="alert"`), value kept, editor stays open |
| saved | editor closes, the "entity updated" notification shows (as after the whole-form save), "Opgeslagen" announced, focus back on the value unless it has moved on (Tab, another field) |

## Behaviour and keyboard
- **Save on leave:** choosing in a select or date picker only changes the
  draft. The value saves when you leave the field (click elsewhere or Tab
  out) or press Enter.
- Enter commits (Ctrl+Enter in a textarea). Enter with nothing changed just
  closes. An Enter that picks an option in a select's menu only picks it.
- Escape cancels and restores the previous value. An Escape that closes a
  menu only closes the menu.
- Enter and Escape also work after picking in a dropdown, when focus has
  left the editor: while the editor is open it listens on the page, ignoring
  keys typed in other fields and leaving Enter/Escape to a menu that is
  still open.
- Leaving (a click outside, or focus moving outside): an unchanged editor
  closes, a changed one saves. Clicks and focus inside the editor's own menus
  and dialogs (dropdown, date picker, the "create new" confirmation) count as
  inside, and so does focus going nowhere (a picked option removed, another
  window).
- Opening another field saves the changed one first. If that save fails (an
  invalid value, a server error) the changed field stays open with its
  error, focused, and the other field doesn't open. Leaving and opening at
  once send one save, not two. Clicking several fields while it saves opens
  only the last one.
- The input gets focus when the editor opens. After save or cancel, focus
  returns to the value.
- Saving sends **only this field's key** and validates **only this field**,
  with its usual rules. An invalid value is never sent.
- A field whose config sets `valueAsList` is always saved as a list, even
  from a single-select (a cleared value as an empty list), for backends that
  store the key as an array. A value on a list row's relation without that
  flag follows the shape the relation already stores.
- **Relations:** saving sends only the relations that were added, removed or
  changed (a changed value on the relation, such as a page number, including
  clearing it). Relations that stay as they were aren't sent. The field's
  relation rules (required relation, minimum/maximum, one of several types)
  run on the relations as they would be after the save.
- After a save, the page takes the entity the server returned, so every value
  shown from it is current.
- Leaving the page, or moving to another record, with a changed editor saves
  it, without asking. Leaving only happens after a save that worked; when it
  fails, you stay on the page with the error.

## Accessibility
- The input is named after the field label.
- An error sets `aria-invalid` and links the message with `aria-describedby`.
  The message is `role="alert"`.
- A successful save is announced through a `role="status"` region.

## Copy
| Key | NL | EN fallback |
|---|---|---|
| `inline-edit.cancel` | Annuleer | Cancel |
| `inline-edit.hint` | Enter bewaart · Esc annuleert | Enter saves · Esc cancels |
| `inline-edit.hint-textarea` | Ctrl+Enter bewaart · Esc annuleert | Ctrl+Enter saves · Esc cancels |
| `inline-edit.saved` | Opgeslagen | Saved |
| `inline-edit.save-failed` | Opslaan mislukt, probeer opnieuw | Saving failed, try again |

## Implementation
- `InlineFieldEditor.vue` is presentational. It emits `save(value)`,
  `cancel`, `dirty-change` and `draft-change`.
- `MetadataWrapper.vue` validates the field (its vee-validate field), builds
  the payload with `buildMetadataInput` and saves with `saveScope`
  (`src/composables/useScopedSave.ts`).
- The leave prompt is `decideLeave` (`src/composables/useLeaveGuard.ts`).

Tests: `InlineFieldEditor.test.ts`, `MetadataWrapper.test.ts`,
`useScopedSave.test.ts`, `useLeaveGuard.test.ts`, `useEditScope.test.ts`.
