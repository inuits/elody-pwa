# History diff

Shows what changed between two versions of a record. Implemented by
`src/views/HistoryComparison.vue` and the components in
`src/components/history/`.

## When to use
- Comparing two versions of one entity side by side.
- Read-only. Nothing can be edited inside the diff.

## Anatomy
Two columns, one per version. Each column has a version header (author and
timestamp), then fields aligned by label. Changed values are marked with the
semantic diff colours: the old version in red, the new version in green.

## Tokens
| Token | Role |
|---|---|
| `--color-diff-old`, `--color-diff-old-bg`, `--color-diff-old-border` | old or removed values (semantic danger) |
| `--color-diff-new`, `--color-diff-new-bg`, `--color-diff-new-border` | new or added values (semantic success) |
| `--color-chip-neutral-{bg,text}` | unchanged relation chips |
| `--text-chip`, `--chip-padding`, `--radius-chip` | relation chips and the changed flag |

Diff text uses the semantic *ink* colours (`--color-danger-ink`,
`--color-success-ink`) rather than plain danger and success. Those two fall
just short of 4.5:1 on their own backgrounds.

## States
| Element | Unchanged | Old / removed | New / added |
|---|---|---|---|
| Relation chip | neutral chip | red chip | green chip |
| Renamed relation | — | red chip with the previous name + "renamed" | green chip with the current name + "renamed" |
| Rich-text block | default border | red border, red tint | green border, green tint |
| Changed flag | neutral "Unchanged" | — | green "Changed" |

There is no strike-through. Colour plus the position in the old or new column
carries the change.

## Accessibility
- The change never relies on colour alone. Added and removed relations
  carry hidden text ("added" / "removed"), and renamed relations show
  "renamed".
- All diff text pairs meet 4.5:1.

## Copy
| Key | EN fallback |
|---|---|
| `history.added` | added |
| `history.removed` | removed |
| `history.changed` | Changed |
| `history.unchanged` | Unchanged |
| `history.renamed` | (existing) |

## Not yet aligned with the handoff
These belong to a later subtask: one `role="table"` for both columns, a
"Toon alleen wijzigingen" toggle, a "Geen verschillen" state, "was X, nu Y"
announcements, and the panel chrome in `EntityHistoryWindowPanelContent.vue`.
