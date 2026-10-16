# Menu, overflow trigger and split button

A list of actions that opens from a labelled trigger. Implemented by
`src/components/base/BaseContextMenu.vue` (the menu),
`src/components/base/BaseContextMenuItem.vue` (an item) and
`src/components/ContextMenuActionsShell.vue` (the "Acties" trigger and the
split button).

## When to use
- Secondary actions of a row or panel that don't fit as visible buttons.
- Never behind a bare ⋮: the trigger always shows a label ("Acties ⌄").
- One primary per entity. The first promoted action (`showAsButton`) plus
  the other actions form a split button. Further promoted actions lead its
  menu. A promoted action with no other actions is a plain primary button.

## Anatomy
- Trigger: secondary `BaseButtonNew` (sm, bordered), label + ⌄ (⌃ while open).
  "Actions" by default; `triggerLabel` names a more specific scope
  ("Saved searches" in the filter panel).
- Split button: the promoted action as a primary (accent) button and an
  accent chevron segment in one capsule, split by a white 40% divider. The
  chevron takes the accent-hover fill while open.
- A promoted action on its own is a primary (accent) button, not commit
  teal: it starts an action, it does not confirm a form.
- Menu: surface, 1px subtle border, card radius, overlay shadow, 12.5px
  text. Opens under the trigger, aligned to its right edge near the
  viewport edge, and above it near the bottom.
- Item: optional 14px icon + verb-first label, `--leading-tight` line
  height. Items are links in markup, but never underline on hover.
- Destructive items: the action config sets `tone(input: Danger)` (route
  configs: `tone: ActionTone.Danger`). The renderer then gives the item
  danger ink and sorts it last. Never inferred from the verb.
- Nesting: menus are flat. At most one submenu level is allowed; none
  exists today.

## Tokens
| Token | Role |
|---|---|
| `--menu-padding` | inset around the items |
| `--menu-min-width` | minimum menu width |
| `--menu-item-padding` | item padding |
| `--menu-item-gap` | icon–label gap |
| `--menu-icon-size` | item icon size |
| `--menu-item-ink` | item text colour; danger items switch it to `--color-danger-ink` |
| `--radius-card` | menu corners |
| `--radius-button` | item corners |
| `--shadow-overlay` | menu elevation |
| `--text-table` | menu text size |
| `--split-button-divider` | line between primary and chevron |
| `--split-button-chevron-padding-x` | chevron segment side padding |

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
- Split button: a `role="group"`; the primary is named by its label, the
  chevron "Meer acties voor {titel}" ("Meer acties" without a title). Rows
  pass their first teaser value as the title, panels their heading.
- Menu `role="menu"`, items `role="menuitem"`.

## Content
"Acties" / "Actions". Items are verbs, sentence case.
