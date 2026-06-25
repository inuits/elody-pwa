# Guided Multi-Entity Creation Flow (repetitiveForm)

**Files:** `src/components/repetitiveForm/` (GuidedFlowModalHost, RepetitiveFlow, RepetitiveStepField, RepetitiveOverview, RepetitiveStepModal), `src/composables/useRepetitiveForm.ts`, `src/composables/useRepetitiveFlowConfig.ts`

### What it does
A config-driven wizard (modal) that creates a composite entity by walking the user through N picker/create **steps** (a "branch", e.g. Work → Expression), optionally repeating the branch, and ending with a **finalize** form that creates a container entity linked to everything that was staged (e.g. an omnibus Manifestation with `refOmnibus` to all expressions and `is_omnibus: true`). The flow's structure — steps, forms, picker queries, scoping, relations, prefills — comes entirely from a self-describing GraphQL query; the components are generic and contain no client/domain knowledge.

Persistence is **create-per-step**: each "create new" inside a step immediately persists that entity via the step form's own `CreateEntity`; the flow only stages ids/labels and wires relations.

### GraphQL Operations
- **Flow config query** (e.g. `GetRepetitiveFormForOmnibus`): named by the menu item's `formQuery`; loaded by name via `useImport().loadDocument(name)` and executed with `apolloClient.query({ fetchPolicy: "no-cache" })` in `GuidedFlowModalHost`. It is a self-describing query against `GetRepetitiveForm: RepetitiveForm` (no args; echo resolvers in `modules/baseGraphql/baseModule/baseResolver.ts`).
- **Step picker query** (`pickerQuery`, e.g. `GetWorks`) + optional **picker filters query** (`pickerFiltersQuery`, e.g. `GetGuidedFlowExpressionsFilters`) — loaded by `EntityPickerComponent`.
- **Step / finalize create forms** (`createForm`, e.g. `GetBasicReadingCreateForm`) — regular DynamicForm self-describing form queries; submit via `CreateEntity`.

### Flow config contract (self-describing query)
Each step is an **aliased** `steps` field; the echo list resolvers return `[parent ?? {}]` so each alias yields a single-element array, collected client-side in query-field order:

```graphql
query GetRepetitiveFormForOmnibus {
  GetRepetitiveForm {
    label(input: "repetitiveForm.omnibus-title")
    repeatable(input: true)
    work: steps {
      key(input: "work") label(input: "...") entityType(input: "work")
      createForm(input: "...") pickerQuery(input: "...") pickerFiltersQuery(input: "...")
      acceptedTypes(input: ["work"]) skipSearchIfPriorIsNew(input: false)
      maxSelection(input: 1)
      overviewFields(input: [{ key: "original_headtitle", label: "metadata.labels.headtitle" } ...]) { key label }
    }
    expression: steps {
      ... scopeToRelationOf { step(input: "work") relationType(input: "refWork")
            filterKey(input: "vlacc:1|properties.ref_work.value") }
      relations { to(input: "work") relationType(input: "refWork") createWhen(input: "onCreate") }
      skipSearchIfPriorIsNew(input: true)
    }
    finalize {
      label(input: "...") entityType(input: "manifestation") createForm(input: "...")
      relations { toAllOf(input: "expression") relationType(input: "refOmnibus") createWhen(input: "onFinalize") }
      prefillMetadata { key(input: "is_omnibus") value(input: true) }
    }
  }
}
```

`toRepetitiveFormConfig` (`useRepetitiveFlowConfig.ts`, pure function) maps the raw response: strips `__typename`, flattens the aliased arrays into ordered `steps`, drops `""`/`0`/empty-array echo defaults for optional inputs (`label`, `pickerQuery`, `pickerFiltersQuery`, `scopeToRelationOf.filterKey`, `maxSelection`, `overviewFields`), carries `linear` (coerced to boolean, default `false`) and `routeToStep` (dropped when the empty-string echo).

