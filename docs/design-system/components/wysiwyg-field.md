# WYSIWYG field

A rich-text field (`WysiwygElement`), edited in place as a whole.
Implemented by `src/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue`
with `WYSIWYGInPlaceActions.vue` and `src/composables/useWysiwygInPlaceEditing.ts`.
Part of per-field editing.

## When to use
Long, formatted text: descriptions, transcriptions, comments. Short plain text
uses the [field row](./field-row.md) with the [inline editor](./inline-editor.md).

## Anatomy
- **Label line:**
  - the label and its adornments (help `?`, info panel);
  - the virtual keyboard toggle (while editing, when the field has layouts);
  - the transliteration toggle (at rest only);
  - the language picker, or the language being edited as a chip;
  - the actions: a pencil at rest, Bewaar and Annuleer while editing.

  The actions sit on the label line, not under the content, so they stay in
  view however long the text is.
- **Toolbar** (while editing): the formatting and tagging buttons the field's
  extensions provide.
- **Content:** the editor, bordered at rest and while editing.
- **Under the content** (while editing): the error message, when there is one,
  and the keyboard hint.

## States
| State | Cue |
|---|---|
| resting, editable | pencil on the label line; hover wash on the content |
| resting, read-only | content only, no pencil |
| editing, pristine | toolbar, Bewaar disabled |
| editing, dirty | Bewaar enabled |
| saving | spinner in Bewaar, both buttons locked |
| error | message below (`role="alert"`), content kept, editor stays open |
| saved | editor read-only again, "Opgeslagen" announced |

## Behaviour and keyboard
- The pencil, or a click on the content, opens editing. A click on a tagged
  entity still opens its detail, and selecting text doesn't open editing.
- Enter is a new line. **Ctrl/Cmd+Enter** saves, **Escape** cancels and
  restores the previous content. An Escape that closes a tag suggestion, or a
  key pressed in a tagging dialog, belongs to that and doesn't cancel.
- Clicking outside: an unchanged editor closes, a changed one stays open.
  The field's own menus and dialogs (tag suggestions, tag modal, context menu,
  language picker) count as inside.
- **Multilingual:** the edit covers the selected language only. The language
  picker is replaced by a chip naming that language until the edit is saved
  or cancelled. Saving sends the value with its `lang`.
- **Transliteration** only transforms the view. It is hidden while editing,
  and editing starts from the stored text.
- Saving sends **only this field's key**. WYSIWYG fields have no validation
  rules of their own.
- Only one field edits at a time, and leaving the page with a changed editor
  shows the unsaved-changes prompt, as for any field row.

## Tokens
| Token | Role |
|---|---|
| `--color-border-default`, `--radius-input` | editor border |
| `--color-surface-editable-hover` | hover wash on editable content and the pencil |
| `--color-text-subtle` | pencil, the same as a field row's |
| `--text-hint`, `--color-text-muted` | keyboard hint |
| `--color-danger` | error message |
| `--color-chip-neutral-*`, `--chip-padding` | language chip while editing |

## Accessibility
- The pencil is a button named "{label}, bewerken".
- A successful save is announced through a `role="status"` region; an error
  is `role="alert"`.

## Copy
Uses the `inline-edit.*` keys of the [inline editor](./inline-editor.md)
(`save`, `cancel`, `edit-field`, `hint-textarea`, `saved`, `save-failed`).

Tests: `useWysiwygInPlaceEditing.test.ts`, `EntityElementWYSIWYG.inPlace.test.ts`,
`WYSIWYGInPlaceActions.test.ts`, `WYSIWYGButtons.test.ts`.
