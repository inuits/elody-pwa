# Input

Text, number and textarea fields. Implemented by
`src/components/base/BaseInputTextNumberDatetime.vue`. Date types delegate to
the date picker.

## When to use
- Every raw text or number entry in editors, forms and filters.
- Not for closed lists. Use the [dropdown](./dropdown.md).
- Not for relations. Use the autocomplete tag input.

## Anatomy
The field, then an optional error message below it. The label is rendered by
the surrounding field row. If there is no visible label, give the input an
`ariaLabel`.

## Tokens
| Token | Role |
|---|---|
| `--text-input` | value size |
| `--input-padding` | field padding |
| `--control-height` | minimum height, shared with the dropdown, date picker and autocomplete |
| `--radius-input` | corners |
| `--color-border-default` | resting border (bordered variant) |
| `--color-input-border-hover` | hover border, one step darker |
| `--textarea-min-height` | textarea never shorter than three rows |
| `--color-text-placeholder` | placeholder |
| `--color-danger` | error border and message |
| `--color-surface-muted`, `--color-text-disabled` | disabled |

## Variants
`inputStyle`:
- `defaultWithBorder`: the standard input. Use it everywhere a field
  stands on its own.
- `default`: borderless on the surface. Only for inputs embedded in a
  surrounding control (filter matchers, pagination).
- `defaultWithDarkBackgroundInput`: borderless on the accent tint
  (pagination page field).

## States
| State | Cue | Trigger |
|---|---|---|
| resting | default border | — |
| hover | border one step darker | pointer |
| focus | the global focus ring | keyboard or click |
| error | danger border, message below | `errorMessage`, or `invalid` with an external message |
| disabled | muted surface, disabled ink | `disabled` |
| read-only | no border, no fill, plain value | `readonly` |

Number inputs are right-aligned and never show spinner buttons. The date
picker's input follows the same border, radius, size, height and focus ring. Textareas
resize vertically only and are at least three rows high.

## Behaviour and keyboard
- Text is trimmed before it's emitted. `isValidPredicate` can reject a value.
- A number field that holds non-numeric text emits `NaN`, so the form can
  show an error instead of keeping a stale value.
- Escape inside an inline editor bubbles to the editor, which cancels.

## Accessibility
- Always labelled: a visible label from the field row, or `ariaLabel`.
- Errors: `errorMessage` renders as `role="alert"`, is linked through
  `aria-describedby`, and sets `aria-invalid`. An external hint passed as
  `describedBy` stays linked alongside it.

## Copy
Placeholders are examples, not instructions ("bv. 1958"). Error messages say
what is wrong ("ISBN is ongeldig").

## Implementation
```vue
<BaseInputTextNumberDatetime v-model="year" input-style="defaultWithBorder" type="number" placeholder="bv. 1958" />
<BaseInputTextNumberDatetime v-model="isbn" input-style="defaultWithBorder" :error-message="isbnError" />
<BaseInputTextNumberDatetime :model-value="language" input-style="defaultWithBorder" readonly />
```
Tests: `src/components/base/__tests__/BaseInputTextNumberDatetime.test.ts`.

Belongs to the field row, not to this primitive: the copy-on-hover affordance
and the full-value tooltip for truncated values.
