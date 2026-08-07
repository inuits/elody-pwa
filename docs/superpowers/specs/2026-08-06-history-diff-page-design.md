# History Diff Page — Design

**Status:** Approved for POC implementation (brainstorming session spanning 2026-08-05/2026-08-06). First implementation target: `ugent-aicap` client, `inscription` entity type only.

## Problem

A dedicated page showing an entity's current state next to a previous version, so a user can see what changed:

- Current state on the left, a selected historical version on the right.
- A dropdown to pick the historical version, labeled "Version 1", "Version 2", … sorted by update date.
- Changed fields visually highlighted (not just plain side-by-side).
- Entity-type-generic design (schema-driven, same spirit as `DynamicForm`), validated first against a real, non-trivial entity type (`inscription`).

## Constraints (explicit, from the user, refined over the discussion)

- No collection-api (REST) changes — no new request parameters like a `timestamp` query argument threaded through to collection-api.
- **BFF-level changes (GraphQL query documents, and resolver logic in `modules/baseGraphql`) are fine.** The thing to avoid is specifically the pattern where a client defines a duplicate GraphQL type per entity (e.g. `ProductionHistory`, a byte-for-byte copy of `Production`) just to make history queryable — i.e., no per-entity-type schema duplication.
- Must not break the existing history element (`HistoryDiffPreview.vue` / `useEntityDiff.ts`) — extend alongside it, don't modify it.
- For now, any new query/resolver logic lives directly in `modules/baseGraphql` (not a new dedicated module) — revisit moving it to its own module (peer to `baseGraphql`/`advancedFiltersModule`) later, once the shape of the logic is proven out.
- **POC scope:** `ugent-aicap` client, `inscription` entity type only. Generalizing to other types/clients (including vlacc's repeated-table fields, see below) is explicitly deferred.

## What already exists (don't rebuild)

- `EntitiesHistory` GraphQL query (`modules/baseGraphql/baseModule/baseSchema.schema.ts`) returns the same `Entity` type as the normal `Entities` query — full `intialValues`, `relationValues`, `entityView`. History rows are plain `Entity` objects with a synthesized `id`.
- `HistoryDiffPreview.vue` (`src/components/previews/`) + `useEntityDiff.ts` (`src/composables/`): existing side-by-side diff of two full `Entity` snapshots (currently adjacent history rows), rendered via the shared `EntityColumn.vue` component. Diffing is client-side: `dequal`-based per-field comparison, tags changed fields `pill|modified` / `pill|added`, rendered by `MetadataFormatterPill.vue`. This is the precedent for "reuse read-only display primitives, wrap in a dedicated diff-orchestration component" — the new page follows the same pattern rather than inventing a new rendering philosophy.
- `Entity(id, type, preferredLanguage)` — the live-entity query already used by the entity detail page (`EntitySingle.vue`), returns a fully hydrated `entityView`/`intialValues`, no separate fetch needed for "current state".
- Label hydration for single-value relation fields: `intialValues.keyValue(key, source: relations, metadataKeyAsLabel/relationEntityType/rootKeyAsLabel/formatter: "link|...")` → `fetchRelationEntity`/`processRelations` (`modules/baseGraphql/resolvers/intialValueResolver.ts`) does a live lookup of the related entity and extracts a label. Confirmed to work identically for `Entities`- and `EntitiesHistory`-sourced entities — resolves to the related entity's *current* label, which is acceptable per product decision (below).
- `processRelations` already fans out over every relation id in a multi-value relation and joins/pills the results — the reusable primitive behind the batch label resolver described below.

## Key findings that shaped the design

1. **`relationValues` (raw `{key, label, type, value}` grouped-by-type JSON) is unresolved by design, for live entities too** — `parseRelations`/`resolveRelations` never fetch a related entity to build a label. Do not build relation display on `relationValues` directly; it's only useful as the source of *ids* for set-diffing, not labels.

2. **Confirmed bug (not previously documented) in today's diff:** `getMetadataFields` (`src/helpers.ts:319`) + `useEntityDiff.ts` silently drop any relation field rendered as a multi-value `EntityListElement` panel (no `.key` → `undefined` diff key → never compared/rendered). Single-value relation fields via `keyValue(source: relations, ...)` (rendered as `PanelMetaData`) diff correctly today. Confirmed concretely on `ugent-aicap`'s `inscription`: `refLanguage`/`refScript` work; `refMultilingualCounterparts`/`refWords` (defined as `entityListElement` panels in `inscription.queries.ts`) are silently skipped by `HistoryDiffPreview` today. This page must handle these fields properly — it's the core "relations are complicated" pain point from the original ask.

3. `EntitiesHistory(type: History)`'s resolver (`doAdvancedHistoryEntitiesCall`, `modules/baseGraphql/sources/collection.ts:581`, marked `// TODO: redo or remove after the demo #139636`) discards `advancedFilterInputs` (hardcoded `[]`) and hardcodes `limit: 1000`. Only `advancedSearchValue` is still forwarded — likely how today's shipped history feature scopes to one entity; needs to be confirmed precisely during implementation, not assumed.

4. `ugent-aicap` has zero history UI wiring today, but its collection-api backend already writes full snapshots per entity type into `*_history` collections (e.g. `inscriptions_history`) via its own `_post_crud_hook` → RabbitMQ → consumer pipeline. Historical data for `inscription` already exists; this feature is additive on the frontend/GraphQL-query side only for this client.

5. **Repeated/table metadata fields (vlacc's `isbn_group` etc., via `InputFieldWithSubFields` or `repetitionConfig`) are plain metadata fields whose value is an array of structured objects.** Both vlacc edit-time mechanisms converge on the same persisted shape, so diffing only ever deals with one shape (an array of row-objects), not two. Diffing requires positional row-matching (no stable per-row identity), which is a known heuristic limitation, not something to solve generically now. **Out of scope for the `inscription` POC** (aicap doesn't use this pattern) — documented here so the design isn't blindsided by it later.

## Design

### Data flow

- **Current state (left column):** the existing live `Entity` query already used by the entity detail page. No new fetch.
- **Version list (for the dropdown):** `EntitiesHistory`, scoped to the target entity (exact scoping parameter to confirm per Finding 3), requesting only the minimal fields needed to build the dropdown (id + updated-date).
- **Selected version (right column):** the full comparison-field data for the picked version. Exact one-call-vs-two-phase mechanics to be settled during implementation against Finding 3's real behavior.

### Relation field handling

Two distinct mechanisms, matching the two relation shapes:

- **Single-value relations** (`refLanguage`, `refScript`, etc.): already diff correctly today via `keyValue(source: relations, metadataKeyAsLabel: ...)`. Reused as-is — request the same field for both current and selected-version fetches, diff the resolved label strings.
- **Multi-value/list relations** (`refWords`, `refMultilingualCounterparts`, today's broken `EntityListElement` case): compute the set diff (added/removed/unchanged ids) client-side from each snapshot's `relationValues[type]` — free, no query. Resolve display labels via a **new generic, batched resolver added to `modules/baseGraphql`**: something like `RelationLabelsForIds(ids: [String!]!, type: String): [KeyAndLabel]`, internally reusing the existing `fetchRelationEntity` label-extraction logic, exposed as one batch call. Generic across every entity type (parameterized by `type`, not a duplicated schema per entity) — satisfies the "no per-entity-type duplication" constraint while avoiding N separate per-id queries. One call resolves labels for every relation field's delta (and, where needed, the full current list) on the whole page, not per field.

### Diff computation

A small new comparison function, not a modification of `useEntityDiff.ts`: compares two flat `key → value` maps (current vs. selected version) using the same `dequal`-based approach and `pill|modified`/`pill|added` tagging already proven in `useEntityDiff.ts`. Kept separate so the existing `HistoryDiffPreview`/`useEntityDiff.ts` is untouched.

### Rendering — reuse vs. new components

Following the same "purpose-built for diffing" philosophy `MetadataFormatterPill.vue` already establishes at the scalar level:

- **Reuse as-is:** scalar metadata and single-value relations — existing pill formatter machinery.
- **New component — `RelationDiffList.vue`:** for multi-value relation fields. Not a variant of `BaseLibrary`/`EntityElementList.vue` (those exist for live browsing/interaction, not diff display). Takes `{added, removed, unchanged}` sets of `{id, label}` (labels from the batch resolver above) and renders them as a single unified list of chips, colored by status — one list, not two side-by-side lists, since matching list items positionally doesn't make sense for a set comparison.
- **Deferred (not in POC scope):** `DiffTableField.vue` for repeated/table metadata fields (vlacc-style) — positional row/cell diffing, reusing `TableRowInputField.vue`'s cell rendering where convenient.
- **Rich text / `WysiwygElement` fields:** no real diff — a coarse "this field changed" flag only, leaving inspection to the user. Cheap, honest about where automated diffing stops paying off. (Confirm whether `inscription` has any such fields during implementation; handle generically if so.)

### Page & entry point

- New page component, registered in `src/views/router.ts`'s `routeComponentConfig` allowlist.
- Route added for `ugent-aicap` (routes are per-client) at a path like `/:type/:id/history`.
- Entry point: a "History" tab/button on the entity detail page, navigating to the new route with the current `type`/`id`.

### Version dropdown

Built from the version list fetch: sorted by update date ascending, labeled "Version 1" (oldest) … "Version N" (most recent historical snapshot before current). Current live state is shown separately, always on the left, not itself a dropdown entry.

### Scope confirmed with user

- Compare current vs. one past version only (not two arbitrary past versions).
- Relation labels reflect the related entity's *current* state, not what it was historically.
- Entity-level history only; mediafile history out of scope.
- POC targets `inscription` on `ugent-aicap` only.

## Edge cases / error handling

- Entity with zero history entries → dropdown empty/disabled, show current state only with a "no history yet" message.
- More than 1000 history entries → dropdown truncates at the resolver's hardcoded limit (Finding 3); not fixed by this feature.
- Selected version's data fails to resolve → inline error state on the right column rather than failing the whole page.

## Testing

- Unit tests (Vitest, per project TDD convention) for: the new flat-map comparison function, the batched relation-label resolver's client-side set-diff logic, the dropdown's version-labeling/sorting logic, `RelationDiffList.vue`, and the new page component's query wiring (mocked Apollo responses) — covering both single-value and multi-value relation fields explicitly.
- Backend: a test for the new `RelationLabelsForIds` resolver in `modules/baseGraphql` (reuses existing `fetchRelationEntity` logic, so mostly needs coverage for the batching/id-list handling itself).

## Out of scope

- Fixing `EntitiesHistory`'s hardcoded `limit: 1000` / dropped `advancedFilterInputs` (Finding 3) — the new page works within this existing behavior.
- Historically-accurate relation labels.
- Comparing two arbitrary past versions against each other.
- Mediafile-level history.
- Any change to `useEntityDiff.ts` / `HistoryDiffPreview.vue` — they remain as-is.
- Repeated/table metadata field diffing (vlacc-style) — documented (Finding 5) but not implemented in this POC.
- Extracting the new resolver logic into its own module — stays in `modules/baseGraphql` for now.

## Implementation setup

- Repos expected to change, each on a branch named `feat-139250-full-history`:
  - `inuits-dams-pwa` — new page/route/components (`RelationDiffList.vue`, new comparison composable), router registration.
  - `modules/baseGraphql` — new `RelationLabelsForIds`-style batched resolver.
  - `clients/ugent-aicap/client-frontend/inuits-dams-graphql-service` — route entry for `inscription`, any new query fragment needed for the comparison field list.
- Next step: `writing-plans` skill to turn this into a concrete implementation plan for the POC.

## Open items for the implementation plan

- Confirm exactly which parameter (`advancedSearchValue`, most likely) scopes `EntitiesHistory(type: History)` results to a single entity.
- Decide one-fetch-with-full-fields-for-dropdown vs. two-phase fetch.
- Exact GraphQL shape/naming for the batched relation-label resolver and where it's wired into `inscription`'s query fragment.
- Confirm whether `inscription` has any `WysiwygElement` fields needing the coarse-changed-flag treatment.
