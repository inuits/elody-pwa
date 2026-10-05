# Chip and badge

Small labelled values: status chips, entity-type badges and relation chips.
Implemented by `src/components/metadata/MetadataFormatterPill.vue` (the
`pill` metadata formatter, driven by `formattersSettings` in the client
config). Selected-value chips in the dropdown and the autocomplete tag input
use the same tokens.

## When to use
- **Chip:** a short status or category value ("Concept", "Gepubliceerd").
- **Badge:** an entity type shown as one letter (W, E, M), always with its
  full name available to screen readers.
- **Relation chip:** a linked entity. Clicking it navigates.
- Not for actions. A chip never triggers a change by itself.

## Anatomy
- **Chip:** optional 14px icon, then the label.
- **Badge:** one letter, centred, at least as wide as it is high.
- **Nested chip:** a relation label with its own small value chips inside
  (for example an organisation with the person's functions).

## Tokens
| Token | Role |
|---|---|
| `--text-chip`, `--chip-padding` | chip size and padding |
| `--text-chip-lg`, `--chip-padding-lg` | large chip (comparison columns) |
| `--text-badge`, `--badge-size`, `--badge-padding-x` | badge |
| `--radius-chip` | all shapes |
| `--color-badge-tone{1,2,3}-{bg,text}`, `--color-badge-subtype-*` | tones |
| `--color-chip-neutral-{bg,text}` | fallback when config gives no colours, and default relation pills |
| `--color-chip-relation-{bg,text}` | relation chips, selected-value chips |

## Configuration
A value's chip is looked up by its **raw** value, never its translation:
`formattersSettings.pill[<value>]`, or `pill|<type>` to force one type.

| Key | Effect |
|---|---|
| `tone` | `tone1`, `tone2`, `tone3` or `subtype`; colours come from the tone tokens |
| `background`, `text` | explicit colours (legacy; prefer `tone`) |
| `icon`, `spin` | leading Unicon, optionally spinning |
| `shape: "badge"` | render as a letter badge |
| `letter` | the badge letter (default: first letter of the translated value) |

`pill|auto` renders the relation chip.

Tones are assigned to entity types in config order and never reshuffled.
Each client maps its own entity types to the three tones. Never add a
fourth tone.

## Variants and sizes
`size`: `sm` (default) or `lg`. `lg` is only used in comparison columns.

## Accessibility
- Meaning never relies on colour alone: chips carry text, and badges carry a
  letter plus an accessible name.
- A badge is `role="img"` with `aria-label` set to the full type name
  ("Manifestatie").
- Nested value chips carry a `title` naming the field they come from
  ("Functie: Programmator").
- Selected-value chips have a remove button named "Remove {value}"
  (`autocomplete.remove-chip`).
- All tone and chip text pairs meet 4.5:1, see
  [accessibility](../foundations/accessibility.md).

## Implementation
```ts
// client config
pill: {
  concept: { tone: "tone2" },
  manifestation: { tone: "tone3", shape: "badge", letter: "M" },
}
```
```vue
<MetadataFormatterPill formatter="pill" :label="value" translation-key="entity-types.$value" />
```
Tests: `src/components/metadata/tests/MetadataFormatterPill.test.ts`.
