<template>
  <div class="text-text-body">
    <h1 class="mb-1 text-[15px] font-black text-text-strong">Foundations</h1>
    <p class="mb-4 text-[12.5px] text-text-secondary">
      Rendered straight from the CSS variables in
      <code>src/assets/main.css</code> — switch the tenant in the toolbar to see
      the client scopes. Commit teal, focus ring, semantic colours and badge
      tones are platform-fixed and must not shift.
    </p>

    <section v-for="group in colorGroups" :key="group.title" class="mb-5">
      <h2 class="mb-2 text-[13px] font-bold text-text-strong">
        {{ group.title }}
      </h2>
      <div class="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="token in group.tokens"
          :key="token"
          class="flex items-center gap-2 rounded-[5px] border border-neutral-30 bg-neutral-0 px-2 py-1"
        >
          <span
            class="inline-block h-6 w-10 shrink-0 rounded-[4px] border border-neutral-30"
            :style="{ background: `var(${token})` }"
          />
          <span class="min-w-0">
            <span class="block truncate font-mono text-[11.5px]">{{
              token
            }}</span>
            <span class="block font-mono text-[10.5px] text-text-muted">{{
              resolved[token] || "—"
            }}</span>
          </span>
        </div>
      </div>
    </section>

    <section class="mb-5">
      <h2 class="mb-2 text-[13px] font-bold text-text-strong">Type — Lato</h2>
      <div
        v-for="token in typeTokens"
        :key="token.name"
        class="mb-1 flex items-baseline gap-3"
      >
        <span class="w-40 shrink-0 font-mono text-[11px] text-text-muted"
          >{{ token.name }} · {{ resolved[token.name] || "—" }}</span
        >
        <span :style="{ fontSize: `var(${token.name})` }"
          >{{ token.usage }}</span
        >
      </div>
    </section>

    <section class="mb-5">
      <h2 class="mb-2 text-[13px] font-bold text-text-strong">
        Radii — shape encodes role
      </h2>
      <p class="mb-2 text-[11.5px] text-text-muted">
        Pill (14px) starts something — safe, reversible. Rectangle (5–6px)
        executes immediately. Never a pill on a mutating action.
      </p>
      <div class="flex flex-wrap items-end gap-3">
        <div v-for="token in radiusTokens" :key="token" class="text-center">
          <div
            class="mb-1 flex h-12 w-24 items-center justify-center border border-neutral-30 bg-neutral-0 text-[10.5px] text-text-muted"
            :style="{ borderRadius: `var(${token})` }"
          >
            {{ resolved[token] || "—" }}
          </div>
          <span class="font-mono text-[10.5px] text-text-muted">{{
            token
          }}</span>
        </div>
      </div>
    </section>

    <section class="mb-5">
      <h2 class="mb-2 text-[13px] font-bold text-text-strong">
        Elevation — two levels only
      </h2>
      <p class="mb-2 text-[11.5px] text-text-muted">
        Cards: 1px border, no shadow. Overlays: shadow. There is no third.
      </p>
      <div class="flex flex-wrap gap-4">
        <div
          class="flex h-20 w-40 items-center justify-center rounded-[8px] border border-neutral-30 bg-neutral-0 text-[11.5px]"
        >
          card — border only
        </div>
        <div
          v-for="token in shadowTokens"
          :key="token"
          class="flex h-20 w-40 items-center justify-center rounded-[10px] bg-neutral-0 font-mono text-[10.5px]"
          :style="{ boxShadow: `var(${token})` }"
        >
          {{ token }}
        </div>
      </div>
    </section>

    <section class="mb-5">
      <h2 class="mb-2 text-[13px] font-bold text-text-strong">Motion</h2>
      <p class="text-[12.5px] text-text-secondary">
        One duration <code>--transition-duration-ui</code> ({{
          resolved["--transition-duration-ui"] || "—"
        }}), one easing (ease), one press scale
        <code>--scale-press</code> ({{ resolved["--scale-press"] || "—" }}).
      </p>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive } from "vue";

