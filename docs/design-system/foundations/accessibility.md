# Accessibility

Accessibility is part of "done" for every component, not a later pass.

## Focus
- One focus treatment everywhere: a `--focus-ring-width` outline in
  `--color-focus-ring` with `--focus-ring-offset`, on `:focus-visible`.
  It is set globally in `main.css`. Don't override it per component, and
  don't remove it.
- Focus order follows reading order. Overlays move focus in and return it to
  their trigger when they close.

## Names and roles
- Every interactive element has an accessible name: a visible label, or
  `aria-label` for icon-only controls.
- Use real elements: `<button>`, `<a>`, `<input type="checkbox">`. Use ARIA
  roles only where no native element exists (combobox, listbox, tooltip).
- Errors are `role="alert"`. Confirmations and counts are `role="status"`.
- A spinner never announces itself. The region that is loading announces
  through its own live region.
- Inputs link their error message with `aria-describedby` and mark themselves
  `aria-invalid`.
- A tooltip is `role="tooltip"`, linked from its trigger with
  `aria-describedby`, and never the only place important information appears.

## Contrast
Text meets WCAG AA: **4.5:1** for normal text, 3:1 for large text and
non-text UI. Measured pairs:

| Pair | Ratio |
|---|---|
| Body text on surface | 12.2:1 |
| Field label / link on surface | 6.5:1 |
| Badge tone1 / tone2 / tone3 / subtype | 5.97 / 5.14 / 5.68 / 5.51 |
| Relation chip (white on chip blue) | **2.14, failing, fix pending** |

Placeholder text (`--color-text-placeholder`) is below 4.5:1 by design, so a
placeholder is an example, never the label. Disabled text is exempt.

Every new accent a client theme introduces must pass 4.5:1 against both
`--color-surface` and `--color-accent-light`.

## Meaning is never colour alone
Badges carry a letter or label, status chips carry text, and errors carry a
message.

## Touch
Hit targets are at least `--touch-target-min` on tablet widths.
