# Contributing

For general project setup see [README.md](README.md); for the design-system
contract and its full status see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). This
file is the short version you need before touching a component.

## The three sources of truth

1. **The docs site** (`elody-docs`, `/design-system/`, 38 pages) is the
   written contract. Where code and docs disagree, the docs win — change the
   code, or change the docs deliberately and say so in the commit.
2. **Storybook** (`pnpm storybook`, port 6006) is the running proof. Every
   docs page embeds stories by id; a story id comes from the story **title**,
   not the filename.
3. **`src/assets/main.css`** holds every token in the `@theme` block. Never
   write a colour, radius, duration or type size as a literal.

## Rules that catch real bugs here

- **No clickable `<span>`/`<div>`/`<p>`.** Anything that acts is a `<button>`
  (or a link that navigates), with an accessible name and a
  `:focus-visible` ring. This class of bug has been found and fixed 28 times
  in this codebase; check every component you touch.
- **Accent-derived tokens must be re-declared in the `[data-elody-client]`
  catch-all block** at the end of `main.css`. `var()` resolves where a
  property is *defined*: an alias declared only at `:root` freezes to the
  vlacc accent for every other tenant.
- **Copy goes through `src/i18n/designSystemMessages.ts`** (NL + EN). The
  app merges it as a fallback under the service-served translations, and
  Storybook's mockMain uses the same object — one catalogue, no drift.
  Never hardcode UI copy, and never invent a bare string as a key.
- **Per-field editing**: edit scope = save scope = validation scope. A row
  saves through the injected `persistEntity`; a creation form
  (`formFlow="create"`) renders its inputs permanently and commits through
  the form's single submit zone. Don't reintroduce a whole-form edit mode.
- **`BaseButton` is `width: 100%` by default** — constrain it in flex rows.
- **`BasePanelShell` is the one panel chrome.** Don't hand-roll a header.

## Writing a story

- Title decides the id (`Base/BaseButton` → `base-basebutton--*`); keep ids
  stable, the docs pages embed them.
- `@/main` is aliased to `.storybook/mockMain.ts`. Components that query on
  mount can register fixture data per operation name with
  `registerQueryFixture(name, data)` from `@/main`; unregistered operations
  answer `{}` and log a `console.debug`.
- Check the story under a light-accent tenant **and** a dark-accent one
  (podiumnet, damsv2, vliz flip the panel-header ink) via the Tenant
  toolbar.
- Stories must not touch the network: maps use the `tileUrl` data-URI
  fixture, previews seed the Apollo cache or use the fixture link.

## Checks before you push

```bash
pnpm eslint <changed files>   # the pre-commit hook is broken on some
                              # machines (npx + .npmrc env); run it by hand
pnpm test:unit                # baseline: the jsdom-localStorage failures
                              # in useSeenItems-related files are known
pnpm build-storybook          # what CI publishes; must stay green
```

CI publishes Storybook via GitLab Pages from the design-system branch; on
merge requests the build runs as a smoke check.
