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

## WP4 — the whole-form edit path is gone

Per-field editing replaced it outright rather than sitting behind a flag: the
redesign ships as a separate beta build of the PWA, so it can be tested in
phases without a switch in the code.

Removed: `MetadataEditButton.vue` (the page-level *Bewerk* toggle, in the
header and on every panel) and `modals/EditModal.vue` (the fixed save bar at
the bottom of the record — the global save bar `per-field-editing.md` forbids).

Three consequences worth knowing before testing:

- **`showOnlyInEditMode` no longer hides anything.** It meant "only while the
  page is in edit mode", and there is no such mode now. Keeping it would hide
  a field permanently, since you cannot click a value you cannot see, so those
  fields are always visible. Configs using it should be reviewed.
- **The required `*` and the one-of-required marker are always shown.** They
  used to appear only in edit mode, which meant a reader never learned a field
  was required.
- **The virtual keyboard follows the open editor** instead of the page's edit
  mode.

`useEditMode` itself stays: ordering, entity pickers, bulk operations and the
WYSIWYG use it as their own mechanism, and none of those are the metadata
whole-form path.

## Already correct — do not redo

The preview split's container-query tiers were **already** exactly what
`entity-list-element.md` specifies (500 → 40/60, 630 → 35/65, 830 → 30/70,
1024 → 25/75, stacked below 500), and the table's progressive column collapse
down to the first metadata column was already there too, in
`ViewModesTable.vue` and `TableViewRow.vue`. WP5b only needed the panel shell
on `PreviewWrapper`.

`PreviewWrapper` cannot be rendered in Storybook — it resolves its own preview
query through Apollo — and its unit test is one of the ten files that die on
the jsdom localStorage problem. Since WP5e its header is `BasePanelShell`,
which *is* storied and screenshot-verified under a light and a dark tenant, so
the chrome is covered even though the wrapper itself is not.

## Facet counts — done, via a label slot

`facetCounts` is exported from `useFilterOptions` and rendered by
`CheckboxFilter`: a muted numeral chip on the right of each option, and the
docs' exact wording in the accessible name ("BOEK, 812 resultaten"). To get
that wording, `BaseInputCheckbox` gained a `#label` slot and its `ariaLabel`
now overrides the visible label whenever it is given (it used to be ignored
as soon as a visible label existed). An option the facets know nothing about
shows no number and keeps its plain label as name.

## Saved searches — chip and titles done, four items need the entity

The applied saved search in the rail header is now a removable chip — a real
button named "Opgeslagen zoekopdracht: {naam}, verwijderen" — carrying the
modified dot when the active filters differ from the saved set. Both modals
ride the new BaseModal title. The rail header was restructured for it: a
button cannot nest a button, so the disclosure now wraps only the label and
chevron.

Four saved-searches.md items are not buildable from the PWA alone, because the
SavedSearch entity has no fields for them: the default star (Maak standaard,
auto-apply on open), the shared/team flag on a row, undo-over-confirm on
delete (needs a restore path — recreating the search client-side would mint a
new id), and the Save vs Save-as prompt for a modified shared search. Like the
badge tones and `isGroup`, these want entity/config-side work first.

## Group editing needs `isGroup` from the service

Group editing is built (`useBlockEditor.ts` + the card on
`EntityElementWindowPanel`), but it only switches on for a panel whose form
definition says its fields are interdependent. Nothing expressed that: a panel
is a layout grouping, and treating every panel as a group would recreate
whole-form editing one level down.

`isGroup` was therefore added to `WindowElementPanel` in **baseGraphql**
(branch `feat/panel-is-group`), opt-in and defaulting to false. Two steps
remain, and neither can be done from this repo:

1. merge and deploy that branch, then
2. run `task generate` with the stack up, so `isGroup` reaches
   `src/generated-types/queries.ts` and the panel query.

Until then `EntityElementWindowPanel` reads the flag defensively and every
panel behaves as independent field rows — which is the correct default anyway.
The Storybook story drives the flag directly, so the group card is reviewable
now.

## Status against the migration plan

