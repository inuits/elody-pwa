# Entity picker

The modal behind "Blader…" under a relation's search: search for entities of
the field's type and pick them. Implemented by
`src/components/metadata/RelationPickerModal.vue` (`TypeModals.RelationPicker`).

## When to use
- Setting a relation from the inline editor when the dropdown's options are
  not enough to find the entity.
- Not for enum values (inline select) or free text.
- Pickers inside flows and forms (guided flow, DynamicForm) still embed the
  full list (`EntityPickerComponent`), the library-embedded variant.
  That one has a fixed height too (`--entity-picker-height`,
  `--entity-picker-drawer-height` in drawers), so its modal keeps its size
  while results change. Pass a fixed `h-…`, never a `max-h-…`, as
  `baseLibraryHeight`.

## Anatomy
BaseModal with its panel-header band: title "Kies {type}", the count chip
"Resultaten: n" and the close cross. Body: search pill, then the results as
rows (check, label in bold, secondary line). Multi select adds a footer:
"Annuleer" (ghost) and "Voeg toe" (commit).

## Tokens
| Token | Role |
|---|---|
| `--relation-picker-width` | dialog width from `md` up (phones: full screen) |
| `--relation-picker-results-height` | fixed results height: the dialog doesn't resize while you type; the rows scroll |
| `--modal-body-pad`, `--modal-footer-pad` | body and footer |
| `--chip-padding` | count chip |
| `--color-surface-row-hover` | row hover |
| `--color-accent-wash` | selected row |
| `--color-commit` | selected row's check |

## Variants and states
| State | Cue |
|---|---|
| loading | spinner in the pill |
| results | rows, hover wash |
| selected (multi) | accent wash and check; "Voeg toe" enabled |
| no results | "Geen resultaten.", plus "Maak '…' aan" when the field allows creating (`canCreateEntityFromOption`) |

Single select picks on the row and closes; it has no footer. Multi select
toggles rows and keeps the query; "Voeg toe" hands them all back.

## Behaviour and keyboard
- Focus lands in the search pill; the query searches as you type (250 ms).
- ↓ moves from the pill into the rows, ↑/↓ between rows, ↑ on the first row
  back to the pill. Enter or Space chooses a row. Escape closes.
- Choosing never saves: the entities join the inline search's draft, and the
  field saves when you leave it.
- The search is the inline autocomplete's: the field's `"*"` filter takes the
  query. A field without one shows its options unnarrowed.
- The create escape closes the picker first, then runs the inline search's
  create flow (its confirm is never stacked on the picker).
- Only the first page of results shows; the count says how many match.

## Accessibility
- The dialog is named by its title. Results are a `listbox`
  (`aria-multiselectable` for multi select), rows are `option`s with
  `aria-selected`.
- The count chip is `role="status"`; the spinner is `aria-hidden`.

## Copy
| NL | EN |
|---|---|
| Kies {type} | Choose {type} |
| Zoek… | Search… |
| Resultaten: {n} | Results: {n} |
| Geen resultaten. | No results. |
| Maak '{query}' aan | Create '{query}' |
| Annuleer / Voeg toe | Cancel / Add |

Keys: `inline-edit.browse-title`, `inline-edit.picker-*`, `inline-edit.cancel`.
