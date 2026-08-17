// Stand-in for src/main.ts inside Storybook.
//
// Components import the live Apollo client, router and auth session from
// "@/main"; importing the real module would boot the whole application
// (OIDC redirect, app config fetch) as a side effect of rendering a story.
// The alias in .storybook/vite.config.ts points at this file instead.
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { createRouter, createWebHistory } from "vue-router";
import { createI18n } from "vue-i18n";

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
});

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
});

export const auth = {
  isAuthenticated: { value: true },
  user: { value: { name: "Storybook" } },
  logout: () => undefined,
  redirectToLogin: () => undefined,
};

export const bulkSelectAllSizeLimit = 999999;
// Stand-in tenant config: pill colours are declared per client, so a story
// showing a configured pill needs a group to look its colours up in.
export const formattersSettings = {
  pill: {
    concept: { background: "#E8EEF0", text: "#003A52" },
    gepubliceerd: { background: "#DAF1DC", text: "#15803d" },
    vervallen: { background: "#FDEBD7", text: "#B95000" },
  },
};
export const typeUrlMapping = { mapping: {}, reverseMapping: {} };

// helpers.ts reaches for `i18n.global.t` outside a component, so this has to
// be a real instance rather than a placeholder. preview.ts installs this same
// one on the app, so a story and a helper translate through one catalogue.
//
// Stories render component chrome, not translated product copy: an unknown key
// renders as itself so a story never depends on the translation service. Only
// the copy the design system itself specifies is declared here.
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "nl",
  fallbackLocale: "en",
  messages: {
    nl: {
      metadata: {
        labels: { "no-value": "Geen waarde", yes: "Ja", no: "Nee" },
      },
      dropdown: { "remove-option": "Verwijder {option}" },
      "field-row": { "edit-value": "{label}, bewerken" },
      "inline-editor": {
        save: "Bewaar",
        cancel: "Annuleer",
        saved: "Opgeslagen",
        "keyboard-hint": "Enter bewaart · Esc annuleert",
        "save-failed": "Opslaan mislukt, probeer opnieuw",
        undo: "Ongedaan maken",
      },
      "group-form": { "check-highlighted-fields": "Controleer de gemarkeerde velden" },
      "context-menu": { actions: "Acties" },
      filters: {
        "section-active": "actief",
        "saved-searches": "Bewaarde zoekopdrachten",
      },
      pagination: {
        "nav-label": "Paginering",
        "results-per-page": "Resultaten per pagina",
        "per-page": "{count} per pagina",
        previous: "Vorige pagina",
        next: "Volgende pagina",
      },
      "bulk-operations": {
        "toolbar-label": "Acties op selectie",
        items: "items",
        selected: "geselecteerd",
        "undo-selection": "Wis selectie",
        "select-page": "Selecteer pagina",
      },
    },
    en: {
      metadata: {
        labels: { "no-value": "No value", yes: "Yes", no: "No" },
      },
      dropdown: { "remove-option": "Remove {option}" },
      "field-row": { "edit-value": "{label}, edit" },
      "inline-editor": {
        save: "Save",
        cancel: "Cancel",
        saved: "Saved",
        "keyboard-hint": "Enter saves · Esc cancels",
        "save-failed": "Saving failed, try again",
        undo: "Undo",
      },
      "group-form": { "check-highlighted-fields": "Check the highlighted fields" },
      "context-menu": { actions: "Actions" },
      filters: {
        "section-active": "active",
        "saved-searches": "Saved searches",
      },
      pagination: {
        "nav-label": "Pagination",
        "results-per-page": "Results per page",
        "per-page": "{count} per page",
        previous: "Previous page",
        next: "Next page",
      },
      "bulk-operations": {
        "toolbar-label": "Selection actions",
        items: "items",
        selected: "selected",
        "undo-selection": "Clear selection",
        "select-page": "Select page",
      },
    },
  },
  missingWarn: false,
  fallbackWarn: false,
  missing: (_locale, key) => key,
});
