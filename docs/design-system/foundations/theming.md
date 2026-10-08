# Client theming

A theme belongs to a deployment, not to a screen. The PWA ships only the
default colours. A client's colours live in **that client's own repository**
and reach the browser at runtime, so no deployment can see another client's
name or colours.

## How it works

1. The client's app config (in the client's graphql-service repo) lists colour
   tokens under `customization.theme`.
2. baseGraphql's app-config endpoint passes `customization` to the PWA.
3. At boot, before the app mounts, `applyClientTheme()`
   (`src/utils/clientTheme.ts`) sets each token on `<body>`.
4. `main.css` re-declares every derived colour alias on `body`, so an override
   also reaches everything built on it. For example, setting `--color-accent`
   also changes the section-header fill. A unit test keeps that alias list complete.

Only `--color-*` tokens are accepted, and only colour values (hex, `rgb()`,
`rgba()`, `hsl()`, `hsla()`, `var(--color-…)`, `transparent`). Anything else is
ignored with a console warning, so a config can't inject arbitrary CSS.

## Example

```ts
// <client>AppConfig.ts in the client's graphql-service repo
export const exampleAppConfig: FullyOptionalEnvironmentInput = {
  customization: {
    applicationTitle: "Example",
    theme: {
      "--color-accent": "#7A4FB5",
      "--color-accent-hover": "#5E3A8E",
      "--color-accent-light": "#F1EAFA",
      "--color-accent-light-strong": "#DCCDF0",
      "--color-accent-ink": "#4A2C73",
      "--color-accent-wash": "#F6F1FC",
      "--color-accent-tint": "#F8F4FD",
    },
  },
};
```

Setting only these seven gives a complete accent theme. Panel headers, section
headers, hover washes, primary buttons, links on hover and panel borders all
follow.

## Which token colours what

### Accent (the usual set)
| Token | What it colours |
|---|---|
| `--color-accent` | section-header band, primary buttons, active markers, link hover |
| `--color-accent-hover` | hover on primary buttons and accent-filled controls |
| `--color-accent-light` | panel-header band, value chips (chosen dropdown values); also the legacy accent background used by older components |
| `--color-accent-light-strong` | panel borders |
| `--color-accent-ink` | text on the panel-header band and on value chips |
| `--color-accent-wash` | selected rows; hover fill on options, editable values, secondary buttons |
| `--color-accent-tint` | background of interdependent field groups |
| `--color-text-accent-strong` | strong accent text on white (keep it dark enough for 4.5:1) |

### Text and surfaces (only for clients with their own neutrals)
| Token | What it colours |
|---|---|
| `--color-text-body` | all default text |
| `--color-text-field-label` | field labels |
| `--color-text-light` | legacy label blue: labels, ghost buttons, links in older components |
| `--color-text-link` | links |
| `--color-nav-item`, `--color-nav-item-hover` | left-menu items, links or not (default: the link colours); the active item uses the accent |
| `--color-surface` | cards, panels, inputs |
| `--color-surface-app` | page background |
| `--color-background-light` / `--color-background-normal` | legacy equivalents of surface and app background, still used by older components |
| `--color-highlight-bg` / `--color-highlight-text` | text selection and search-hit highlight |

### Commit and focus (platform-fixed by default)
| Token | What it colours |
|---|---|
| `--color-accent-accent` | commit buttons (Bewaar), checks, spinners and the focus ring, through `--color-commit` and `--color-focus-ring`; also older components that use it directly |
| `--color-commit-hover` | hover on commit buttons |
| `--color-accent-normal` | legacy mint hover/active colour in older components |

The design system keeps commit teal and the focus ring the same on every
client. Override these only when a client's brand requires it, and set
`--color-commit-hover` together with `--color-accent-accent`.

### Never themed
Semantic colours (`--color-danger`, `-success`, `-warning`, `-info`), badge
tones, chips, borders, neutrals.

### Legacy tokens
Older components still use the five legacy names (`--color-accent-light`,
`--color-accent-normal`, `--color-accent-accent`, `--color-accent-dark`,
`--color-text-light`) and the legacy backgrounds. Until they are migrated to
role tokens, a theme that changes a role should also set its legacy
counterpart, as in the tables above.

## Checklist for a new theme
- Every text colour passes 4.5:1 against `--color-surface` and
  `--color-accent-light` (see [accessibility](./accessibility.md)).
- Derive hover colours as a darkened accent.
- Set accent-light and accent-ink as a pair, so panel-header text stays
  readable. A dark accent-light needs a light accent-ink.
- Check panel headers, section headers, primary buttons, row hover, links,
  labels and the focus ring in the running app.

## Build-time theme (being retired)
Each client repo may still have `dashboard/client-customization/theme.txt`,
which its Dockerfile `sed`s into `main.css` at build time. The runtime theme
overrides it. Once a client's `customization.theme` is verified, remove its
`theme.txt` and the `sed` step.
