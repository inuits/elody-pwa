# Contributing

For general project setup see [README.md](README.md). This file is the short
version you need before touching a component.

## Sources of truth

1. **`docs/design-system/`** is the written contract for how the PWA looks and
   behaves. Where code and docs disagree, one of them is a bug: fix the code,
   or change the docs deliberately and say so in the commit.
2. **Storybook** (`pnpm storybook`, port 6006) is the running proof. The
   design-system pages in `elody-docs` embed stories by id, and a story id
   comes from the story **title**, not the file name.
3. **`src/assets/main.css`** holds every token. Never write a colour, radius,
   duration or type size as a literal in a component.

## Rules that catch real bugs

- **No clickable `<span>`, `<div>` or `<p>`.** Anything that acts is a
  `<button>` (or a link that navigates), with an accessible name and a
  `:focus-visible` ring.
- **Client colours arrive at runtime** through `customization.theme` in the
  client's app config (`src/utils/clientTheme.ts`). Every derived colour
  alias is re-declared on `body` in `main.css`; when you add one, add it
  there too (`src/assets/__tests__/mainCss.test.ts` guards this).
- **`BaseButtonNew` is full width by default.** Constrain it in flex rows.
- Never hardcode UI copy; every string goes through i18n.

## Writing a story

- The title decides the id (`Base/BaseButton` → `base-basebutton--*`). Keep
  ids stable, because the docs pages embed them.
- Give every component a `Playground` (or `Default`) story driven by `args`,
  so its props show up as Controls. Emitted events get `{ action }` argTypes.
- `@/main` is aliased to `.storybook/mockMain.ts`. Components that query on
  mount can register fixture data per operation name with
  `registerQueryFixture(name, data)` from `@/main`.
- Stories must not need the network where it can be avoided: maps take a
  `tileUrl`, viewers use the fixtures in
  `src/components/base/__stories__/mediafileFixtures.ts`.
- Without a generated `src/generated-types/queries.ts`, Storybook falls back
  to `src/__mocks__/queries.ts`, as it does in CI. If a story needs a
  document the mock lacks, add it to the mock.

## Checks before you push

```bash
pnpm eslint <changed files>
pnpm test:unit
pnpm build-storybook
node scripts/audit-story-embeds.mjs ../elody-docs/docs/design-system
```

The last command checks that every `<StoryEmbed>` id in the docs resolves
against the built Storybook (`storybook-static/index.json`).

CI publishes Storybook to GitLab Pages from `beta/redesign` (job `pages` in
`.gitlab-ci.yml`).
