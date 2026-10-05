# Client theming

A theme belongs to a deployment, not to a screen. A client may change **only
the accent**. Neutrals, semantic colours, commit teal, the focus ring and badge
tones are the same for every client.

## How a theme applies

A client scope is a `[data-elody-client="<client>"]` block in `main.css`.
It overrides the accent roles (`--color-accent`, `-hover`, `-light`,
`-light-strong`, `-ink`, `-wash`, `-tint`, `--color-text-accent-strong`).
`<body data-elody-client="…">` is set at boot from
`customization.clientTheme`. vlacc's values are the `:root` defaults.

Each scope also re-declares the seven accent-derived aliases
(`--color-surface-panel-header`, `--color-surface-section-header`,
`--color-surface-editable-hover`, `--color-surface-group-tint`,
`--color-text-panel-header`, `--color-text-link-hover`,
`--color-border-panel`). CSS custom properties resolve `var()` where they are
*declared*. Aliases declared only on `:root` would stay at vlacc's accent on
every client.

Clients with a dark accent-light (podiumnet, damsv2, vliz) get white
panel-header text through `--color-accent-ink`.

**aicap** is the one sanctioned exception. Besides the accent, it also has warm
surfaces, its own body ink, field-label and link colours, and its own
highlight background.

> **Not yet active.** `customization.clientTheme` is not passed through the
> app-config endpoint and no client sets it yet. Until then every client gets
> the `:root` defaults, plus the legacy colour rewrite from its
> `theme.txt` at build time. Wiring this is a separate task.

## Rules
- Derive hover as a darkened accent.
- Check every new accent for 4.5:1 against `--color-surface` and
  `--color-accent-light`.
- One scope per client. Two clients never share a scope, even with identical
  values.
- Never theme commit teal, the focus ring or badge tones.
