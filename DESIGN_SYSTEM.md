# elody design system — implementation notes

The design system's written contract lives in the elody docs site under
`/design-system/` (38 pages, from the `elody-design-system-handoff`). Its
running components live in this repo's Storybook. Docs explain, stories prove;
neither restates the other.

```bash
pnpm storybook          # the workshop, on :6006
pnpm build-storybook    # static build, what CI publishes
```

The docs site resolves each page's `<StoryEmbed id="…" />` against
`VITE_STORYBOOK_BASE`, defaulting to `http://localhost:6006`. Point it at the
published Storybook when the docs are built for deployment.

## Where the values live

All tokens are in `src/assets/main.css` inside the existing `@theme` block, so
they are Tailwind theme values: `--color-accent` gives `bg-accent`,
`--radius-card` gives `rounded-card`. Never write a colour, radius, duration or
type size as a literal — a literal cannot be client-themed and will not survive
review.

`[data-elody-client]` scopes follow the `@theme` block. `main.ts` sets the
attribute on `<body>` at boot from `config.customization.elodyClient`, falling
back to `VITE_ELODY_CLIENT`; with neither set the vlacc reference accent
applies. In Storybook the Tenant toolbar sets the same attribute, so every
story can be judged under all six tenants.

The catch-all `[data-elody-client]` rule at the end re-declares the seven
accent-derived aliases. This is load-bearing: a custom property resolves
`var()` where it is **defined**, so aliases living only at `:root` would freeze
to the vlacc accent and every other tenant would silently render vlacc blue.

## Two deliberate deviations from the handoff's `tokens.css`

Both exist to avoid remapping the Tailwind scale the rest of the app is
already written against.

| Handoff | Here | Why |
|---|---|---|
| `--spacing-1 … --spacing-14` (2–26px) | `--spacing-ds-1 … --spacing-ds-14` | Defining `--spacing-4: 5px` would turn every existing `p-4` from 16px into 5px. The namespaced scale adds `p-ds-4` instead and leaves the app's spacing alone. |
| `--text-base: 14px` | `--text-body: 14px` | `--text-base` is Tailwind's own `text-base` (1rem). Overriding it resizes every `text-base` in the app at once — a change that belongs to the screen-level pass, not the token PR. |

## Open finding — accent contrast

The a11y addon reports a genuine violation on filled buttons, not a story
artefact: white text on the accent does not reach WCAG AA (4.5:1) for
normal-size text.

| Fill | Contrast with white |
|---|---|
| commit teal `#0CB2BC` | 2.59 |
| accent vlacc `#3BA6CB` | 2.80 |
| accent pza `#2A97E2` | 3.17 |
| accent aicap `#9F8332` | 3.64 |
| accent podiumnet / damsv2 `#0057b1` | 7.00 |
| accent vliz `#354D9B` | 7.82 |
| danger `#D11800` | 5.47 |

Three tenants pass, three do not, and the commit teal — the colour on every
*Bewaar* — is the worst of them. `client-theming.md` asks for 4.5:1 against
white and accent-light for every accent, so this is the system contradicting
its own rule rather than a decision already taken. The tokens are left at the
handoff values; darkening the accents (or reserving the pale ones for fills
that carry no text) is a palette decision to take before the screen-level pass.

## Still open on `AdvancedDropdown`

The dropdown is on tokens and honours the two behavioural rules its docs page
states outright — search past ten options, popup stays open while multi-picking
— but four items on `dropdown-select.md` are wrapper work on
`vue3-select-component` rather than styling, and are not done:

- the "—" (Geen waarde) option non-required single selects should start with;
- option-shaped skeletons while options load (the library shows a spinner);
- checkboxes in multi-select rows, and the "{n} gekozen" count in the trigger
  (it renders one tag per value today);
- the "Geen opties" / "Zoek…" copy, which needs the translation keys.

Worth doing together, since all four are the same slot-override exercise
against the library.

