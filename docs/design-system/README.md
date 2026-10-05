# Elody design system

How the elody PWA looks and behaves: tokens, components and patterns. This is
the single source of truth for the PWA. When code and this documentation
disagree, one of them is a bug.

> Status: being assembled. Pages appear here as each part is agreed. Until a
> page exists, the handoff (`Elody Design system/elody-design-system-handoff/`)
> is the reference.

## Where things live

| What | Where | Owns |
|---|---|---|
| Token values | `src/assets/main.css` (`@theme`) | every colour, size, radius, shadow, duration |
| Human docs | `docs/design-system/` (this folder) | what each part is, when to use it, how it behaves |
| AI rules | `.claude/skills/design-system/` | short enforceable rules; points at token names, never copies values |
| Visual reference | Storybook (`*.stories.ts`) | every state of every component |

Values exist in one place only, `main.css`. These pages name the tokens
and explain them, but never restate a hex or pixel value as the thing to use.

## Token layers

1. **Primitives:** raw palette and scales (`--color-neutral-40`, `--text-table`).
   Never used directly by components.
2. **Roles:** what a value means (`--color-border-default`,
   `--color-text-body`, `--color-commit`). Client themes override only the
   accent roles.
3. **Component tokens:** one decision per component
   (`--button-md-padding`, `--filter-header-text`). Components read only
   these and the role tokens.

To change how a component looks, change its component token in `main.css`.
To change what a role means everywhere, change the role token.

## Contents

- `foundations/`
  - [Principles](foundations/principles.md)
  - [Tokens](foundations/tokens.md)
  - [Client theming](foundations/theming.md)
  - [Accessibility](foundations/accessibility.md)
- `components/`
  - [Button](components/button.md)
- `patterns/`: per-field editing, filters, lists and other multi-component patterns

## Page template (components)

1. What it is / when to use it
2. Anatomy
3. Tokens
4. Variants and states
5. Behaviour and keyboard
6. Accessibility
7. Copy (NL / EN)
8. Implementation (Vue component, story)
