# In-Place Editing (per field / per block / per row)

Introduced by the `redesign/per-field-editing-poc` branch. Replaces the page-wide
edit mode on entity detail pages. Core rule: **edit scope = save scope =
validation scope** — a thing is edited in place iff it can be validated and
saved on its own.

## What it does

- **Per field** — `InlineFieldEditor.vue`: resting state renders the value as a
  full-width button with dashed underline + pencil (visible without hover).
  Click opens input + confirm/cancel ("Enter saves · Esc cancels"). Save issues
  ONE `mutateEntityValues` call carrying a single metadata key; only that field
  locks (spinner). Scoped validation (required cannot be emptied inline, regex
  from the input-field config) renders in the row with `role="alert"` and keeps
  the draft. Success = green flash + 10s undo affordance that writes the old
  value back as a NEW change (audit stays append-only).
- **Per block** — `useBlockEditor.ts` + `EntityElementWindowPanel.vue`: every
  window panel with editable fields gets an "Edit block" header button. The
  block opens as a small form; save diffs current `intialValues` against a
  snapshot and sends ONE mutation with only the changed keys (so per-property
  audit of untouched siblings is not bumped). Relation-backed fields ride along
  via `parseRelationValuesForFormSubmit` (editStatus-marked entries only).
  Cross-field/conditional rules run through `form.validateField` per field path.
- **Per row** — repeatable panels (`repetitionConfig`): the row is the
  edit/save/validation unit ("Edit row" / "Save row" / trash / "+ Add row").
  A row save writes the whole group array as one metadata entry
  (`{key: repetitionKey, value: [...rows]}`) — the same shape the old
  whole-page submit produced — and syncs `intialValues.<groupKey>` afterwards
  so view mode re-reads correctly.

## GraphQL operations

- `MutateEntityValuesDocument` for all three paths. Its resolver
  (`modules/baseGraphql/baseModule/baseResolver.ts`) calls
  `CollectionAPI.patchMetadata(id, metadata, collection)` — a real per-key
  PATCH — and `patchRelations`/`putRelations` for relations. No new backend
  work was needed.
- Collection is resolved from `route.meta.type`, falling back to
  `getChildrenOfHomeRoutes(config)` lookup by entity type, else
  `Collection.Entities`.

## Component → data flow

- `MetadataWrapper.vue` decides per field: global/scoped `isEdit` →
  classic `EntityElementMetadataEdit`; else `canInlineEdit` →
  `InlineFieldEditor`; else read-only view. `canInlineEdit` requires: input
  type ∈ {text, number, date}, vee path starts with `intialValues.`, not
  multilingual/formatter/repeatable (`repeatablePanelConfig?.isRepeatable`,
  NOT mere presence — the prop object is always passed), not in a modal,
  `fieldIsEditableByUser`.
- `EntityElementWindowPanel.vue` owns block/row edit state and passes
  `is-edit` per row to `WindowPanelContent`; while a block or row is editing,
  the classic edit inputs render and the inline pencils disappear.
- Empty non-required values dim to 45% opacity (`metadataValueIsEmpty` in
  `useMetadataWrapper.ts`); required-but-empty stay full opacity.

## Business rules & gotchas

- The backend skips required-enforcement on PATCH → the client-side required
  check in the inline editor is mandatory, not cosmetic.
- Repeatable form drafts live under
  `intialValues["repeatable-panels"][groupKey]` (object keyed by index);
  the seeded view array lives at `intialValues[groupKey]`. Both must stay in
  sync after a row save.
- `parseMetadataWithRepeatableValues` in `useFormHelper` has an index-0 bug
  (`if (!associatedMetadataItemIndex ...)`) — the block editor builds its own
  entries and avoids that path.
- The page-wide edit mode is GONE from detail pages (`MetadataEditButton.vue`
  and `modals/EditModal.vue` deleted). `useEditMode(formId)` scoped state
  still exists for modals, dynamic forms and guided flows.
- i18n keys (`inline-edit.*`, `block-edit.*`, `split-button.*`,
  `context-menu.*`) live in `modules/baseGraphql/translations` on the same
  branch name; components fall back to English literals via `te()` when the
  keys are not served yet.

## Dependencies

- vee-validate form registry via `useFormHelper` (forms keyed by entity id).
- `useRepeatableFields` for row add/remove bookkeeping.
- Tests: `InlineFieldEditor.test.ts`, `useBlockEditor.test.ts`,
  `ContextMenuActionsShell.test.ts`, `metadataValueIsEmpty.test.ts`.
