# Handoff deviations: what to revisit

Everything the redesign does differently from the handoff
(`elody-design-system-handoff/`), or did not build yet. Finish the redesign
first, then work through this list to move closer to the handoff.

**Rule:** every new deviation gets a row here when it is decided, with its ID
from `decisions.md` (the full reasoning lives there). Remove a row when it is
resolved.

Kinds:
- **Deviation:** built differently on purpose (user decision or source conflict).
- **Parked:** not built yet; the handoff behaviour is still wanted.
- **Open:** undecided.

## DS 1: tokens and primitives

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| F5 | Deviation | spacing scale `--spacing-*` (2px steps) | not imported (it would redefine Tailwind's `p-1`, `gap-2`…); exact spacing via component tokens | decide whether to migrate spacing to the handoff scale |
| I6 | Open | one bordered input | three input variants kept, on tokens | revisit (filters no longer need the other two?) |
| P2 | Deviation | no `lg` chip | `lg` kept (comparison columns) | check whether comparison columns can use the md chip |
| C2 | Parked | — (catalogue has indeterminate) | no indeterminate checkbox | with "select page" |

## DS 2: per-field editing

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| E1 | Deviation | pencil on hover | always visible (catalogue): editability must not depend on hover | — |
| E2 | Deviation | dashed underline under the value | under the value text only, none for pills (catalogue) | — |
| E4 | Deviation | pick, then Bewaar; never save on blur | no Bewaar per field: leaving the field or Enter saves, Esc/Annuleer discards (also WYSIWYG) | revisit with users |
| E5 | Deviation | opening a second field keeps the first open, nothing saved | the changed field saves first; on failure it stays open and the second doesn't open | follows E4 |
| E7 | Deviation (interim) | removing a repeatable row executes at once with an undo toast | a saved row asks for confirmation | replace with undo once `useUndo` exists (E14) |
| E8 | Parked | drag handle + ↑/↓ to reorder repeatable rows | not built | build |
| E9 | Deviation | table input rows each their own scope | a relation table saves as one scope (diff-only) | — |
| E10 | Deviation | clicking a value never navigates | a relation chip links to its entity when the link formatter names the relation type | — |
| E11 | Deviation | page-level "Bewerk" toggle removed | opt-in per entity type (`hasEditMetadataButton`), hidden by default | remove the whole-form path |
| E13 | Open | feature flag for one release (migration risk) | no flag | decide before rolling out to vlacc / VLIZ |
| E14 | Parked | undo after save (inline chip) and after removal (toast) | not built | build `useUndo`; then drop E7's confirm |
| E15 | Deviation | coordinates as text + "Toon op kaart" link | text only | — |
| E16 | Parked | image value: 48px thumb, opens the viewer | no image formatter | build with the first field that needs it |
| E17 | Deviation | copy affordance on every value, on hover | only on `copyToClipboard` fields, always visible | — |
| E18 | Parked | group form card (one Bewaar/Annuleer, `role="group"`) | not built (no config marks a group) | build with the first real group |

## DS 3: action discovery

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| A4 | Deviation | unavailable actions shown disabled with a reason | actions without permission are hidden (state-disabled ones stay visible with a reason) | — |
| A10 / D1 | Deviation | md triggers (12px, 6px 14px) | sm triggers in rows (dense rows) | — |
| D3 | Open | "Acties" trigger in label-blue ink | body ink (secondary button) | switch the ink if wanted |
| D5 | Deviation | disabled item explains itself via `title` | help icon with tooltip (keyboard-reachable) | — |
| D7 / D8 | Deviation | "Selectie: 2", "Verwijder 2 records" | "1/1,258 items selected", "Delete (2 selected)" | align copy |
| A8 | Deviation | — | collapse-when-empty bar and the count on the confirm button not taken | — |

## DS 4: lists, panels, filters, navigation

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| L10 / L11 | Deviation | pager and page size in a list footer (`pagination.md`) | in the results header band, per `templates/elody-list-screen` (« ‹ page [n] of N › », "Items: 20") | — |
| L12 | Deviation | — | aicap kit (`ui_kits/clients/aicap.html`) followed over the template for the results panel; view switch and "Items: 20" kept in the band | — |
| L13 | Deviation | selection bar with a split button (DS 3) | the list's selection row shows separate buttons, disabled until they apply (`ui_kits/clients`) | — |
| L18 / FL2 | Deviation | active filter section: count chip | accent-light section surface, no chip, no dot | — |
| L20 | Deviation | filter rail `--filter-panel-width` (250px) | 30% (250px felt too small) | — |
| L20 | Deviation (shortcut) | option counts as data | counts split from "Label (12)" on the client | DS 6: send counts separately |
| L22 | Deviation | one global focus ring | the filter input box carries the ring on `:has(input:focus-visible)` | — |
| L26 | Deviation | template page box 11.5px | 13px input | — |
| L27 | Parked | record stepper with a result-list popover | no popover | build |
| L28 | Deviation | account only in the expanded rail's footer row | collapsed rail keeps profile + logout | — |
| L29 | Open | text ≥ 4.5:1 | aicap's theme link colour (#C2A169) is ~2.4:1 on white | client theme decision |
| V19 | Open | client themes derive their accent roles | aicap sets only its accent, so `--color-accent-dark` (pager current page, current guided step) stays the platform blue next to its gold | add `accent-dark` to aicap's theme |
| L30 | Deviation | — | band button bold, selects regular (catalogue Button vs mockup select) | — |
| L31 | Deviation | em dash for an empty value in the preview (`preview-panel.md`) | "No value" (the handoff's foundations deprecate "-") | — |
| DS 4 leftovers | Parked | — | detail-panel add pills; missing "Add entity-translations.inscription" label | pick up as a side task |

## DS 5: viewers and flows

| ID | Kind | Handoff | What we did | Follow-up |
|---|---|---|---|---|
| V1 | Deviation | dark viewport, translucent dark 26px capsules, filmstrip | catalogue + UI kit: white 40px bar over the checkboard, 28×24 buttons, circle arrows, no filmstrip | revisit if the handoff look is wanted |
| V5 | Deviation | home button | "Reset" text button (catalogue); it does not undo rotation (OpenSeadragon) | — |
| V2 / V8 | Deviation | AV: play/pause, scrubber, volume, fullscreen in the shared toolbar | native browser controls; toolbar has download only | build custom transport if wanted |
| V3 | Parked | IIIF manifest = image mode fed by canvases, filmstrip, no separate chrome | Mirador/Tify kept (Mirador backs the manifest comparison) | decide what replaces Mirador's comparison |
| V9 | Open | — | `base/MediaViewer.vue` (thumbnail column, coghent's media view mode) kept beside `MediaViewerNew` | move `ViewModesMedia` to `MediaViewerNew`? |
| V10 | Deviation | no red/green pairs | heat map keeps green → orange → red (user) | — |
| V10 | Deviation | fit to extent on load | the list map view keeps its initial extent (fitting would trigger the geo filter) | — |
| V12 | Parked | per-row "Retry" for a failed upload | not built | build |
| V13 | Deviation | dropzone button named "Upload bestanden" | named by the configured label (label-in-name) | — |
| V14 | Deviation | per-file bar with % | per-step progress (no upload progress events from `fetch`) | switch to XHR/streams for real % |
| V17 | Open | — | the failed prepare step's tooltip says "Mismatch between mediafiles and CSV" for any failure | general wording |
| — | Open | "rejected" state: toast with the type/size reason | not checked | check Dropzone's rejected files |
| G-A | Deviation | guided flow footer: Vorige · Volgende · Bewaar en sluit | each step's configured form keeps its own submit as "Next"; footer has Back and Save and close | move the submit to the footer if all step forms allow it |
| V20 | Deviation | rail rows: entity-type badge + title + check | step label + title + check (the flow config carries no badge tones) | add badge tones to the step config |
| G-B | Deviation | passed steps clickable to revisit | not clickable (the step's record already exists; revisiting would create a second one); Back stays | revisit-to-edit |
| Step 9 | Parked | DAMS tenants: media-first detail layout | not started (needs vliz-dams) | — |
| DS 3 note | Open | every button named | recrop modal close button had no name (found in DS 3) | check |
