# Field row

One metadata field on a detail page: label above value, editable in place.
Implemented by `src/components/metadata/MetadataWrapper.vue` (with
`MetadataTitle.vue` for the label). Part of
[per-field editing](../patterns/per-field-editing.md).

## When to use
Every single-valued metadata field and every relation field on a detail page.
Interdependent fields use the group form card; repeating values use the
repeatable row group.

## Anatomy
- **Label line:** the label, then its adornments in this order:
  - required `*`, or the one-of-required `◦` (named by the rule);
  - help `?`, 14px, so it doesn't outgrow the label (the pencil is 12px);
  - locale chip (multilingual fields).
- **Value:** the rendered value. When it is editable in place:
  - a dashed underline under the value text, with square ends. Chip values
    (dropdowns, pills) have no underline, since their shape already marks them;
  - a pencil on the right, always visible, so editability never depends on
    hovering;
  - a hover wash behind the whole value. The wash extends
    `--field-value-pad-x` beyond the text on both sides, while the text stays
    aligned with the label. A read-only dropdown display is transparent, so
    the wash shows through it.
- Text values, chip values and read-only values all share the same minimum
  row height, so rows line up whatever the field type.

## Tokens
| Token | Role |
|---|---|
| `--text-label`, `--color-text-field-label` | label |
| `--color-danger` | required marker |
| `--text-value`, `--color-text-secondary` | value |
| `--color-border-dashed` | editable underline |
| `--color-surface-editable-hover` | hover wash |
| `--field-value-pad-x` | how far the wash extends beyond the value |
| `--field-value-min-height` | minimum height of every value row, text or chips |
| `--color-text-subtle` | pencil |
| `--opacity-empty` | empty value ("Geen waarde") |

## When a value is editable in place
All of these must hold (`fieldEditability.ts`):
- the field type has an inline editor:
  - text, number, date, textarea;
  - checkbox, dropdown;
  - metadata dropdowns;
- the field isn't marked non-editable or read-only for the user;
- it isn't locked or masked;
- the user may update the entity;
- it isn't multilingual, metadata on a relation, or part of a repeatable
  panel (these get their own editors later);
- the legacy page-wide edit mode is off. Its "Bewerk metadata" button is
  hidden, so this only matters for flows that still switch it on themselves
  (create forms, the multi-entity view).

Anything else renders as plain text, with no button role and no hover cue.

## States
| State | Cue |
|---|---|
| resting | dashed underline under the text + pencil |
| hover | wash behind the value |
| focus | the global focus ring |
| empty | "Geen waarde" at `--opacity-empty` |
| read-only | plain value, no underline, no hover |
| editing | the [inline editor](./inline-editor.md) replaces the value |

## Behaviour and keyboard
- Click, Enter or Space on an editable value opens its edit scope.
- Only one scope edits at a time. If another scope is open and unchanged, it
  closes. If it has changes, it stays open and gets focus back. Nothing is
  saved or discarded implicitly.

## Accessibility
- An editable value is `role="button"`, focusable, named "{label}, bewerken".
- The pencil is decorative (`aria-hidden`).
- The required `*` and the one-of marker are part of the label line. The
  one-of marker has an accessible name.

## Copy
| Key | NL | EN fallback |
|---|---|---|
| `inline-edit.edit-field` | bewerken | edit |
| `metadata.labels.one-of-required` | (existing) | |

## Implementation
`MetadataWrapper.vue` decides editability and opens the scope through
`useEditScope` (`src/composables/useEditScope.ts`). Tests:
`src/components/metadata/tests/MetadataWrapper.test.ts`,
`MetadataTitle.test.ts`, `fieldEditability.test.ts`.
