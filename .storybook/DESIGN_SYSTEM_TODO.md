# Design-system Storybook — remaining work

Every story id from the handoff's `STORYBOOK_TODO.md` / `MANIFEST.md` now
resolves (37/37). What remains is depth, not coverage:

- **`repetitiveform-dynamicform--tabs`** shows the loading skeleton: the
  tabbed form is entirely backend-driven, so a `GetDynamicForm` operation
  fixture must be added to `mockMain.ts`'s `operationFixtures` to render
  tabs / validation summary / submit zone offline.
- **Backend-driven states shown as loading/empty shells** (the chrome is the
  contract, the data needs fixtures): `modals-entitypicker--default` (result
  rows + selected state), `components-comments--thread` (thread with
  replies — row states covered by `Components/Comments/CommentItem`),
  `components-previewwrapper--column-list` (populated column list).
- **A11y**: the global a11y addon setting is `test: "todo"`; migrated
  components opt into `test: "error"` in their story file. Flip the global to
  "error" once the legacy stories are cleaned up.
- **CI**: publish Storybook and add a check that fails when a component under
  `src/components` has no story (migration plan WP10.3).
- **Storybook 10 upgrade note**: `.stories.mdx` is not supported; docs-only
  pages are plain `.mdx` (see `src/designSystem/DesignSystem.mdx`).