**Two flow shapes:**
- **Overview/finalize flow** (e.g. omnibus): `repeatable` branches collected on an overview, ending with a `finalize` form that creates a container entity. Opens on the overview.
- **Linear flow** (`linear: true`, e.g. work→expression→manifestation): a single non-repeatable pass with no container. Opens directly on step 1, finishes after the last step, and routes to the staged entity named by `routeToStep` (defaults to the furthest staged step). No overview, no finalize. `linear` and `repeatable` are orthogonal flags — a `repeatable: false` flow can still be an overview/finalize flow.

**Config types are the codegen types** — `RepetitiveForm` / `RepetitiveStep` / `RepetitiveFinalize` / `RepetitiveStepOverviewField` etc. are imported from `@/generated-types/queries` (driven by the `baseSchema.schema.ts` types), not re-declared. `useRepetitiveForm.ts` only owns the runtime-state types that have no schema shape (`StagedEntity`, `StagedEntityDetail`, `RepetitiveBranch`). The schema types the echoed scalars as plain `string`, so `entityType` is cast to `Entitytyping` at the `createEntity`/staging boundary.

### Component → Data Flow
1. Menu item (`typeLink.modal { typeModal: GuidedFlow, formQuery: "GetRepetitiveFormForOmnibus" }`, with `entityType` for the permission check) → `useBaseModal.openModal` stores `formQuery` → `GuidedFlowModalHost` (mounted in `App.vue`) watches the modal open state, fetches + maps the config, renders `RepetitiveFlow`.
2. `RepetitiveFlow` owns the view state (`overview` → `step` → … → `finalize`) and the modal chrome (title `repetitiveForm.step-of`, numbered step strip, flow-level back button). It opens on the **overview**.
3. `RepetitiveOverview` lists staged branches (ListItem-style rows: number, per-step label + entity label + detail lines, per-row delete) and the add/finish buttons.
4. `RepetitiveStepField` renders the active step: picker view (`EntityPickerComponent` in `Emit` mode) with a "create new" button on top, or create view (`DynamicForm` with `emitEntityCreated`) with a "back to search" button in the same spot.
5. `useRepetitiveForm` (module-scope singleton store) holds `flowConfig`, `currentStepIndex`, `currentBranch`, `branches` and the pure helpers: `buildScopeFilter`, `shouldSkipSearch`, `buildCreatePrefill` (onCreate relations → `relationValues`), `buildFinalizePrefill` (onFinalize relations + `prefillMetadata` → `intialValues`), `removeBranch`, `goToPreviousStep`, `describePickedItem` / `describeCreatedEntity` (label + display details for the overview).
6. Finalize: `DynamicForm` with `prefilledFormValues = buildFinalizePrefill()`; on `entityCreated` the host routes to `{ name: "SingleEntity", params: { id, type } }`.
7. Linear terminal (no finalize): `RepetitiveFlow.start()` opens on `view='step'` when `store.isLinear()`; `advance()` on the last step emits `finished` with `store.routeTarget()` (`{ id, type }`) instead of showing the overview/finalize. The host routes to that entity — for the work→expression→manifestation flow, back to the **work**.

