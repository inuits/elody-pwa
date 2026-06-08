## Dynamic Forms (DynamicForm.vue + useDynamicForm)

**Files:** `src/components/dynamicForms/DynamicForm.vue`, `src/components/dynamicForms/useDynamicForm.ts`

### What it does
Renders a fully GraphQL-defined form (fields, upload zones, entity pickers, action buttons) fetched at runtime, and executes the configured action (create entity, upload files, OCR, CSV download/reorder, metadata update) when the user clicks the form's action button. The form's structure is **not hardcoded** — it comes entirely from a named GraphQL query whose name is passed in via `dynamicFormQuery`.

### GraphQL Operations
The form's query and action mutation are resolved **by name at runtime** — not statically imported — via `useImport().loadDocument(queryName)`. So the actual operations vary per form definition.

- **`<dynamicFormQuery>`** (e.g. `GetDynamicForm`) — fetches the entire form definition (tabs, fields, upload containers, form actions). Loaded by name in `useDynamicForm.getDynamicForm()`, executed with `apolloClient.query`. The query name is the `dynamicFormQuery` prop.
- **`field.actionQuery`** — the action's mutation/query, also loaded by name (`getQuery(field.actionQuery)`). Dispatched through `performSubmitAction` / `performDownloadAction` / `performUpdateMetadataAction` / `performOcrAction` in `useDynamicForm.ts` depending on `actionType`.
  - Submit path → `CreateEntity` mutation (response read at `.data.CreateEntity`).
  - Download path → query returning a download entity (`apolloClient.query`).
  - OCR path → query with `{ assetId, operation, language }`, `fetchPolicy: "no-cache"`.
  - Update-metadata path → mutation with `{ entityType, csv }`.
- **`MutateEntityValuesMutation`** (`MutateEntityValuesDocument`) — the **only statically imported** mutation. Used solely in the OCR action (`startOcrActionFunction`) to persist edited metadata/relations on the existing entity *before* triggering OCR.

### GraphQL Schema (baseGraphql) — the self-describing form contract
Schema SDL: `modules/baseGraphql/baseModule/baseSchema.schema.ts`. Resolvers: `modules/baseGraphql/baseModule/baseResolver.ts`.

**Critical architectural fact: the form is a "self-describing query".** `GetDynamicForm` is declared as `GetDynamicForm: Form!` with **no arguments**, and its resolver returns `{}`. Every field on `Form`/`FormTab`/`FormFields`/`FormAction`/`InputField`/`PanelMetaData`/`UploadField` is a resolver that simply **echoes back its own `input:` argument** (e.g. `label: (_s,{input}) => input || ''`, `actionType: (_s,{input}) => input || Submit`). So the *entire form definition lives in the client's GraphQL query document* — the field arguments ARE the config. The `dynamicFormQuery` prop names that client-side document (in `clients/<client>/.../src/queries/*.queries.ts`). There is no server-side form store. To change a form, you edit the query document, not a resolver.

**Form shape (types):**
```
Form { label(input), infoLabel(input), modalStyle(input: ModalStyle!), formTab: FormTab! }
FormTab { formFields: FormFields!, formKey(input), label(input), relationType(input) }
FormFields { metaData: PanelMetaData!, uploadContainer: UploadContainer, action: FormAction }
```
(The PWA flattens `formFields` by `__typename`; multiple tabs each carry `formKey`/`relationType` used by `submitAllFormTabs`.)

**`FormAction` fields (drive the action button):**
`label`, `icon(DamsIcons)`, `actionType(ActionType)`, `actionQuery(String)` (name of the mutation/query to load by name), `endpointInformation(EndpointInformationInput)`, `creationType(Entitytyping)` (defaults `BaseEntity`), `showsFormErrors`, `actionProgressIndicator: ActionProgress`.

**`ActionType` enum (13 values):** `submit`, `submitWithUpload`, `upload`, `uploadWithMetadata`, `uploadWithOcr`, `download`, `ocr`, `endpoint`, `uploadCsvForReordening` (sic), `updateMetadata`, `submitWithExtraMetadata`, `nextFormTab`, `previousFormTab`, `submitAllFormTabs`.

