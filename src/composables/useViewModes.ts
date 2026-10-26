import { ref, computed, watch, toRaw } from "vue";
import type { Ref, ShallowRef } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import {
  DamsIcons,
  ViewModes,
  BaseLibraryModes,
} from "@/generated-types/queries";
import type { Entity, ViewModesWithConfig } from "@/generated-types/queries";
import { useStateManagement } from "@/composables/useStateManagement";

export type ViewModeToggle = {
  /** the view mode the toggle switches to (usage events name it) */
  viewMode: ViewModes;
  isOn: Ref<boolean>;
  iconOn: DamsIcons;
  iconOff: DamsIcons;
  // i18n key naming the view for the switch's buttons
  label: string;
};

export type UseViewModesOptions = {
  entities: Ref<Entity[]> | ShallowRef<Entity[]>;
  enablePreview?: boolean;
  enableAdvancedFilters?: boolean;
  entitiesLoading?: Ref<boolean>;
  route?: RouteLocationNormalizedLoaded;
  baseLibraryMode?: BaseLibraryModes;
  persistPreferences?: boolean;
  forceListView?: boolean;
  // Only the top-level overview library should read/write the shared
  // cross-route `expandFilters` preference — nested/detail-page instances
  // (relation lists, pickers, modals) keep their own in-memory-only state.
  persistExpandFilters?: boolean;
};

// The filter rail starts closed in every new session; within a session the
// overview remembers it (sessionStorage, not the long-lived preferences).
const EXPAND_FILTERS_KEY = "_expandFilters";
const readSessionExpandFilters = (): boolean => {
  try {
    return window.sessionStorage.getItem(EXPAND_FILTERS_KEY) === "true";
  } catch {
    return false;
  }
};
const writeSessionExpandFilters = (value: boolean): void => {
  try {
    window.sessionStorage.setItem(EXPAND_FILTERS_KEY, String(value));
  } catch {
    // storage unavailable (private mode): the rail just starts closed
  }
};

