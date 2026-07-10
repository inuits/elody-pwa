<p align="center">
  <a href="https://elody.eu"><img src="https://elody.eu/images/logo.svg" alt="Elody" width="96" /></a>
</p>

<p align="center">Part of <a href="https://elody.eu">Elody</a> — the open semantic data platform.</p>

# inuits-dams-pwa

Vue 3 PWA frontend for the Elody DAMS platform. The UI is **schema-driven** — forms, views, and field types are not hardcoded but fetched from the GraphQL API at runtime and rendered dynamically.

## Stack

- **Vue 3** + TypeScript + Composition API
- **Vite** (dev server + build)
- **Apollo Client** — all data via GraphQL
- **TailwindCSS v4**
- **Vitest** — unit tests

## Getting started

All commands are run from the monorepo root via the Taskfile:

```sh
task start-client   # start the full stack for a client (prompts to pick one)
task stop-client    # stop the client stack
task build-client   # rebuild after dependency changes
task generate       # regenerate GraphQL types after schema changes
```

For unit tests and linting, run the package scripts directly from this directory — these don't require the full stack to be running.

## Project structure

```
src/
  components/        # UI components, grouped by concern
    metadata/        # field renderers (MetadataWrapper, MetadataFormatterPill, …)
    dynamicForms/    # schema-driven form rendering
    entityElements/  # list/relation/element panels
    bulk-operations/ # multi-select action bar
    modals/          # modal shells and pickers
  composables/       # all business logic (useEdit, useEntitySingle, useBulkOperations, …)
  views/             # route-level pages (EntitySingle, MultiEntityView, Home, …)
  generated-types/   # auto-generated from GraphQL schema — do not edit by hand
  helpers.ts         # shared utilities
  main.ts            # app bootstrap (Apollo, auth, i18n, formatters)
```

Path alias: `@` → `src/`.

## How the schema-driven UI works

`baseGraphql` defines all available configuration options and shared types in its GraphQL schema (`Form → FormTab → FormFields → InputFieldTypes`). The actual UI — which forms exist, what fields they contain, how entities relate — is configured in the **client's own GraphQL service** (`clients/<client>/client-frontend/inuits-dams-graphql-service/`). That is where queries, translations, input field definitions, and formatter configs live.

The PWA fetches this configuration at runtime and renders it generically. Everything below is defined in the client GraphQL service, not in this repo:

- **Entity list views** — which columns are shown, their formatters, bulk operations
- **Entity detail pages** — panel layout, which metadata fields appear per panel, related entity list elements
- **Forms** — tabs, field order, input types, validation rules (`DynamicForm.vue`)
- **Filters** — advanced filters per entity type, which fields are filterable and how options are fetched
- **Sort options** — available sort fields per entity type
- **Bulk operations** — which actions appear on multi-select per entity type

Field types (text, date, dropdown, fileUpload, entityPicker, …) map to concrete wrapper components in `src/components/metadata/`. The PWA itself has no knowledge of client-specific entity types or configuration.

## Formatters

Fields can carry a `formatter` hint from the GraphQL response (e.g. `"pill"`, `"pill|concept"`, `"link"`). `MetadataFormatter.vue` dispatches to the right renderer. Pill colors are configured per-client in `podiumnetFormattersConfig.ts` (or equivalent).

## GraphQL codegen

Types are generated from the schema using `graphql-code-generator` (`codegen.ts`). Re-run `pnpm run generate` whenever the schema or any `.graphql` / query file changes.

## Testing

Unit tests live alongside their subject in `src/**/__tests__/` or `src/**/tests/`. Run with:

```sh
pnpm run test:unit
```

Coverage output lands in `coverage/` and is browsable at `http://dashboard.dams.localhost:8300/coverage/index.html` when the stack is running.

## Feature docs

`.claude/features/` holds structured docs for non-obvious features (Dynamic Forms, Repetitive Form wizard, …). Check there before exploring a feature from scratch.