**`BaseFieldType` enum (field renderers):** `baseCheckbox`, `baseColorField`, `baseTextField`, `baseNumberField`, `baseDateField`, `baseDateTimeField`, `baseTextareaField`, `baseResizableTextareaField`, `baseFileUploadField`, `baseCsvUploadField`, `baseEntityPickerField`, `csvEntityTypeTypeField`, `baseFileSystemImportField`, `baseMagazineWithMetsImportField`, `baseMagazineWithCsvImportField`, `baseMediafilesWithOcrImportField`, `baseXmlUploadField`, `baseExcelUploadField`. Note `InputField.type` is a free `String!`, not the enum — the PWA compares against `BaseFieldType`.

**`UploadFlow` enum:** `updateMetadata`, `csvOnly`, `excel`, `mediafilesOnly`, `mediafilesWithRequiredCsv`, `mediafilesWithOptionalCsv`, `uploadCsvForReordening`, `mediafilesWithOcr`, `optionalMediafiles`, `xmlMarc`. (`isLinkedUpload` in the PWA = `mediafilesOnly` or `optionalMediafiles`.)
**`UploadFieldType`:** `batch`, `single`, `reorderEntities`, `editMetadataWithCsv`. **`UploadFieldSize`:** `small`, `normal`, `big`.
**`OcrType`:** `pdf`, `txt`, `alto`, `manualUpload` (PWA: `pdf` → operation prepended with `alto`; `manualUpload` → skip OCR query).

**`InputField`** (selected): `type: String!`, `validation(ValidationInput): Validation`, `options: [DropdownOption]`, `subFields`, `relationType`, `fileTypes: [FileType]`, `maxFileSize: String`, `maxAmountOfFiles: Int`, `uploadMultiple`, `relationMetadataFromFormFields: [RelationMetadataFromFormField]`, advanced-filter inputs for option retrieval, `hasVirtualKeyboard`/`virtualKeyboardConfig`.

**`PanelMetaData`** (selected): `key: String!`, `label`, `unit(Unit!): Unit!`, `defaultValue`, `disabled`, `hiddenField(HiddenFieldInput): HiddenField`, `nonEditableField`, `showOnlyInEditMode`, `isMultilingual`, `colSpan`, `onlyForEntityTypes(input: [Entitytyping!])` (← powers `fieldTypeMap`/per-type filtering in the PWA), `copyValueFromParent`, `repetitionConfig`, `can`/`canEdit` (permissions).

**Validation** (`ValidationRules` enum): `required`, `has_required_relation`, `has_one_of_required_relations`, `has_one_of_required_metadata`, `regex`, `email`, `url`, `numeric`, `no_xss`, `max_date_today`, `existing_date`, `alpha*`, `customValue`. Plus conditional `required_if`/`available_if` (`Conditional { field, value, ifAnyValue }`). `ValidationFields` enum names the vee-validate namespaces incl. the canonical misspelling `intialValues`.

**Submit/mutation input types** (used by action queries, defined in this schema):
```
EntityInput { title, id, type, metadata: [MetadataFieldInput], relations: [BaseRelationValuesInput], identifiers: [String] }
BaseRelationValuesInput { key, label, type!, value, editStatus: EditStatus!, metadata, teaserMetadata, is_primary, is_primary_thumbnail, is_ocr, operation, lang, roles, inheritFrom }
EntityFormInput { metadata: [MetadataValuesInput!]!, relations: [BaseRelationValuesInput!]!, updateOnlyRelations: Boolean }   # used by mutateEntityValues
EditStatus = new | changed | deleted | unchanged
```

**`CreateEntity` is NOT in baseGraphql.** The `submit*` action queries reference a `CreateEntity` mutation defined **per-client** (e.g. `clients/<client>/client-frontend/.../src/queries/*.queries.ts`). baseGraphql only defines the *infrastructure* mutations below.

### Resolver → Service Map (verified)
baseGraphql resolvers proxy to the `CollectionAPI` dataSource (→ collection-api Flask REST):