export const useViewModes = (options: UseViewModesOptions) => {
  const { getGlobalState, updateGlobalState } = useStateManagement();

  // ── Display state ─────────────────────────────────────────────────────────

  const displayList = ref<boolean>(false);
  const displayGrid = ref<boolean>(false);
  const displayTable = ref<boolean>(false);
  const displayPreview = ref<boolean>(options.enablePreview ?? false);
  const displayMap = ref<boolean>(false);
  const displayPipeline = ref<boolean>(false);
  const persistsExpandFilters = () =>
    !!options.enableAdvancedFilters && !!options.persistExpandFilters;
  const expandFilters = ref<boolean>(
    persistsExpandFilters() && readSessionExpandFilters(),
  );

  const toggles = ref<ViewModeToggle[]>([]);

  // ── Computed ──────────────────────────────────────────────────────────────

  const configPerViewMode = computed<Record<string, unknown>>(() => {
    const rawEntities = toRaw(options.entities.value);
    if (rawEntities.length <= 0) return {};
    const firstEntity = toRaw(rawEntities[0]);
    return (
      firstEntity.allowedViewModes?.viewModes?.reduce(
        (acc: Record<string, unknown>, vm: ViewModesWithConfig) => {
          if (vm.viewMode) acc[vm.viewMode] = vm.config;
          return acc;
        },
        {},
      ) ?? {}
    );
  });

  const hasMixedTeaserMetadata = computed<boolean>(() => {
    const rawEntities = toRaw(options.entities.value);
    if (rawEntities.length <= 1) return false;
    const teaserKeys = (entity: Entity): string =>
      Object.keys((entity.teaserMetadata as Record<string, unknown>) ?? {})
        .filter((key) => key !== "__typename")
        .sort()
        .join(",");
    const firstKeys = teaserKeys(rawEntities[0]);
    return rawEntities.some((entity) => teaserKeys(entity) !== firstKeys);
  });

  const viewModesIncludeViewModesMedia = computed<boolean>(() => {
    const rawEntities = toRaw(options.entities.value);
    if (rawEntities.length <= 0) return false;
    const firstEntity = toRaw(rawEntities[0]);
    return (
      firstEntity.allowedViewModes?.viewModes?.some(
        (vm: ViewModesWithConfig) => vm.viewMode === ViewModes.ViewModesMedia,
      ) ?? false
    );
  });

  const showViewModesList = computed<boolean>(() => {
    if (displayTable.value || displayPipeline.value) return false;
    return (
      displayList.value ||
      displayGrid.value ||
      ((options.entitiesLoading?.value ?? false) &&
        !displayMap.value &&
        !displayPipeline.value &&
        (options.route?.name !== "SingleEntity" ||
          options.baseLibraryMode !== BaseLibraryModes.NormalBaseLibrary))
    );
  });

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Build the ordered toggle array from the allowed view modes as configured
   * in GraphQL. The order of the input array is preserved in the UI.
   */
  const determineViewModes = (viewModes: string[]): void => {
    const newToggles: ViewModeToggle[] = [];

    for (const viewMode of viewModes) {
      if (viewMode === ViewModes.ViewModesList) {
        newToggles.push({
          viewMode: ViewModes.ViewModesList,
          isOn: displayList,
          iconOn: DamsIcons.ListUl,
          iconOff: DamsIcons.ListUl,
          label: "library.view-modes.list",
        });
      } else if (viewMode === ViewModes.ViewModesGrid) {
        newToggles.push({
          viewMode: ViewModes.ViewModesGrid,
          isOn: displayGrid,
          iconOn: DamsIcons.Apps,
          iconOff: DamsIcons.Apps,
          label: "library.view-modes.grid",
        });
      } else if (viewMode === ViewModes.Table) {
        if (hasMixedTeaserMetadata.value) {
          console.error(
            `[BaseLibrary] Table view requires all entities to share the same teaserMetadata columns. Table view will not be shown.`,
          );
          displayTable.value = false;
          displayList.value = true;
        } else {
          newToggles.push({
            viewMode: ViewModes.Table,
            isOn: displayTable,
            iconOn: DamsIcons.Table,
            iconOff: DamsIcons.Table,
            label: "library.view-modes.table",
          });
        }
      } else if (viewMode === ViewModes.ViewModesMedia) {
        newToggles.push({
          viewMode: ViewModes.ViewModesMedia,
          isOn: displayPreview,
          iconOn: DamsIcons.Image,
          iconOff: DamsIcons.Image,
          label: "library.view-modes.media",
        });
      } else if (viewMode === ViewModes.ViewModesMap) {
        newToggles.push({
          viewMode: ViewModes.ViewModesMap,
          isOn: displayMap,
          iconOn: DamsIcons.Map,
          iconOff: DamsIcons.Map,
          label: "library.view-modes.map",
        });
      } else if (viewMode === ViewModes.ViewModesPipeline) {
        // No shared-teaser-metadata precondition here (unlike Table): mixed
        // entity types are normal in a pipeline.
        newToggles.push({
          viewMode: ViewModes.ViewModesPipeline,
          isOn: displayPipeline,
          iconOn: DamsIcons.Sitemap,
          iconOff: DamsIcons.Sitemap,
          label: "library.view-modes.pipeline",
        });
      }
    }

    if (!viewModes.includes(ViewModes.Table)) displayTable.value = false;
    if (!viewModes.includes(ViewModes.ViewModesMap)) displayMap.value = false;
    if (!viewModes.includes(ViewModes.ViewModesPipeline))
      displayPipeline.value = false;

    toggles.value = newToggles;
  };

  /**
   * Restore the user's preferred view mode configuration from localStorage.
   * Formerly named `getDisplayPreferences` in BaseLibrary.vue.
   */
  const getUserPreferredViewModeConfiguration = (viewModes: string[] = []): void => {
    if (options.forceListView) {
      resetToListView();
      return;
    }

    const displayPreferences = getGlobalState("_displayPreferences");
    if (!displayPreferences) return;

    const availableViewModes = hasMixedTeaserMetadata.value
      ? viewModes.filter((viewMode) => viewMode !== ViewModes.Table)
      : viewModes;
    const configuredViewModes = Object.keys(configPerViewMode.value).filter(
      (viewMode) =>
        !hasMixedTeaserMetadata.value || viewMode !== ViewModes.Table,
    );

    expandFilters.value = persistsExpandFilters() && readSessionExpandFilters();

    if (
      !displayPreview.value &&
      !displayMap.value &&
      configuredViewModes.length === 1
    ) {
      displayList.value = configuredViewModes.includes(ViewModes.ViewModesList);
      displayGrid.value = configuredViewModes.includes(ViewModes.ViewModesGrid);
      displayTable.value = configuredViewModes.includes(ViewModes.Table);
      displayPipeline.value = configuredViewModes.includes(
        ViewModes.ViewModesPipeline,
      );
      return;
    }

    if (!displayPreview.value && displayPreferences.table && availableViewModes.includes(ViewModes.Table)) {
      displayTable.value = displayPreferences.table;
    }

    if (!displayPreview.value && displayPreferences.grid && availableViewModes.includes(ViewModes.ViewModesGrid)) {
      displayGrid.value = displayPreferences.grid;
    }

    if (
      !displayPreview.value &&
      displayPreferences.pipeline &&
      viewModes.includes(ViewModes.ViewModesPipeline)
    ) {
      displayPipeline.value = displayPreferences.pipeline;
    }

    if (
      displayGrid.value === false &&
      !displayMap.value &&
      !displayTable.value &&
      !displayPipeline.value
    ) {
      displayList.value = true;
    }
  };

  const resetToListView = (): void => {
    displayMap.value = false;
    displayGrid.value = false;
    displayTable.value = false;
    displayPipeline.value = false;
    displayList.value = true;
  };

  // ── Mixed teaserMetadata watcher ──────────────────────────────────────────

  watch(hasMixedTeaserMetadata, (isMixed) => {
    if (!isMixed || !displayTable.value) return;
    displayTable.value = false;
    displayList.value = !displayGrid.value && !displayMap.value;
  });

  // ── Persist watcher ───────────────────────────────────────────────────────

  watch([displayGrid, displayTable, displayPipeline, expandFilters], () => {
    if (options.persistExpandFilters)
      writeSessionExpandFilters(expandFilters.value);

    displayList.value =
      !displayGrid.value &&
      !displayMap.value &&
      !displayTable.value &&
      !displayPipeline.value;

    if (options.persistPreferences !== false) {
      updateGlobalState("_displayPreferences", {
        grid: displayPreview.value ? false : displayGrid.value,
        table: displayTable.value,
        pipeline: displayPreview.value ? false : displayPipeline.value,
      });
    }
  });

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    displayList,
    displayGrid,
    displayTable,
    displayPreview,
    displayMap,
    displayPipeline,
    expandFilters,
    toggles,
    configPerViewMode,
    hasMixedTeaserMetadata,
    viewModesIncludeViewModesMedia,
    showViewModesList,
    determineViewModes,
    getUserPreferredViewModeConfiguration,
    resetToListView,
  };
};
