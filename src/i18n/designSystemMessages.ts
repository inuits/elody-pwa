/**
 * The copy the design system itself specifies (NL/EN, from the docs pages).
 *
 * These are FALLBACKS: setupI18n layers the service-served translations on
 * top, so a key the translation service knows always wins. Until the service
 * carries these keys the beta reads as designed instead of rendering raw
 * keys; the full key table lives in DESIGN_SYSTEM.md.
 *
 * Storybook's mockMain builds its catalogue from this same object, so the
 * workshop and the app cannot drift apart.
 */
export const designSystemMessages: Record<string, object> = {
    nl: {
      metadata: {
        labels: { "no-value": "Geen waarde", yes: "Ja", no: "Nee" },
        "no-label": "Veld zonder label",
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
      modal: { close: "Sluiten" },
      filters: {
        filter: "Filters",
        active: "actief",
        clear: "Wis alles",
        apply: "Zoek",
        "add-filter": "Voeg filter toe…",
        "matcher-placeholders": { keyword: "Zoekterm…" },
        "matcher-labels": {
          "select-filter-type": "Kies een matcher",
          ContainsMatcher: "bevat",
          ContainsNotMatcher: "bevat niet",
          ExactMatcher: "is exact",
          ExactInputMatcher: "is exact",
          ExactAutoCompleteMatcher: "is exact",
          RegexMatcher: "voldoet aan patroon",
          MinIncludedMatcher: "vanaf",
          MaxIncludedMatcher: "tot en met",
          InBetweenMatcher: "tussen",
          AnyMatcher: "heeft een waarde",
          NoneMatcher: "heeft geen waarde",
          GeoMatcher: "binnen kaartgebied",
        },
        "section-active": "actief",
        "clear-filter": "Wis filter",
        "option-count-name": "{label}, {count} resultaten",
        "saved-searches": "Bewaarde zoekopdrachten",
      },
      "saved-searches": {
        "picker-title": "Bewaarde zoekopdrachten",
        "create-title": "Bewaar zoekopdracht",
        "applied-chip": "Opgeslagen zoekopdracht: {name}, verwijderen",
        modified: "Gewijzigd",
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
        "confirm-selection-count": "Bevestig selectie ({count})",
      },
      search: { "search-placeholder": "Zoek…", submit: "Zoek" },
      "date-picker": { placeholder: "dd-mm-jjjj" },
      "history-diff": { was: "was", nu: "nu", "no-differences": "Geen verschillen" },
      tree: { expand: "Klap uit", collapse: "Klap in" },
      navigation: {
        "main-label": "Hoofdnavigatie",
        "breadcrumb-history": "Toon kruimelpad-geschiedenis",
      },
      comments: {
        "log-label": "Opmerkingen",
        "edit-named": "Bewerk opmerking van {author}, {time}",
        status: { open: "Open", resolved: "Opgelost" },
        "reply-count": "1 antwoord | {count} antwoorden",
        edit: "Bewerk",
        "unknown-author": "Onbekend",
      },
      upload: {
        "zone-label": "Upload bestanden",
        "remove-file": "Verwijder bestand",
        uploaded: "{n} van {m} geüpload",
        retry: "Opnieuw",
      },
      repetitiveForm: {
        "add-more": "Voeg toe",
        "created-this-session": "Aangemaakt in deze sessie",
        "remove-entry": "Verwijder dit item",
      },
      "dynamic-form": {
        "actions-label": "Formulier-acties",
        "check-fields": "Controleer de gemarkeerde velden ({count})",
      },
      viewer: {
        "toolbar-label": "Viewer-acties",
        "zoom-in": "Zoom in",
        "zoom-out": "Zoom uit",
        fullscreen: "Volledig scherm",
        download: "Download",
      },
      entity: { "reset-viewer": "Herstel weergave" },
    },
    en: {
      metadata: {
        labels: { "no-value": "No value", yes: "Yes", no: "No" },
        "no-label": "Unlabelled field",
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
      modal: { close: "Close" },
      filters: {
        filter: "Filters",
        active: "active",
        clear: "Clear all",
        apply: "Search",
        "add-filter": "Add filter…",
        "matcher-placeholders": { keyword: "Search term…" },
        "matcher-labels": {
          "select-filter-type": "Choose a matcher",
          ContainsMatcher: "contains",
          ContainsNotMatcher: "does not contain",
          ExactMatcher: "is exactly",
          ExactInputMatcher: "is exactly",
          ExactAutoCompleteMatcher: "is exactly",
          RegexMatcher: "matches pattern",
          MinIncludedMatcher: "from",
          MaxIncludedMatcher: "up to and including",
          InBetweenMatcher: "between",
          AnyMatcher: "has a value",
          NoneMatcher: "has no value",
          GeoMatcher: "within map area",
        },
        "section-active": "active",
        "clear-filter": "Clear filter",
        "option-count-name": "{label}, {count} results",
        "saved-searches": "Saved searches",
      },
      "saved-searches": {
        "picker-title": "Saved searches",
        "create-title": "Save search",
        "applied-chip": "Saved search: {name}, remove",
        modified: "Modified",
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
        "confirm-selection-count": "Confirm selection ({count})",
      },
      search: { "search-placeholder": "Search…", submit: "Search" },
      "date-picker": { placeholder: "dd-mm-yyyy" },
      "history-diff": { was: "was", nu: "now", "no-differences": "No differences" },
      tree: { expand: "Expand", collapse: "Collapse" },
      navigation: {
        "main-label": "Main navigation",
        "breadcrumb-history": "Show breadcrumb history",
      },
      comments: {
        "log-label": "Comments",
        "edit-named": "Edit comment by {author}, {time}",
        status: { open: "Open", resolved: "Resolved" },
        "reply-count": "1 reply | {count} replies",
        edit: "Edit",
        "unknown-author": "Unknown",
      },
      upload: {
        "zone-label": "Upload files",
        "remove-file": "Remove file",
        uploaded: "{n} of {m} uploaded",
        retry: "Retry",
      },
      repetitiveForm: {
        "add-more": "Add more",
        "created-this-session": "Created this session",
        "remove-entry": "Remove this entry",
      },
      "dynamic-form": {
        "actions-label": "Form actions",
        "check-fields": "Check the highlighted fields ({count})",
      },
      viewer: {
        "toolbar-label": "Viewer actions",
        "zoom-in": "Zoom in",
        "zoom-out": "Zoom out",
        fullscreen: "Fullscreen",
        download: "Download",
      },
      entity: { "reset-viewer": "Reset view" },
    },
  };

/** Service translations win over the design-system fallbacks. */
export const mergeWithDesignSystemMessages = (
  translations: Record<string, object>,
): Record<string, object> => {
  const deepMerge = (base: any, override: any): any => {
    if (
      typeof base !== "object" ||
      base === null ||
      typeof override !== "object" ||
      override === null
    ) {
      return override ?? base;
    }
    const result: Record<string, unknown> = { ...base };
    for (const key of Object.keys(override)) {
      result[key] = key in result ? deepMerge(result[key], override[key]) : override[key];
    }
    return result;
  };

  const merged: Record<string, object> = { ...designSystemMessages };
  for (const locale of Object.keys(translations ?? {})) {
    merged[locale] = deepMerge(
      designSystemMessages[locale] ?? {},
      (translations as any)[locale],
    );
  }
  return merged;
};
