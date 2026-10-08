# Checkbox

Selects or deselects one item. Implemented by
`src/components/base/BaseInputCheckbox.vue`.
The box's classes live in `src/components/base/checkboxStyles.ts`
(`CHECKBOX_BOX_CLASSES`), shared with the checkboxes in a multi-select
dropdown's options, so both look the same.

## When to use
- Selecting rows or items, including bulk selection, and options in a
  multi-choice list or filter.
- Yes/no form values.
- Not for exclusive choices. Use a toggle group or a dropdown.
- Not for actions. A checkbox changes selection or a draft value, never saves
  by itself.

## Anatomy
A real checkbox inside a hit area, followed by an optional label. A required
item shows a warning icon after the label, with the "required" tooltip.

## Tokens
| Token | Role |
|---|---|
| `--checkbox-hit-area` | hit area (default: the touch-target minimum) |
| `--checkbox-hit-area-compact` | hit area in dense lists |
| `--border-width-control` | box outline |
| `--color-commit` | check and checked border |
| `--color-text-disabled`, `--color-border-subtle` | disabled |

## Sizes
`size`:
- `default`: the hit area meets `--touch-target-min`. Use it for row
  selection and forms.
- `compact`: a smaller hit area and a steady label gap that doesn't shift
  when checked. Use it for dense option lists such as filters.

## States
| State | Cue |
|---|---|
| unchecked | neutral outline |
| checked | commit-teal check and border |
| focus | the global focus ring |
| disabled | muted outline, no pointer |
| required | always checked, cannot be unchecked, warning icon with tooltip |
| limit reached | disabled when the bulk-selection limit is reached and it isn't selected |

The selected *row* gets its wash and accent shadow from the list item, not
from the checkbox.

## Behaviour and keyboard
- Space toggles the checkbox. Clicking the box, the hit area or the label
  toggles it too.
- A click never reaches the surrounding row, so selecting never opens the
  item.
- Outside of `ignoreBulkOperations`, toggling enqueues or dequeues the item in
  the bulk-operations context.

## Accessibility
- A real `<input type="checkbox">`, linked to its visible `<label>`.
- Without a visible label, set `ariaLabel`.

## Copy
The label is the item's own name. The required tooltip uses `tooltip.required`.

## Implementation
```vue
<BaseInputCheckbox v-model="selected" :item="{ id }" :bulk-operations-context="context" />
<BaseInputCheckbox v-model="option.isSelected" :label="option.label" size="compact" ignore-bulk-operations />
```
Tests: `src/components/base/__tests__/BaseInputCheckbox.test.ts`.

Not yet supported: an indeterminate ("some selected") state. It will be added
together with "Selecteer pagina" in the selection bar.