### Step semantics
- **Create-only step (no `pickerQuery`)**: a step that omits `pickerQuery` has nothing to search, so it opens directly in the create view and never renders the `EntityPickerComponent` (`skipSearch` is derived as `shouldSkipSearch(step) || !step.pickerQuery`). Combined with `repeatable: true` and no `finalize`, this gives a "create as many entities as you want" flow: overview → add → create form → overview (repeat) → finish.
- **Finish without `finalize`**: when the flow has no `finalize` config, the overview's **Finish** button just emits `close` (the modal closes). Each created entity is already persisted per-step, so there is nothing left to assemble — the flow does not open the (empty) finalize view.
- **`scopeToRelationOf`**: the step's picker is narrowed to entities related to the prior step's staged entity. The filter is `{ type: selection, key: [filterKey ?? "elody:1|relations.<relationType>.key"], value: [priorId], match_exact: true }`, passed as `computedFilters` (predefined filters) to the picker.
- **`skipSearchIfPriorIsNew`**: when the scoped prior entity was just created (`isNew`), the step opens directly in the create view (no picker, no back-to-search) — a brand-new work can't have existing expressions.
- **`relations` (`createWhen`)**: `createWhen` is the `RepetitiveRelationTrigger` enum (`onCreate` | `onSelect` | `onFinalize` | `always`). The link is persisted the **same reliable way** whether the step's entity was created or picked: once it's staged, `useManageEntities.addRelations({ entityId: thisStepEntityId, relations: [{ key: priorEntityId, type: relationType, editStatus: New }] })` runs the standard `MutateEntityValues` mutation with `updateOnlyRelations: true` (metadata untouched) — collection-api creates the inverse. The trigger only selects *which* relations apply: `useRepetitiveForm.linkAfterCreate(step)` applies `onCreate`/`always` (awaited in `RepetitiveFlow.onCreated`); `useRepetitiveForm.linkOnSelect(step)` applies `onSelect`/`always` (awaited in `onSelected`). The step's entity always holds the relation pointing to the prior step. (Earlier approaches — a `BulkAddRelations` mutation, and relying on the create form's `relationValues` prefill to born-link — were unreliable; the post-hoc `MutateEntityValues` path is used for both flows. The `relationValues` prefill from `buildCreatePrefill` still runs harmlessly and is idempotent.)
- **`maxSelection`**: picker selection cap (1 for omnibus steps). Wired through `EntityPickerComponent`'s `selectionLimit` prop → `useBulkOperations.setBulkSelectionLimit` (checkboxes beyond the limit are disabled); the limit is lifted again on picker unmount because the bulk context is shared module state.
- **`creatableTypes`** (steps *and* finalize): a list of `{ label, entityType, createForm }` the create screen can produce. `RepetitiveCreateButton` renders the "+ create new" button; with >1 type it opens a `BaseContextMenu` dropdown (one `BaseContextMenuItem` per type, like `BulkOperationsActionsBar`'s `openDropdown`/`subOptions`), and the chosen type's `createForm` is loaded into the inline `DynamicForm` (keyed by `step.key:entityType` so switching type remounts). A single type (or none → a one-element fallback derived from the step's own `createForm`) skips the dropdown. `skipSearch` steps with multiple types show the chooser first. The created entity's concrete subtype flows back via the `created(entity, entityType)` emit → `recordCreated` (`StagedEntity.type = entityType ?? step.entityType`). Pickers are unaffected — they still fetch the supertype via filters.
- **`overviewFields`**: which entity values the overview row shows for the step (each `{ key, label }`; `label` is a translation key). The value is read from the staged entity's `values` snapshot (`intialValues` for both picked and created entities — so the picker fragment / create form must expose those keys). Empty values and the field whose value duplicates the row's main label are skipped. When a step has no `overviewFields`, the overview falls back to the details derived by `describePickedItem`/`describeCreatedEntity`.
- **Back navigation**: flow-level back button — on step > 0 it goes to the previous step; on step 0 it returns to the overview and **discards the branch in progress** (already-created entities stay in the database). The finalize view has its own back-to-overview button. The step back button is rendered into `RepetitiveStepField`'s `#actions` slot so it shares one row with the step's own "create new" / "back to search" buttons.
- **`showBackButton`** (per step, default `true`): hides the flow-level back button for that step when set to `false`. It's an additional gate on top of the existing rule (linear step 0 has no back button anyway), so a step opts out with `showBackButton(input: false)`; omitting it keeps the button shown.
- **Close confirmation**: closing the flow modal (X button or ESC — `RepetitiveStepModal` intercepts the native `<dialog>` `cancel` event with `@cancel.prevent`) routes through `RepetitiveFlow.requestClose`. When there is staged progress (`branches.length > 0` or the current branch has entities) it opens the global `Confirm` modal (`useConfirmModal.initializeConfirmModal`, `translationKey: "close-guided-flow"`) and only emits `close` on confirm; with nothing staged it closes immediately. The `Confirm` modal is a `BaseModal` `<dialog>` opened *after* the flow dialog, so it sits above it in the native top layer. **Reset on close**: closing is driven by `props.open` going false (the host's `isOpen && config.steps.length > 0`). `GuidedFlowModalHost` clears its `config` to the empty config on close — otherwise the stale previous-flow config would briefly keep `props.open` true on the next open and let `RepetitiveFlow.start()` run with the wrong config (this showed the prior flow's last step on reopen). With config cleared, `props.open` goes false → `RepetitiveFlow` runs `reset()` → `store.resetFlow()` + clears `view`/`selectedFinalizeType`; the next open refetches the correct config and `start()`s clean. (`RepetitiveFlow` stays permanently mounted — the modal is **not** unmounted per open, because mounting/unmounting the native `<dialog>` `showModal()` leaves the top layer stuck and freezes the page.)

### Business Rules & Gotchas
- **Echo list resolvers must return `[parent ?? {}]`** (`steps`, `relations`, `prefillMetadata`) — graphql-js requires an iterable for list types; returning the parent object yields "Expected Iterable" and a null query result.
- **`DynamicForm` and `EntityPickerComponent` are keyed per step** (`:key="step.key"`) in `RepetitiveStepField`. The picker loads its custom query only in `onMounted`; DynamicForm reuse leaks the previous step's vee-validate field registrations (submit then sends empty metadata).
- **`emitEntityCreated` on DynamicForm**: the success path emits the created entity and only calls `deleteForm(...)` — *not* `closeAndDeleteForm()`. `closeAndDeleteForm → resetUpload → reinitializeDynamicFormFunc()` re-fetches the *previous* form's definition into the module-scoped `dynamicForm` state and overwrites the next step's fields, leaving phantom required-field registrations that make `form.validate()` fail with an empty errors object (silent dead submit button).
- **Filter merge** (`FiltersBase.vue`): predefined filters (e.g. the scope filter) *narrow* a custom filters query's own filters; both are sent. The filter **matcher mapping must also be fetched when predefined filters are present**, otherwise `matchers` stays empty and the whole filter panel renders blank even though filtering works.
- **Modal-hosted pickers** need `:should-use-state-for-route="false"` or they inherit the home route's saved filter state.
- The picker checkbox items (`ListItem`/`TableViewRow`) carry `intialValues` alongside `teaserMetadata` so the flow can show display values: teaser entries are `{ label, key }` and the value lives at `intialValues[key]`.
- The flow modal is **one** `<dialog>`; picker and forms render as views inside it — nested dialogs would steal the `.base-modal--opened` teleport target used by dropdowns/tooltips.
- `relationValues` prefills use `editStatus: "new"`; collection-api creates the inverse relations.
- Permissions: the menu item's `entityType` (e.g. `omnibus`) is a `FrontendEntitytyping`, which the PermissionMapping resolver skips — real environments (without `IGNORE_PERMISSIONS`) need a permission story for it.

### Dependencies
`useBaseModal` (GuidedFlow modal type + `formQuery` transport), `useImport.loadDocument` (query-by-name), `DynamicForm` (+ `emitEntityCreated` prop), `EntityPickerComponent` (Emit mode, `selectionLimit`), `useBulkOperations` (selection + limits), `FiltersBase`/`useFiltersBaseNew` (filter pipeline), `useManageEntities` (`createEntity` for create-per-step/finalize; `addRelations` runs `MutateEntityValues` with `updateOnlyRelations` for link-on-select), `vue-i18n` (all labels are translation keys from the config).
