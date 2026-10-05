---
name: design-system
description: >
  Use this skill whenever creating or changing a Vue component, its template classes,
  or any styling in inuits-dams-pwa (src/components/**, src/views/**, src/assets/*.css).
  Trigger on: "style this", "make it look like the design", "add a button/input/dropdown/
  chip/tooltip", "change the colour/size/spacing", "fix the layout", new UI work, or any
  edit that touches Tailwind classes, CSS variables or main.css.
---

# Design system: inuits-dams-pwa

**Values live in `src/assets/main.css`.** Human docs live in
`docs/design-system/`: read the component's page before changing it. This skill
holds the rules; it never restates values.

## Hard rules

1. **No literals.** No hex, rgb, px font sizes, radii, shadows or durations in
   components. Use a token utility (`bg-surface-muted`, `text-table`,
   `rounded-input`, `shadow-overlay`) or a component token (`p-(--button-md-padding)`).
   The only exceptions are third-party renderers that need a resolved colour
   (OpenLayers, Mirador). For those, use `readCssToken()` from `src/utils/cssToken.ts`.
2. **Colours are `--color-*`.** `--text-*` is the font-size namespace. Never
   define a colour as `--text-…`.
3. **Use roles, not primitives.** Prefer `--color-border-default` over
   `--color-neutral-40`. New code uses `--color-commit` and `--color-focus-ring`,
   never the legacy `--color-accent-accent`. `--color-accent-normal` (mint) is
   deprecated for UI.
4. **Component tokens.** Each primitive reads its sizes from its own block in
   `main.css` (`/* Button */`, `/* Input */`…). To change how a primitive looks,
   change its token, not the component. To add a primitive, add its token block,
   then its docs page.
5. **Two elevation levels.** Cards: 1px border, no shadow. Only overlays
   (menus, listboxes, popovers, modals, toasts) get a shadow.
6. **Shape encodes role.** Pill (`rounded-pill`) = starts something reversible.
   Rectangle (`rounded-input` / `rounded-button`) = executes. Never a pill on a
   mutating action.
7. **One focus ring**, set globally on `:focus-visible`. Never add or remove
   focus outlines per component.
8. **No client data in the PWA.** Client colours live in the client's app
   config (`customization.theme`) and are applied at runtime. Never add a
   client scope, client name or client colour to `main.css` or the docs.
   If you add a colour alias (`--color-x: var(--color-y)`) to `@theme`,
   re-declare it in the `body` block too (guarded by `mainCss.test.ts`).
9. **Commit teal is platform-fixed** by default. See
   `foundations/theming.md` for what a theme may change.

## Which component

| Need | Use | Docs |
|---|---|---|
| An action | `BaseButtonNew` (`buttonStyle`: primary / secondary / ghost / commit / danger; `buttonSize`: sm / md) | `components/button.md` |
| Select or deselect | `BaseInputCheckbox` (`size="compact"` in dense lists) | `components/checkbox.md` |
| Text, number, textarea | `BaseInputTextNumberDatetime` (`errorMessage`, `readonly`, `invalid`) | `components/input.md` |
| Closed list | `AdvancedDropdown` (`clearable`, `multiple`, `loading`), never a native `<select>` | `components/dropdown.md` |
| Hint text | `BaseTooltip`; bind `describedBy` from the activator slot | `components/tooltip.md` |
| Waiting | `SpinnerLoader` (`theme="accent"` on surfaces); skeletons for lists | `components/spinner.md` |
| Status, type, relation | `pill` formatter config (`tone`, `shape: "badge"`) | `components/chip-and-badge.md` |

Retired, never reintroduce: button variants `default`, `accentNormal`,
`accentAccent`, `redDefault`; sizes `normal`, `small`, `verySmall`; the
checkbox `inputStyle` prop; "-" as an empty value.

## Behaviour rules

- **Empty value:** `useEmptyValueLabel()` ("Geen waarde"), shown at
  `opacity-[var(--opacity-empty)]`.
- **Choosing never saves.** Selects and pickers change the draft; Bewaar commits.
- **Confirm only real loss.** Reversible actions execute and offer undo.
- **Copy:** Dutch sentence case, verbs on buttons, strings in i18n
  (`modules/baseGraphql/translations/{nl,en}.json`). A `te()` check with an
  English fallback is fine until the key exists.

## Accessibility checklist

- Real elements (`<button>`, `<input type="checkbox">`). `aria-label` on
  icon-only controls.
- Errors `role="alert"`, linked via `aria-describedby`, plus `aria-invalid`.
  Confirmations and counts `role="status"`.
- Spinners are `aria-hidden`. The loading region announces itself
  (`aria-busy`).
- Text contrast is at least 4.5:1 (`docs/design-system/foundations/accessibility.md`).

## Workflow

1. Read the component's docs page, then write the test first (`unit-test` skill).
2. Use tokens. If a value has no token, add one to the right `main.css` block
   and to the docs page. Don't inline it.
3. After CSS or class changes, run `pnpm exec vite build` as well as the
   tests. Invalid `@apply` and unknown utilities only fail at build time.
   Inside a component `<style>` block, theme utilities need
   `@reference "@/assets/main.css";`. Prefer plain CSS with `var(--…)` there.
4. Update the docs page if behaviour or tokens changed.
