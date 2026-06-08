# inuits-dams-pwa

Vue 3 PWA frontend. See the repo-root `../CLAUDE.md` for monorepo-wide stack, architecture, and conventions.

## Feature Documentation

`.claude/features/` holds structured, LLM-friendly feature docs (what it does, GraphQL operations, component → data flow, resolver → service maps, business rules & gotchas, dependencies).

- **Before exploring a PWA feature from scratch, check `.claude/features/features.md`** — it's the index linking every documented feature.
- After analyzing a feature, add a `<featureName>.md` entry following the existing section layout and link it from `features.md`.
- Flag any section inferred (not verified against source) with a `⚠️` note so it can be tightened later.

Currently documented: Dynamic Forms (`.claude/features/dynamicForm.md`).
