# Tooltip

Supplementary text shown on hover and focus. Implemented by
`src/components/base/BaseTooltip.vue`.

## When to use
- To give the full value of a truncated text, the name of an icon-only
  control, or why something is disabled.
- Never as the only place required information appears.
- Never for interactive content: no links, buttons or inputs inside a
  tooltip. Use a popover for that.

## Anatomy
A small inverted surface with white text, placed next to its trigger.

## Tokens
| Token | Role |
|---|---|
| `--color-surface-inverted` | background |
| `--color-text-on-inverted` | text (white) |
| `--text-tooltip` | text size |
| `--tooltip-padding` | padding |
| `--radius-tooltip` | corners |

No shadow. The 300ms show delay is `SHOW_DELAY_MS` in the component.

## States
| State | Trigger |
|---|---|
| hidden | default |
| pending | pointer enters or trigger gets focus; shows after 300ms |
| shown | delay elapsed |
| hidden again | pointer leaves, focus leaves, or Escape |

Leaving before the delay ends cancels the tooltip.

## Behaviour
- Placement defaults to `top-end`, with automatic flipping to stay in view
  (`enableAutoPlacement`), an optional `tooltipOffset`, and `maxWidth`
  (default 14rem).
- Teleported to `body`, or into the open modal when one is open.
- Content stays plain: the tooltip sets size and colour, so callers don't
  style the text.

## Accessibility
- `role="tooltip"` with a stable id.
- The activator slot exposes `describedBy`. Bind it to the trigger as
  `:aria-describedby="describedBy"` so screen readers read the tooltip.
- Shows on keyboard focus as well as hover, and hides on Escape.

## Implementation
```vue
<BaseTooltip position="top" :tooltip-offset="8">
  <template #activator="{ on, describedBy }">
    <button v-on="on" :aria-describedby="describedBy" aria-label="Help">…</button>
  </template>
  {{ t("tooltip.required") }}
</BaseTooltip>
```
Tests: `src/components/base/__tests__/BaseTooltip.test.ts`.