## Blocked — entity badge tone assignment

`foundations.md` specifies that every entity type a client declares gets one of
three fixed tones, "assigned in config order and never reshuffled", and the
`--color-badge-tone1/2/3-*` tokens are already in `main.css` waiting for it.

Nothing consumes them, because the PWA has no ordered list of a client's entity
types to assign from. `entityTypes` exists only per `EntityListElement`, which
is a per-list filter and neither ordered nor complete; deriving tones from it
would give the same entity type different colours on different screens — the
one thing the rule forbids.

The mapping therefore has to come from the config side (a badge tone on the
entity-type definition in baseGraphql), which is a schema change in another
repo and a decision to take rather than guess. Until then the badge is
deliberately not implemented; the three tone tokens stay unused rather than
being bound to an order the client never declared.

## WP4 — what the field row still waits on

The field row's *presentation* is on tokens: label, value, the "Geen waarde"
empty state and the Ja/Nee boolean. Its *interactive* states — hover wash and
pencil, focus ring on the value, editing, saving, saved, the inline undo chip
— are not, and cannot be until per-field editing exists.

Today a whole panel enters edit mode and every row swaps to
`EntityElementMetadataEdit` at once; a resting row is not a control, so there
is nothing to hover, focus or ring. `InlineFieldEditor.vue` is in `MANIFEST.md`
but does not exist in this repo yet. Building it is WP4.2 and it is the
behavioural half of the package — pick-then-Bewaar changes muscle memory for
cataloguers, which is why the migration plan suggests a flag for one release.

So the order is: WP4.2 first (the editor and the per-field edit path), then the
row's interactive states land on top of it, and only then does `field-row.md`'s
state table close.

## Status against the migration plan

| WP | State |
|---|---|
| WP1 tokens | done — tokens, client scopes, boot wiring, Foundations pages |
| WP2 Storybook | done — tenant + surface toolbars, split-tier viewports, a11y addon |
| WP3 primitives | button, checkbox, spinner, text/number/textarea, tooltip, relation chip, `AdvancedDropdown` done; entity badge blocked (below) |
| WP4 fields & editing | field-row presentation done; the interactive states wait on WP4.2 (above) |
| WP5–WP9 | open |

## Conventions for the next component

1. Read the docs page first; where code and docs disagree, the docs win.
2. Style with tokens in a scoped `<style>` block, not with per-instance colour
   props. Two of the components refactored so far shipped colour props whose
   Tailwind class names did not exist, so the styling never applied — the
   props hid the bug.
3. Implement the docs page's full state table and write the story from
   `STORYBOOK_TODO.md`, titled so the id in `MANIFEST.md` resolves (title, not
   filename, decides the id — `Base/BaseButton` regardless of which file it
   lives in).
4. Codemod the call sites in the same change. Do not leave a deprecated
   variant alive beside its replacement.
5. Check the story under a light-accent tenant *and* a dark-accent one
   (podiumnet, damsv2, vliz flip the panel-header ink to white).

## Retired here

`BaseButtonNew` (now `BaseButton`; the old `BaseButton` was dead code), the
grey `default` and mint `accentNormal` button variants, the checkbox's
single-valued `inputStyle` prop, and the per-instance colour objects on the
button, checkbox and text inputs.

## Needs a translation key

Translations are served by the graphql service, so these keys have to be added
there; until then vue-i18n renders the key itself.

| Key | NL | EN | Why |
|---|---|---|---|
| `bulk-operations.select-item` | Selecteer item | Select item | The accessible name for a list selection checkbox, which had none. |
| `dropdown.remove-option` | Verwijder {option} | Remove {option} | The multi-select tag's ✕ was a bare `&times;` with no accessible name. |
| `metadata.labels.no-value` | Geen waarde | No value | Replaces the deprecated "-" empty placeholder. |

Storybook declares this copy itself in `.storybook/mockMain.ts`, so the stories
read as designed while the keys are still missing from the service.
