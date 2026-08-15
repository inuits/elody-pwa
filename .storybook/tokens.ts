// Catalogue of the design-system tokens declared in src/assets/main.css.
// The Foundations stories read the live computed values off the document, so
// this file lists names and intent only — never values. If a swatch renders
// empty the token is missing from main.css, which is the point.

export type TokenGroup = {
  title: string;
  note?: string;
  tokens: { name: string; use: string }[];
};

export const colourGroups: TokenGroup[] = [
  {
    title: "Accent (client-swappable)",
    note: "The only set a client theme may swap. Everything below is platform-fixed.",
    tokens: [
      { name: "--color-accent", use: "Section headers, primary buttons" },
      { name: "--color-accent-hover", use: "Primary button hover" },
      { name: "--color-accent-light", use: "Panel header fill" },
      { name: "--color-accent-light-strong", use: "Panel borders, info chips" },
      { name: "--color-accent-ink", use: "Text on accent-light" },
      { name: "--color-accent-wash", use: "Hover fill on editable values" },
      { name: "--color-accent-tint", use: "Interdependent-group tint" },
      { name: "--color-accent-dark", use: "Darkened accent ink" },
    ],
  },
  {
    title: "Accent-derived aliases",
    note: "Re-declared inside every [data-elody-client] scope — aliases defined only at :root would freeze to the vlacc accent.",
    tokens: [
      { name: "--color-surface-panel-header", use: "Panel header" },
      { name: "--color-surface-section-header", use: "Section header" },
      { name: "--color-surface-editable-hover", use: "Editable value hover" },
      { name: "--color-surface-group-tint", use: "Group edit tint" },
      { name: "--color-text-panel-header", use: "Panel header ink" },
      { name: "--color-text-link-hover", use: "Link hover" },
      { name: "--color-border-panel", use: "Panel border" },
    ],
  },
  {
    title: "Surfaces",
    tokens: [
      { name: "--color-surface", use: "Cards, panels, inputs" },
      { name: "--color-surface-app", use: "App background" },
      { name: "--color-surface-muted", use: "Count chips, disabled" },
      { name: "--color-surface-sunken", use: "Pressed / selected neutral" },
      { name: "--color-surface-group-form", use: "Group edit card" },
      { name: "--color-surface-row-hover", use: "Table row hover" },
      { name: "--color-surface-repeat-row", use: "Repeatable row zebra" },
      { name: "--color-surface-note", use: "Cataloguer note" },
      { name: "--color-surface-inverted", use: "Toasts" },
    ],
  },
  {
    title: "Text",
    tokens: [
      { name: "--color-text-body", use: "Default ink" },
      { name: "--color-text-strong", use: "Row titles, emphasis" },
      { name: "--color-text-secondary", use: "Values, table cells" },
      { name: "--color-text-muted", use: "Hints, counters" },
      { name: "--color-text-subtle", use: "Tertiary, timestamps" },
      { name: "--color-text-field-label", use: "Field labels" },
      { name: "--color-text-on-accent", use: "Text on accent" },
      { name: "--color-text-accent-strong", use: "Accent text on white" },
      { name: "--color-text-disabled", use: "Disabled ink" },
      { name: "--color-text-placeholder", use: "Placeholder" },
      { name: "--color-text-link", use: "Links" },
    ],
  },
  {
    title: "Borders",
    tokens: [
      { name: "--color-border-default", use: "Inputs, secondary buttons" },
      { name: "--color-border-subtle", use: "Row separators" },
      { name: "--color-border-faint", use: "Table hairlines" },
      { name: "--color-border-dashed", use: "Editable underline, add buttons" },
    ],
  },
  {
    title: "Commit & focus (never themed)",
    tokens: [
      { name: "--color-commit", use: "Bewaar, checks" },
      { name: "--color-commit-hover", use: "Commit hover" },
      { name: "--color-commit-strong-hover", use: "Commit strong hover" },
      { name: "--color-focus-ring", use: "2px ring, 1px offset" },
    ],
  },
  {
    title: "Semantic (never themed)",
    tokens: [
      { name: "--color-danger", use: "Errors, destructive" },
      { name: "--color-danger-bg", use: "Error fill" },
      { name: "--color-danger-wash", use: "Error wash" },
      { name: "--color-success", use: "Success" },
      { name: "--color-success-strong", use: "Success ink" },
      { name: "--color-success-bg", use: "Success fill" },
      { name: "--color-warning", use: "Warning ink" },
      { name: "--color-warning-bg", use: "Warning fill" },
      { name: "--color-warning-chip", use: "Warning chip" },
      { name: "--color-info", use: "Info ink" },
      { name: "--color-info-bg", use: "Info fill" },
    ],
  },
  {
    title: "Badges & chips (never themed)",
    note: "Three generic tones assigned per entity type in config order and never reshuffled. W/E/M is vlacc's mapping, not the API's.",
    tokens: [
      { name: "--color-badge-tone1-bg", use: "Tone 1 fill" },
      { name: "--color-badge-tone1-text", use: "Tone 1 ink" },
      { name: "--color-badge-tone2-bg", use: "Tone 2 fill" },
      { name: "--color-badge-tone2-text", use: "Tone 2 ink" },
      { name: "--color-badge-tone3-bg", use: "Tone 3 fill" },
      { name: "--color-badge-tone3-text", use: "Tone 3 ink" },
      { name: "--color-badge-subtype-bg", use: "Subtype chip fill" },
      { name: "--color-badge-subtype-text", use: "Subtype chip ink" },
      { name: "--color-chip-relation-bg", use: "Relation chip — navigates" },
      { name: "--color-chip-relation-text", use: "Relation chip ink" },
      { name: "--color-chip-neutral-bg", use: "Neutral chip" },
      { name: "--color-chip-neutral-text", use: "Neutral chip ink" },
      { name: "--color-chip-count-bg", use: "Count chip" },
      { name: "--color-scrim", use: "Modal backdrop" },
    ],
  },
];