| GraphQL op | Resolver behavior | CollectionAPI call(s) |
|---|---|---|
| `GetDynamicForm` | returns `{}`; all fields echo their `input:` arg | none (pure echo) |
| `mutateEntityValues` (static `MutateEntityValues`, OCR path) | splits metadata vs relations; `updateOnlyRelations` skips metadata | `patchMetadata`; relations: `putRelations` if any `editStatus==deleted` (full replace via `buildMergedRelations`), else `patchRelations` for new/changed; then `getEntity` to return fresh entity |
| `updateMetadataWithCsv` (`updateMetadata` action) | — | `updateMetadataWithCsv(entityType, csv)` |
| `CreateEntity` (`submit*` actions) | **client-defined resolver**, not in baseGraphql | client's CollectionAPI create |

`mutateEntityValues` gotchas: empty-array metadata values are coerced to `''`; values whose `formatter` starts with `pill` are flattened to `value.label` before patching. The PWA passes `tenantId: selectedTenant` on submit and `collection` on the OCR mutation.

### Component → Data Flow
- `DynamicForm.vue` owns nothing query-wise itself; it delegates fetching to **`useDynamicForm`** (a module-level singleton — `dynamicForm`, `dynamicFormLoaded`, `isPerformingAction` are module-scoped refs shared across all instances).
- `dynamicFormQuery` prop → `getQuery()` (via `useImport`) → `getDynamicForm(document, tabName)` → stores result in `dynamicForm.value` (keyed by `tabName` when in multi-tab mode).
- `formFields` computed flattens `FormTab.formFields` (or treats the form as a single implicit tab). `getSortedFieldArray` sorts so `FormAction` (buttons) render last.
- Field rendering is `__typename`/`inputField.type`-switched: `PanelMetaData` → `MetadataWrapper`, `UploadContainer`/`UploadField` → `UploadInterfaceDropzone`, `BaseEntityPickerField` → `EntityPickerComponent`, import field types → `ImportWrapper`, `FormAction` → `DynamicFormUploadButton` or `BaseButtonNew`.
- Form state lives in **vee-validate** (`useForm`), namespaced under `intialValues` and `relationValues` (note the **misspelling `intialValues`** — it's the actual key everywhere). Form instances are registered/retrieved via `useFormHelper` (`createForm`/`getForm`/`deleteForm`) keyed by `formId` (= `formKey ?? dynamicFormQuery`).
- Action click → `performActionButtonClickEvent(field)` maps `field.actionType` to one of the `*ActionFunction`s.

Key composables: `useDynamicForm` (fetch/execute), `useFormHelper` (vee-validate form registry, relation parsing), `useUpload`/`useUploadState` (file upload + reorder CSV), `useModalActions` (`extractActionArguments`, callbacks, parent id), `useEntityPickerModal`, `useImport` (load query docs by name), `useEditMode`, `useErrorCodes`, `useBaseModal`, `useTenant`.

### Downstream services (collection-api & beyond)
`CreateEntity` (client resolver) → collection-api create endpoint → publishes `entity_changed` on AMQP. Upload actions hit the storage/upload endpoint (via `useUpload`, not GraphQL). OCR action query → `ocr_request` event → ocr-service. CSV reorder → collection-api import; update-metadata → `updateMetadataWithCsv`. (The exact collection-api routes for the client `CreateEntity` resolver weren't traced — see the per-client `*.queries.ts` + that client's resolver/dataSource.)

### Business Rules & Gotchas
- **`intialValues` is a typo baked into the contract** — it's the vee-validate key for all metadata field values. Do not "fix" it.
- **`ttl` field is special-cased**: its value is run through `calculateFutureDate()` before submit (it's a relative duration, not an absolute date).
- **`onlyForEntityTypes` field filtering**: `fieldTypeMap` maps field key → allowed entity types. When creating, only metadata keys whose `onlyForEntityTypes` includes the target type are included (`getMetadataKeysToInclude`). With `onlyAllowedFields=true` (mediafile upload path), a field with no type restriction is **excluded**; without it, an unrestricted field is **included**. Opposite defaults — easy to get backwards.
- **Empty metadata is dropped**: `extractMetadataFromValues` filters out any `{value}` that is falsy.
- **Module-singleton state**: `dynamicForm`, `dynamicFormLoaded`, `isPerformingAction` are shared across every `DynamicForm` instance. Multiple simultaneous forms collide unless distinguished by `tabName`. `onUnmounted` resets `dynamicFormLoaded` and upload state globally.
- **Action button sort**: any field with `__typename === "FormAction"` always sorts last regardless of definition order.
- **Two button components**: `DynamicFormUploadButton` handles the upload-family action types (`Upload`, `UploadWithMetadata`, `UploadWithOcr`, `UploadCsvForReordening`, `UpdateMetadata`, `SubmitWithUpload`); everything else uses `BaseButtonNew`. The big `v-if` lists must stay in sync — note `UploadCsvForReordening` is misspelled in the enum.
- **OCR**: if `ocr_type === ManualUpload`, it persists metadata via `MutateEntityValues` and returns early (no OCR query). If `ocr_type === Pdf`, the operation array is prepended with `Alto` (so PDF implies ALTO+PDF).
- **`SubmitWithUpload` caches the created entity** in `createdEntity` ref so a retry after an upload failure doesn't double-create — it reuses the existing entity and only re-runs the upload.
- **Edit mode short-circuit**: `submit`/`submitAllFormTabs` first check `useEditMode`; if editing and `isDisabled` after save, the form closes with a "not updated" warning and never creates.
- **Dirty-guard**: a `watch` on `intialValues` toggles the modal close-confirmation based on `form.meta.dirty`; `formClosing` is set true once validation passes to suppress the confirm on successful submit.
- **`prefilledFormValues`** are applied via a **100ms `setTimeout`** after `dynamicFormLoaded` — acknowledged hack (form creation from metadata fields isn't awaited). Race-prone.
- **`submitAllFormTabs`** iterates `props.allFormKeys`, creates an entity per tab, and chains them by calling `setArgumentForSubmitAllFormTabs(entity.id, allFormRelationTypes[i])` so later tabs relate to earlier-created entities. Navigates to `entities[0]`.
- **Tenant**: every `CreateEntity` submit injects `tenantId: selectedTenant`; `getTenants()` is refetched after creation. Button label appends tenant name unless `creationType === tenantDefiningTypes`.
- **`endpoint` action** bypasses GraphQL entirely — raw `fetch` to `endpointInformation.endpointName`; only HTTP 200 is treated as success; `DownloadResponse` triggers a client-side CSV blob download.

### Dependencies
- **baseGraphql** for the form-definition query and action resolvers; **collection-api** for entity CRUD, CSV import/reorder, metadata update; **ocr-service** (via OCR query → AMQP); **storage/upload** endpoints (via `useUpload`).
- **vee-validate** for all form state/validation; **Apollo Client** (`apolloClient` from `@/main`) for all GraphQL.
- Triggers downstream: `CreateEntity` → AMQP `entity_changed`; OCR action → `ocr_request`; navigation to `SingleEntity`/`Downloads`/job page on success.
- Coupled UI: `MetadataWrapper`, `UploadInterfaceDropzone`, `EntityPickerComponent`, `ImportWrapper`, `DynamicFormUploadButton`, and the `DynamicForm` modal (`TypeModals.DynamicForm`), plus the entity-tagging modal flow (`ElodyEntityTaggingModal`) for WYSIWYG tagging of newly created entities.

### Action Type → Function Map (quick reference)
`performActionButtonClickEvent` dispatch table (`actionType` → handler):

| actionType | handler | effect |
|---|---|---|
| `submit` | `submitActionFunction` | `CreateEntity`, navigate to entity |
| `submitWithUpload` | `submitWithUploadActionFunction` | create (cached) then upload mediafiles |
| `submitWithExtraMetadata` | `submitWithExtraMetadataActionFunction` | create + emit `entityCreated`, no nav |
| `submitAllFormTabs` | `submitAllFormTabsActionFunction` | create one entity per form key, chained relations |
| `updateMetadata` | `updateMetdataActionFunction` | CSV metadata update |
| `upload` / `uploadWithOcr` | `uploadActionFunction` | upload, go to job page |
| `uploadWithMetadata` | `uploadWithMetadataActionFunction` | upload with entity input |
| `uploadCsvForReordening` | `reorderEntitiesActionFunction` | CSV reorder |
| `download` | `downloadActionFunction` | create download entity, go to Downloads |
| `ocr` | `startOcrActionFunction` | persist metadata + trigger OCR |
| `endpoint` | `callEndpointActionFunction` | raw `fetch` to configured endpoint |
| `nextFormTab` / `previousFormTab` | tab nav functions | validate + change `tabs.selectedIndex` |