const colorGroups = [
  {
    title: "Legacy names (load-bearing)",
    tokens: [
      "--color-accent-light",
      "--color-accent-accent",
      "--color-accent-normal",
      "--color-accent-dark",
      "--color-text-light",
    ],
  },
  {
    title: "Accent roles (client-swappable)",
    tokens: [
      "--color-accent",
      "--color-accent-hover",
      "--color-accent-light-strong",
      "--color-accent-ink",
      "--color-accent-wash",
      "--color-accent-tint",
    ],
  },
  {
    title: "Surfaces",
    tokens: [
      "--color-surface",
      "--color-surface-app",
      "--color-surface-muted",
      "--color-surface-sunken",
      "--color-surface-panel-header",
      "--color-surface-section-header",
      "--color-surface-group-form",
      "--color-surface-row-hover",
      "--color-surface-repeat-row",
      "--color-surface-note",
      "--color-surface-inverted",
    ],
  },
  {
    title: "Text",
    tokens: [
      "--color-text-body",
      "--color-text-strong",
      "--color-text-secondary",
      "--color-text-muted",
      "--color-text-subtle",
      "--color-text-field-label",
      "--color-text-on-accent",
      "--color-text-panel-header",
      "--color-text-accent-strong",
      "--color-text-disabled",
      "--color-text-placeholder",
      "--color-text-link",
    ],
  },
  {
    title: "Borders",
    tokens: [
      "--color-border-default",
      "--color-border-subtle",
      "--color-border-faint",
      "--color-border-panel",
      "--color-border-dashed",
    ],
  },
  {
    title: "Commit / focus (platform-fixed)",
    tokens: [
      "--color-commit",
      "--color-commit-hover",
      "--color-commit-strong-hover",
      "--color-focus-ring",
    ],
  },
  {
    title: "Semantic (platform-fixed)",
    tokens: [
      "--color-danger",
      "--color-danger-bg",
      "--color-danger-wash",
      "--color-success",
      "--color-success-strong",
      "--color-success-bg",
      "--color-warning",
      "--color-warning-bg",
      "--color-warning-chip",
      "--color-info",
      "--color-info-bg",
    ],
  },
  {
    title: "Entity badges — 3 tones, assigned in config order",
    tokens: [
      "--color-badge-tone1-bg",
      "--color-badge-tone1-text",
      "--color-badge-tone2-bg",
      "--color-badge-tone2-text",
      "--color-badge-tone3-bg",
      "--color-badge-tone3-text",
      "--color-badge-subtype-bg",
      "--color-badge-subtype-text",
    ],
  },
  {
    title: "Relation chips & scrim",
    tokens: [
      "--color-chip-relation-bg",
      "--color-chip-relation-text",
      "--color-chip-neutral-bg",
      "--color-chip-neutral-text",
      "--color-chip-count-bg",
      "--color-scrim",
    ],
  },
];

const typeTokens = [
  { name: "--text-micro", usage: "badge glyphs, row counters" },
  { name: "--text-hint", usage: "hint lines, pager text" },
  { name: "--text-label", usage: "field labels, column headers, chips" },
  { name: "--text-ui", usage: "header buttons, count chips" },
  { name: "--text-table", usage: "table cells, menu items, panel body" },
  { name: "--text-value", usage: "field values & inputs — the reading size" },
  { name: "--text-heading", usage: "page title" },
];

const radiusTokens = [
  "--radius-chip",
  "--radius-input",
  "--radius-button",
  "--radius-card",
  "--radius-overlay",
  "--radius-pill",
];

const shadowTokens = [
  "--shadow-overlay",
  "--shadow-popover",
  "--shadow-modal",
  "--shadow-toast",
];

const resolved = reactive<Record<string, string>>({});

const allTokens = () => [
  ...colorGroups.flatMap((group) => group.tokens),
  ...typeTokens.map((token) => token.name),
  ...radiusTokens,
  ...shadowTokens,
  "--transition-duration-ui",
  "--scale-press",
];

const readTokens = () => {
  const style = getComputedStyle(document.body);
  for (const token of allTokens())
    resolved[token] = style.getPropertyValue(token).trim();
};

let observer: MutationObserver | undefined;
onMounted(() => {
  readTokens();
  // Re-resolve when the tenant toolbar swaps data-elody-client on <body>.
  observer = new MutationObserver(readTokens);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-elody-client"],
  });
});
onBeforeUnmount(() => observer?.disconnect());
</script>
