# Nav rail

The fixed main navigation on the left. Implemented by
`src/components/navigation/NavRail.vue`, `NavItem.vue` and `NavSubItem.vue`,
with `src/composables/useNavMenu.ts`. Items come from the `main-menu` GraphQL
menu. Handoff: `navigation.md` (NavRail, Round 2 expanded flyout).

## Anatomy
A 52px white rail: logo, environment chip and the collapse/keep-open button
at the top, then the menu items, then the account rows (`LogInLogout`). Open,
the header is one row: logo and chip on the left, the button on the right. Opened, it becomes 320px wide
beside the page, with no shadow: the page moves right by the same width
(`App.vue`, same transition), so nothing is covered. Items show icon, label and badge;
a group shows a chevron and lists its sub-items indented below it.

## Tokens
| Token | Role |
|---|---|
| `--nav-rail-width` | closed width, and the content offset |
| `--nav-flyout-width` | opened width |
| `--nav-rail-pad`, `--nav-rail-gap`, `--nav-rail-logo` | rail spacing, logo size |
| `--nav-rail-item-width`, `--nav-rail-item-height`, `--nav-rail-item-radius` | item size |
| `--nav-sub-item-indent` | sub-item list indent |
| `--nav-flyout-gap` | gap between the rail's edge and a group flyout |
| `--nav-flyout-viewport-margin` | space a flyout keeps from the viewport edge |
| `--transition-duration-ui`, `--ease-ui` | width transition (off with reduced motion) |

## Modes
One icon button at the top of the rail switches between two modes,
remembered per browser (`localStorage` `elody.navMode`). Its icon shows what
a click does: `right-indent-alt` (≡›, "Keep menu open") on the rail,
`left-indent-alt` (≡‹, "Collapse menu") while open.

| Mode | Behaviour |
|---|---|
| Closed (default) | 52px rail. Hover only highlights an item and shows its name in a tooltip at once (no delay); the rail never opens on hover or focus. Clicking a group opens a flyout beside its icon (see below) |
| Open | 320px beside the page, which moves aside, until the button collapses it; groups open inline under their row |

Groups open on click only, one at a time. A group with a page of its own
(`typeLink.route` that is not one of its sub-items) also goes to that page
when it opens in the open menu; closing it stays on the page. A group whose
route is just one of its sub-items (podiumnet: Organizations → Venues) only
opens.

## Group flyout (closed rail)
A popover to the right of the group icon (`right-start`, flips and shifts to
stay on screen) with the group name as a small title and the sub-items
below. When the group has a page of its own (as above), the title links to that page
(the group button itself only opens the flyout). It looks like the other menus: `--menu-padding`,
`--menu-min-width`, card radius, subtle border, overlay shadow.

- Disclosure pattern, not `role="menu"`: the group button has
  `aria-expanded` and `aria-controls` pointing at the flyout, and the flyout
  holds plain links, so Tab moves through them in reading order (it is not
  teleported out of the rail).
- While a flyout is open the rail rises to the context-menu layer
  (`z-context-menu`), so page dropdowns and overlays don't cover it.
- Closes on Escape when focus is in the rail or nowhere (focus back to the
  group button; Escape aimed at another dropdown or dialog is left alone), a click outside it,
  focus moving to another item, picking a sub-item, clicking the group
  again, or navigating.
- The group's tooltip is hidden while its flyout is open.

## States
| State | Visual cue |
|---|---|
| resting | muted ink |
| hover | `accent-highlight` wash |
| current page | `accent-light` wash, `accent-ink`; a group is current when a sub-item is |

## Accessibility
- `<nav>` named "Main navigation" / "Hoofdnavigatie"; items and sub-items are
  lists.
- Links are links with `aria-current="page"`; items that open a form are
  `<button>`s.
- Groups are disclosure buttons with `aria-expanded` and `aria-controls`.
- Closed, the label stays in the item as `sr-only` text, so the accessible
  name is the label plus the badge count. The tooltip repeats that name, so
  it is not linked with `aria-describedby`.
- Escape on a sub-item returns focus to its group before closing.
- The mode button is an icon button named by what it does ("Collapse menu"
  / "Keep menu open"), with that name as its tooltip in both states.