export const typeTokens = [
  { name: "--text-micro", use: "Badge glyphs, row counters" },
  { name: "--text-hint", use: "Hint lines, pager text" },
  { name: "--text-label", use: "Field labels, column headers" },
  { name: "--text-ui", use: "Header buttons, count chips" },
  { name: "--text-table", use: "Table cells, menu items" },
  { name: "--text-value", use: "Field values and inputs — the reading size" },
  { name: "--text-body", use: "App body size" },
  { name: "--text-heading", use: "Page title" },
];

export const radiusTokens = [
  { name: "--radius-chip", use: "Badges, relation chips" },
  { name: "--radius-input", use: "Inputs, secondary buttons, rows" },
  { name: "--radius-button", use: "Commit and primary buttons" },
  { name: "--radius-card", use: "Panels, cards, menus" },
  { name: "--radius-overlay", use: "Popovers, modals, toasts" },
  { name: "--radius-pill", use: "Add buttons, breadcrumbs, search" },
];

export const shadowTokens = [
  { name: "--shadow-overlay", use: "Menus, listboxes" },
  { name: "--shadow-popover", use: "Popovers" },
  { name: "--shadow-modal", use: "Modals" },
  { name: "--shadow-toast", use: "Toasts" },
];

export const spacingTokens = [
  "--spacing-ds-1",
  "--spacing-ds-2",
  "--spacing-ds-3",
  "--spacing-ds-4",
  "--spacing-ds-5",
  "--spacing-ds-6",
  "--spacing-ds-7",
  "--spacing-ds-8",
  "--spacing-ds-9",
  "--spacing-ds-10",
  "--spacing-ds-11",
  "--spacing-ds-12",
  "--spacing-ds-13",
  "--spacing-ds-14",
];

export const readToken = (name: string): string =>
  getComputedStyle(document.body).getPropertyValue(name).trim();
