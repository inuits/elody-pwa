# Button

A rectangle that executes an action immediately. Implemented by
`src/components/base/BaseButtonNew.vue`.

## When to use
- Any action that happens when you click: Bewaar, Annuleer, Open record, Verwijder.
- Not for actions that only *start* something reversible, such as add, search
  or stepping through records. Those are pills (see
  [principles](../foundations/principles.md#shape-encodes-role)).
- Not for icon-only toolbar controls without a visible label. Use an icon
  button with `aria-label` (`label` empty, `ariaLabel` set).

## Anatomy
Optional leading icon, then the label. Bold, single line, never wraps.

## Tokens
| Token | Role |
|---|---|
| `--text-button-md` / `--text-button-sm` | label size per size |
| `--button-md-padding` / `--button-sm-padding` | padding with a label |
| `--button-md-padding-icon` / `--button-sm-padding-icon` | padding when icon-only (square) |
| `--button-gap` | space between icon and label |
| `--radius-button` | primary, ghost, commit, danger |
| `--radius-input` | secondary (input-shaped) |
| `--scale-press` | press feedback |

Colours come from the role tokens listed per variant.

## Variants
| `buttonStyle` | Use | Resting | Hover |
|---|---|---|---|
| `primary` | the main navigation-type action (Open record, Open detailpagina) | `--color-accent` fill, white text | `--color-accent-hover` + `--shadow-accent-hover` |
| `secondary` (default) | neutral actions, Annuleer next to a commit | `--color-surface`, 1px border, body text | `--color-accent-wash` |
| `ghost` | low-emphasis actions | no fill, `--color-text-light` | `--color-accent-wash`, accent-dark text |
| `commit` | saving and confirming (Bewaar, Voeg toe) | `--color-commit` fill, white text | `--color-commit-hover` |
| `danger` | destructive actions | `--color-danger` fill, white text | red-dark |

At most one primary or commit button per row.

Retired and removed: `default` (grey), `accentNormal` (mint), `accentAccent`
and `redDefault`. They became `secondary`, `commit`, `commit` and `danger`.

## Sizes
`buttonSize`: `md` (default) or `sm`. Use `sm` inside dense surfaces such
as panel headers, rows, filters and toolbars, and `md` everywhere else.

## States
| State | Cue |
|---|---|
| resting | per variant |
| hover | per variant |
| focus | the global focus ring (`:focus-visible`) |
| active | `scale(--scale-press)` |
| disabled | `--color-text-disabled` on the muted surface, no pointer, no press |
| loading | spinner, label stays, width unchanged, `aria-busy="true"`, not clickable |

**Loading keeps the width.** With an icon, the spinner takes the icon's place.
Without one, the label stays in place invisibly and the spinner sits on top
of it.

A disabled button can carry `tooltipLabel`. A help icon then explains why
it's disabled.

## Behaviour and keyboard
Enter and Space activate it. While loading or disabled it does nothing.

## Accessibility
- A real `<button type="button">`.
- Icon-only buttons must set `ariaLabel`.
- Loading sets `aria-busy`. If the result needs announcing, announce it from
  the surrounding region, not from the button.

## Copy
Verbs, sentence case: "Bewaar" / "Save", "Annuleer" / "Cancel",
"Voeg persoon toe" / "Add person". Labels come from i18n keys.

## Implementation
```vue
<BaseButtonNew label="Bewaar" button-style="commit" @click="save" />
<BaseButtonNew label="Annuleer" button-style="secondary" button-size="sm" />
<BaseButtonNew :icon="DamsIcons.Cross" aria-label="Sluit" button-style="ghost" />
```
Tests: `src/components/base/__tests__/BaseButtonNew.test.ts`.
