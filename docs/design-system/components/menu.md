# Menu and overflow trigger

A list of actions that opens from a labelled trigger. Implemented by
`src/components/base/BaseContextMenu.vue` (the menu),
`src/components/base/BaseContextMenuItem.vue` (an item) and
`src/components/ContextMenuActionsShell.vue` (the "Acties" trigger).

## When to use
- Secondary actions of a row or panel that don't fit as visible buttons.
- Never behind a bare ⋮: the trigger always shows a label ("Acties ⌄").

## Anatomy
- Trigger: ghost `BaseButtonNew` (sm), label + ⌄ (⌃ while open).
- Menu: surface, 1px subtle border, card radius, overlay shadow, 12.5px
  text. Opens under the trigger, aligned to its right edge near the
  viewport edge, and above it near the bottom.
- Item: optional 14px icon + verb-first label.

## Tokens
| Token | Role |
|---|---|
| `--menu-padding` | inset around the items |
| `--menu-min-width` | minimum menu width |
| `--menu-item-padding` | item padding |
| `--menu-item-gap` | icon–label gap |
| `--menu-icon-size` | item icon size |
| `--radius-card` | menu corners |
| `--radius-button` | item corners |
| `--shadow-overlay` | menu elevation |
| `--text-table` | menu text size |

## States
| State | Cue |
|---|---|
| item hover | `--color-accent-wash` fill |
| item focus | global focus ring |
| item disabled | `--color-text-disabled` ink, no hover; stays focusable (`aria-disabled`) with its reason in a tooltip |
| highlighted (active choice) | `--color-accent-wash` fill |

## Behaviour and keyboard
- Trigger: click or Enter/Space toggles; ↓ opens. Focus moves to the first item.
- Menu: ↑/↓ cycle, Home/End jump, Enter/Space activate, Escape closes and
  returns focus to the trigger, Tab closes and continues from the trigger.
- Outside click or scroll closes without firing.

## Accessibility
- Trigger: `aria-haspopup="menu"`, `aria-expanded`; its name is
  "Acties voor {titel}" when the caller passes `contextLabel`.
- Menu `role="menu"`, items `role="menuitem"`.

## Content
"Acties" / "Actions". Items are verbs, sentence case.
