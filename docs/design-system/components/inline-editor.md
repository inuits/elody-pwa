# Inline editor

The input a field row swaps to while one field is being edited. Implemented by
`src/components/metadata/InlineFieldEditor.vue`, opened and saved by
`MetadataWrapper.vue`. Part of
[per-field editing](../patterns/per-field-editing.md).

## When to use
Only through a field row (or a group card). It is never mounted on its own
and never in a modal.

## Anatomy
The input for the field type, then the actions inline on the right,
vertically centred on the input:
- **Bewaar:** commit button, `sm`;
- **Annuleer:** ghost button, `sm`.

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
| relation single / multi select | the relation autocomplete, with its value inputs when the field has metadata on the relation (for example a page number) |

Rich text has its own editor on the [WYSIWYG field](./wysiwyg-field.md).
Relation dropdowns edit in place only when they save as the entity's own
relations: not when they save as metadata, belong to a linked entity or are
inherited. Multilingual fields, metadata-on-relation fields shown as their own
rows, and repeatable-panel fields don't have an inline editor yet. They stay
read-only in place.

## States
| State | Cue |
|---|---|
| pristine | Bewaar disabled |
| dirty | Bewaar enabled |
| saving | spinner in Bewaar, input locked |
| error | danger border + message below (`role="alert"`), value kept, editor stays open |
| saved | editor closes, "Opgeslagen" announced, focus back on the value |

## Behaviour and keyboard
- **Pick-then-Bewaar:** choosing in a select or date picker only changes the
  draft. Nothing saves until Bewaar or Enter.
- Enter commits (Ctrl+Enter in a textarea). Enter with nothing changed just
  closes. An Enter that picks an option in a select's menu only picks it.
- Escape cancels and restores the previous value. An Escape that closes a
  menu only closes the menu.
- Clicking outside: an unchanged editor closes, a changed one stays open.
  Clicks inside the editor's own menus and dialogs (dropdown, date picker,
  the "create new" confirmation) count as inside.
- The input gets focus when the editor opens. After save or cancel, focus
  returns to the value.
- Saving sends **only this field's key** and validates **only this field**,
  with its usual rules. An invalid value is never sent.
- **Relations:** saving sends only the relations that were added, removed or
  changed (a changed value on the relation, such as a page number, including
  clearing it). Relations that stay as they were aren't sent. The field's
  relation rules (required relation, minimum/maximum, one of several types)
  run on the relations as they would be after the save.
- After a save, the page takes the entity the server returned, so every value
  shown from it is current.
- Leaving the page, or moving to another record, with a changed editor shows
  the unsaved-changes prompt: save, discard or stay. Leaving only happens
  after a save that worked.

## Accessibility
- The input is named after the field label.
- An error sets `aria-invalid` and links the message with `aria-describedby`.
  The message is `role="alert"`.
- A successful save is announced through a `role="status"` region.

## Copy
| Key | NL | EN fallback |
|---|---|---|
| `inline-edit.save` | Bewaar | Save |
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