| WP | State |
|---|---|
| WP1 tokens | done — tokens, client scopes, boot wiring, Foundations pages |
| WP2 Storybook | done — tenant + surface toolbars, split-tier viewports, a11y addon |
| WP3 primitives | button, checkbox, spinner, text/number/textarea, tooltip, relation chip, `AdvancedDropdown` done; entity badge blocked (below) |
| WP3 done-when | met — `src/components` holds no colour literals outside the IIIF logo, Mirador's theme and the OpenLayers map styles |
| WP4 fields & editing | done — field row, inline editor, undo chip, group editing; whole-form path removed. Group editing waits on `isGroup` reaching the generated types (above) |
| WP5 lists & actions | done — rows, preview split, action trigger, selection bar, panel shell, pagination. Only the quality-status chip + jump-to-field popover is left, and it is a feature rather than chrome |
| WP6 filters | done — rail, section headers, matcher chrome, option skeletons, facet counts, base modal, picker chrome, date picker and the saved-searches surfaces. Left open, needing entity-side support: the default star (Maak standaard), the shared/team flag, undo-over-confirm on delete and Save-vs-Save-as (below). The date range variant stays unbuilt until a field needs it |
| WP10 stories | `library-viewmodes-viewmodeslist--default` resolves — list + grid + selected rows from the real bulk-operations store. The preview-split-open state is not in the story: `getPreviewComponents` in this build's generated types selects only `__typename`, so preview config is client-specific; the tiers are exercised via the viewport toolbar and the row cue lives in the ListItem story |
| WP7 viewers | one ViewerToolbar for image + PDF, PdfToolbar deleted; AV/text modes, IIIF-manifest filmstrip, map accent styling and the media-first detail column open |
| WP8–WP9 | open |

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
| `field-row.edit-value` | {label}, bewerken | {label}, edit | Accessible name of the editable value. |
| `inline-editor.save` | Bewaar | Save | |
| `inline-editor.cancel` | Annuleer | Cancel | |
| `inline-editor.saved` | Opgeslagen | Saved | |
| `inline-editor.keyboard-hint` | Enter bewaart · Esc annuleert | Enter saves · Esc cancels | The hint line under an open editor. |
| `inline-editor.save-failed` | Opslaan mislukt, probeer opnieuw | Saving failed, try again | Shown when the server rejects a save. |
| `inline-editor.undo` | Ongedaan maken | Undo | The inline undo chip beside a just-saved value. |
| `group-form.check-highlighted-fields` | Controleer de gemarkeerde velden | Check the highlighted fields | Group validation summary. |
| `context-menu.actions` | Acties | Actions | Label on the overflow trigger that replaced the bare ⋮. |
| `bulk-operations.toolbar-label` | Acties op selectie | Selection actions | Accessible name of the selection bar. |
| `pagination.nav-label` | Paginering | Pagination | Accessible name of the pager. |
| `pagination.results-per-page` | Resultaten per pagina | Results per page | Label of the page-size select. |
| `pagination.per-page` | {count} per pagina | {count} per page | Page-size options. |
| `pagination.previous` / `.next` | Vorige pagina / Volgende pagina | Previous page / Next page | The ‹ and › steps. |
| `filters.section-active` | actief | active | Chip on an active filter section. `filters.active` already exists but means the rail's "N actief", so this is its own key. |
| `filters.saved-searches` | Bewaarde zoekopdrachten | Saved searches | Accessible name of the saved-searches trigger. |
| `filters.clear-filter` | Wis filter | Clear filter | Per-section clear, which applies immediately. |
| `filters.option-count-name` | {label}, {count} resultaten | {label}, {count} results | Accessible name of a counted filter option. |
| `modal.close` | Sluiten | Close | Accessible name of the modal close cross. |
| `bulk-operations.confirm-selection-count` | Bevestig selectie ({count}) | Confirm selection ({count}) | The picker's commit, with the live count. |
| `search.submit` | Zoek | Search | Submit inside the search pill. |
| `date-picker.placeholder` | dd-mm-jjjj | dd-mm-yyyy | Typed entry is first-class; the placeholder is the format. |
| `saved-searches.picker-title` | Bewaarde zoekopdrachten | Saved searches | Title of the picker modal. |
| `saved-searches.create-title` | Bewaar zoekopdracht | Save search | Title of the create modal. |
| `saved-searches.applied-chip` | Opgeslagen zoekopdracht: {name}, verwijderen | Saved search: {name}, remove | Accessible name of the applied chip. |
| `saved-searches.modified` | Gewijzigd | Modified | Title of the modified dot on the chip. |
| `viewer.toolbar-label` | Viewer-acties | Viewer actions | Accessible name of the viewer toolbar. |
| `viewer.zoom-in` / `.zoom-out` | Zoom in / Zoom uit | Zoom in / Zoom out | |
| `viewer.fullscreen` | Volledig scherm | Fullscreen | |
| `viewer.download` | Download | Download | |

Storybook declares this copy itself in `.storybook/mockMain.ts`, so the stories
read as designed while the keys are still missing from the service.
