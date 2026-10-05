# Spinner

A small rotating ring for work in progress. Implemented by
`src/components/SpinnerLoader.vue`.

## When to use
- Short waits inside a control or a region: a saving button, a loading panel,
  a busy overlay.
- Not for loading lists or options. Use option- or row-shaped skeletons,
  which show the shape of what is coming.
- Never block the whole page when a panel would do.

## Anatomy
A ring with a light track and one coloured edge, rotating continuously.

## Tokens
| Token | Role |
|---|---|
| `--spinner-duration` | one rotation |
| `--color-commit` | moving edge (`accent` theme) |
| `--color-accent-light` | track (`accent` theme) |

## Themes
| `theme` | Use | Edge | Track |
|---|---|---|---|
| `accent` | on surfaces: panels, overlays, lists | commit teal | accent-light |
| `default` | on filled controls (inside buttons) | current text colour | neutral |

Commit teal on a teal button would be invisible, so spinners inside buttons
follow the button's text colour.

## Sizes
`dimensions` is in Tailwind spacing units (1 = 4px). The default is 20, which
is 80px. The ring gets thicker at large sizes. Inside a button the size
follows the icon.

## Accessibility
The spinner is `aria-hidden` and never announces itself. The region that is
loading announces the state: `aria-busy` on a button, or a `role="status"`
message in a panel ("Blok bewaren…").

## Implementation
```vue
<SpinnerLoader theme="accent" :dimensions="5" />
```
Tests: `src/components/__tests__/SpinnerLoader.test.ts`.
