# Feature Docs Index

Structured, LLM-friendly feature documentation for the PWA. Each entry lives in its own file and follows the same section layout (What it does / GraphQL Operations / Component → Data Flow / Resolver → Service Map / Business Rules & Gotchas / Dependencies).

Purpose: let a new developer or an LLM work on a feature without re-exploring the whole codebase. When you finish analyzing a feature, add a file here and link it below.

## Features

- [Dynamic Forms](./dynamicForm.md) — runtime GraphQL-defined forms (`DynamicForm.vue` + `useDynamicForm`); renders fields/uploads/pickers/actions from a named query and dispatches create/upload/OCR/CSV/download actions.
- [Guided Multi-Entity Creation Flow](./repetitiveForm.md) — config-driven wizard modal (`repetitiveForm/` + `useRepetitiveForm`); repeats pick-or-create steps with scoped pickers and auto-relations, then finalizes a container entity (e.g. omnibus manifestation).

## Conventions

- One file per feature, named after its primary component/composable (camelCase, e.g. `dynamicForm.md`).
- Keep entries concise — skip the obvious, focus on non-obvious wiring and gotchas.
- Flag any section inferred (not verified against source) with a `⚠️` note so it can be tightened later.
