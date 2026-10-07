# Dropdown

The overlay listbox behind every closed-list choice. Implemented by
`src/components/base/AdvancedDropdown.vue` on top of `vue3-select-component`.

## When to use
- Every enum or closed-list choice in edit, filter and chrome surfaces. There is
  no native `<select>`.
- Not for relations. Use the autocomplete tag input.
- Not for free text. Use the [input](./input.md).

## Anatomy
- **Trigger:** an input-shaped field with the value and a ⌄ indicator. A ✕
  clears it when it's clearable and has a value. With `labelPosition="inline"`,
  the label sits inside the trigger.
- **Popup:** a floating card with the options. Search is inside the trigger.
- **Options:** label, optional icon, a check on the selected one. In a multi
  select, a checkbox per option.

## Tokens
The library's `--vs-*` variables are mapped to design-system tokens in the
component's style block:

| Token | Role |
|---|---|
| `--text-value` | trigger value |
| `--text-table` | options |
| `--radius-input` | trigger |
| `--control-height` | trigger height, the same as the text input |
| `--radius-card`, `--shadow-overlay`, `--color-border-subtle` | popup |
| `--color-border-default` | trigger border (bordered variant) |
| `--color-accent-wash` | option hover and keyboard focus |
| `--color-focus-ring` | trigger focus |
| `--color-text-placeholder` | placeholder and the "— Geen waarde" option |

## Variants
`styleType`:
- `default`: borderless on the surface.
- `defaultWithBorder`: bordered. Use it for selects standing on their own.
- `defaultWithLightBorder`: subtle border.

## States
| State | Cue | Trigger |
|---|---|---|
| closed | value + ⌄ | — |
| open | popup; the trigger keeps its focus ring | click, Enter, Alt+↓ |
| searching | options filter as you type | typing, only when there are more than 10 options |
| single selected | check on the option | pick |
| multi selected | checkboxes; "{n} gekozen" in the trigger | pick (popup stays open) |
| loading | three option-shaped skeleton rows, `aria-busy` | `loading` |
| empty | "Geen opties" | no options |
| cleared | placeholder returns | ✕, or "— Geen waarde" |

## Behaviour and keyboard
- Arrow keys move, Enter picks, Escape closes without change.
- **Non-required single selects** (`clearable`, the default) start with
  "— Geen waarde". Picking it clears the value. Required or chrome selects
  pass `:clearable="false"` and get neither ✕ nor the empty option.
- **Multi selects** keep the popup open, and keep selected options in the list.
- **Picking never saves.** The editor around the dropdown commits with
  Bewaar.
- Options keep their config order.

## Accessibility
- The library provides the listbox pattern: `aria-expanded` on the trigger,
  `aria-selected` on options, and `aria-multiselectable` for multi.
- Option checkboxes are decorative (`aria-hidden`). Selection is announced
  through `aria-selected`.
- Skeleton rows are `aria-hidden`, and the dropdown sets `aria-busy` while
  loading.

## Copy
| Key | NL | EN (fallback) |
|---|---|---|
| `metadata.labels.no-value` | Geen waarde | No value |
| `dropdown.n-selected` (`{n}`) | {n} gekozen | {n} selected |
| `dropdown.no-options` | Geen opties | No options |

## Implementation
```vue
<AdvancedDropdown v-model="type" :options="types" style-type="defaultWithBorder" />
<AdvancedDropdown v-model="languages" :options="languageOptions" multiple :loading="isLoading" />
<AdvancedDropdown v-model="sort" :options="sortOptions" :clearable="false" label-position="inline" :label="t('sort')" />
```
Tests: `src/components/base/__tests__/AdvancedDropdown.test.ts`.
