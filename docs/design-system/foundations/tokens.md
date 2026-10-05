# Tokens

Every colour, size, radius, shadow and duration in the PWA comes from a token
in `src/assets/main.css`. Components never contain literal values. A hex code,
pixel size or duration in a component is a bug, apart from third-party
overrides that cannot read CSS variables.

## Naming

Tokens live in Tailwind 4 `@theme` blocks, and **the prefix decides which
utilities exist**:

| Prefix | Utilities | Example |
|---|---|---|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, `outline-*`… | `--color-surface-muted` → `bg-surface-muted` |
| `--text-*` | font size | `--text-table` → `text-table` |
| `--radius-*` | `rounded-*` | `--radius-input` → `rounded-input` |
| `--shadow-*` | `shadow-*` | `--shadow-overlay` → `shadow-overlay` |
| no namespace | none; reference with `(--name)` | `w-(--filter-panel-width)` |

Colours are always `--color-*`. Never name a colour `--text-*`, because that
namespace is the type scale.

## Layers

1. **Primitives:** the raw palette (`--color-neutral-*`, `--color-red-*`…) and
   the legacy theme names. Not for direct use in components.
2. **Roles:** what a value means. Components use these.
3. **Component tokens:** one decision per component, defined next to the
   component's section in `main.css` and documented on its page.

### Legacy names

Five names predate the design system and are rewritten per client at build
time. They stay, and roles reference them:
`--color-accent-light`, `--color-accent-accent`, `--color-accent-normal`,
`--color-accent-dark`, `--color-text-light`.

New code uses the role that references them, for example `--color-commit` rather than
`--color-accent-accent`. `--color-accent-normal` (mint) is deprecated for UI
use.

## Colour roles

### Accent (client-swappable)
The only colours a client theme may change. See [theming](./theming.md).

| Token | Use |
|---|---|
| `--color-accent` | section-header fill, primary button, active markers |
| `--color-accent-hover` | hover of accent-filled elements |
| `--color-accent-light` | panel-header fill |
| `--color-accent-light-strong` | panel borders |
| `--color-accent-ink` | text on accent-light surfaces |
| `--color-accent-wash` | hover fill on editable values, rows, options |
| `--color-accent-tint` | interdependent-group tint |

### Surfaces
| Token | Use |
|---|---|
| `--color-surface` | cards, panels, inputs |
| `--color-surface-app` | page background |
| `--color-surface-muted` | disabled fills, subtle chips |
| `--color-surface-sunken` | pressed/open states, active toggle segment |
| `--color-surface-panel-header` | panel header band |
| `--color-surface-section-header` | section header band |
| `--color-surface-group-form` | grouped-form card background |
| `--color-surface-row-hover` | list/table row hover |
| `--color-surface-repeat-row` | zebra rows in repeatable groups |
| `--color-surface-note` | notes |
| `--color-surface-inverted` | tooltips, toasts |

### Text
| Token | Use |
|---|---|
| `--color-text-body` | default text |
| `--color-text-strong` | emphasised titles |
| `--color-text-secondary` | values, secondary lines |
| `--color-text-muted` | meta, counts, hints |
| `--color-text-subtle` | separators, faint meta |
| `--color-text-field-label` | field labels |
| `--color-text-link` | links (same blue as labels) |
| `--color-text-placeholder` | placeholders only, never the only label |
| `--color-text-disabled` | disabled text |
| `--color-text-on-accent`, `--color-text-on-inverted` | text on filled surfaces |
| `--color-text-panel-header` | panel header title |

### Borders
`--color-border-default` (inputs, secondary buttons), `-subtle` (menus,
listboxes), `-faint` (separators inside panels), `-panel` (panel outlines),
`-dashed` (add buttons, drop zones; also the hovered input border), `-note`.

### Platform-fixed (never themed)
| Token | Use |
|---|---|
| `--color-commit`, `--color-commit-hover` | commit teal: Bewaar, confirms, checks, spinners |
| `--color-focus-ring` | the one focus ring |
| `--color-danger`, `-bg`, `-wash` | destructive actions, errors |
| `--color-success`, `-strong`, `-bg` | success feedback |
| `--color-warning`, `-bg`, `-chip` | warnings |
| `--color-info`, `-bg` | information |
| `--color-search-mark` | search-hit highlight |
| `--color-badge-tone{1,2,3}-{bg,text}` | entity badges, see below |
| `--color-badge-subtype-{bg,text}` | subtype chip |
| `--color-chip-relation-{bg,text}`, `-neutral-*`, `-count-bg` | chips |
| `--color-scrim` | modal backdrop |

### Entity badges
Three generic tones plus a grey subtype chip. A client's config assigns a tone
to each entity type, in config order, and never reshuffles them. Badge colours
are not named after entity types: which type gets which tone is client
configuration, not tokens. Never add a fourth tone.

## Type scale

Lato (`--font-sans`), Dutch sentence case. Nothing smaller than `--text-micro`.

| Token | Use |
|---|---|
| `--text-micro` | badges, tiny chips |
| `--text-hint` | hints, keyboard-hint lines, counts |
| `--text-label` | field labels, column headers, chips, small buttons |
| `--text-ui` | buttons, header controls |
| `--text-table` | table cells, menu items, options, panel body copy |
| `--text-value` | values and input text (the reading size) |
| `--text-heading` | headings |
| `--text-title` | page titles |

Weights: `--weight-regular`, `--weight-bold`, `--weight-black`. Leading:
`--leading-tight`, `-normal`, `-relaxed`. Uppercase only on the audit-trail
eyebrow (`--eyebrow-tracking`).

`text-base` keeps Tailwind's default. The app's 14px base is set on `body`.

## Spacing

The design system's 2px-step scale is **not** imported as `--spacing-*`,
because it would redefine Tailwind's numeric utilities (`p-1`, `gap-2`) across
the app. Exact spacing decisions live in component tokens, and shared rhythms
in composite tokens: `--panel-header-pad`, `--panel-body-pad`,
`--field-row-pad`, `--table-row-pad`, `--gutter-panels`,
`--gutter-field-grid`, `--page-pad`.

## Shape

| Token | Use |
|---|---|
| `--radius-chip` | chips, badges, dashed add buttons |
| `--radius-input` | inputs, secondary buttons, dropdown triggers |
| `--radius-button` | primary and commit buttons, menu items, tooltips |
| `--radius-card` | cards, panels, popups |
| `--radius-overlay` | modals, popovers |
| `--radius-pill` | pills: actions that start something and are reversible |
| `--radius-round` | circles |

Borders: `--border-width`, `--border-width-control` (checkbox outline).

## Elevation

Exactly two levels. **Cards** have a 1px border and no shadow
(`--shadow-card: none`). **Overlays** float: `--shadow-overlay` (menus,
listboxes), `--shadow-popover`, `--shadow-modal`, `--shadow-toast`. Accent
shadows (`--shadow-accent-hover`, `--shadow-accent-row`,
`--shadow-commit-hover`) are hover/selection cues, not elevation.

`--opacity-empty` dims empty, non-required values.

## Layout

`--nav-rail-width`, `--filter-panel-width`, `--touch-target-min` (minimum hit
target on tablet), `--field-grid-breakpoint-2col` / `-1col`.

## Motion

One duration (`--transition-duration-ui`), one easing (`--ease-ui`), one press
(`--scale-press`; `--scale-press-tight` for 22px icon buttons), spinners at
`--spinner-duration`. No blur, no entrance animations on overlays.

## Changing a token

1. Change the value in `main.css`, in its role or component section.
2. If it's a colour alias (`var(--color-…)`), also re-declare it in the
   `body` block of `main.css` so client themes reach it (see
   [theming](./theming.md)). A unit test fails if you forget.
3. Update the page that documents it, if its meaning changed.
