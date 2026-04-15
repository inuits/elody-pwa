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
  isOn: Ref<boolean>;
  iconOn: DamsIcons;
  iconOff: DamsIcons;
};

export type UseViewModesOptions = {
  entities: Ref<Entity[]> | ShallowRef<Entity[]>;
  enablePreview?: boolean;
  enableAdvancedFilters?: boolean;
  entitiesLoading?: Ref<boolean>;
  route?: RouteLocationNormalizedLoaded;
  baseLibraryMode?: BaseLibraryModes;
};

export const useViewModes = (options: UseViewModesOptions) => {
  const { getGlobalState, updateGlobalState } = useStateManagement();

  // ── Display state ─────────────────────────────────────────────────────────

  const displayList = ref<boolean>(false);
  const displayGrid = ref<boolean>(false);
  const displayTable = ref<boolean>(false);
  const displayPreview = ref<boolean>(options.enablePreview ?? false);
  const displayMap = ref<boolean>(false);
  const expandFilters = ref<boolean>(false);

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

  const viewModesIncludeViewModesMedia = computed<boolean>(() => {
    const rawEntities = toRaw(options.entities.value);
    if (rawEntities.length <= 0) return false;
    const firstEntity = toRaw(rawEntities[0]);
    return (
      firstEntity.allowedViewModes?.viewModes
        ?.map((vm: ViewModesWithConfig) => vm.viewMode)
        .includes(ViewModes.ViewModesMedia) ?? false
    );
  });

  const showViewModesList = computed<boolean>(() => {
    if (displayTable.value) return false;
    return (
      displayList.value ||
      displayGrid.value ||
      ((options.entitiesLoading?.value ?? false) &&
        !displayMap.value &&
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
          isOn: displayList,
          iconOn: DamsIcons.ListUl,
          iconOff: DamsIcons.ListUl,
        });
      } else if (viewMode === ViewModes.ViewModesGrid) {
        newToggles.push({
          isOn: displayGrid,
          iconOn: DamsIcons.Apps,
          iconOff: DamsIcons.Apps,
        });
      } else if (viewMode === ViewModes.Table) {
        const distinctTypes = new Set(
          options.entities.value.map((e: Entity) => e.type),
        );
        if (distinctTypes.size > 1) {
          console.error(
            `[BaseLibrary] Table view requires all entities to share the same type. ` +
              `Found: ${[...distinctTypes].join(", ")}. Table view will not be shown.`,
          );
          displayTable.value = false;
        } else {
          newToggles.push({
            isOn: displayTable,
            iconOn: DamsIcons.Table,
            iconOff: DamsIcons.Table,
          });
        }
      } else if (viewMode === ViewModes.ViewModesMedia) {
        newToggles.push({
          isOn: displayPreview,
          iconOn: DamsIcons.Image,
          iconOff: DamsIcons.Image,
        });
      } else if (viewMode === ViewModes.ViewModesMap) {
        newToggles.push({
          isOn: displayMap,
          iconOn: DamsIcons.Map,
          iconOff: DamsIcons.Map,
        });
      }
    }

    if (!viewModes.includes(ViewModes.Table)) displayTable.value = false;
    if (!viewModes.includes(ViewModes.ViewModesMap)) displayMap.value = false;

    toggles.value = newToggles;
  };

  /**
   * Restore the user's preferred view mode configuration from localStorage.
   * Formerly named `getDisplayPreferences` in BaseLibrary.vue.
   */
  const getUserPreferredViewModeConfiguration = (): void => {
    const displayPreferences = getGlobalState("_displayPreferences");
    if (!displayPreferences) return;

    expandFilters.value = !options.enableAdvancedFilters
      ? false
      : displayPreferences.expandFilters;

    if (
      !displayPreview.value &&
      !displayMap.value &&
      Object.keys(configPerViewMode.value).length === 1
    ) {
      const keys = Object.keys(configPerViewMode.value);
      displayList.value = keys.includes(ViewModes.ViewModesList);
      displayGrid.value = keys.includes(ViewModes.ViewModesGrid);
      displayTable.value = keys.includes(ViewModes.Table);
      return;
    }

    if (!displayPreview.value && displayPreferences.table) {
      displayTable.value = displayPreferences.table;
    }

    if (!displayPreview.value && displayPreferences.grid) {
      displayGrid.value = displayPreferences.grid;
    }

    if (
      displayGrid.value === false &&
      !displayMap.value &&
      !displayTable.value
    ) {
      displayList.value = true;
    }
  };

  /**
   * Reset all view modes to the default list view.
   * Call this on route change or pagination reset.
   */
  const resetToListView = (): void => {
    displayMap.value = false;
    displayGrid.value = false;
    displayTable.value = false;
    displayList.value = true;
  };

  // ── Persist watcher ───────────────────────────────────────────────────────

  watch([displayGrid, displayTable, expandFilters], () => {
    let _expandFilters = expandFilters.value;
    if (options.route?.name === "SingleEntity") {
      _expandFilters = getGlobalState("_displayPreferences")?.expandFilters;
    }

    displayList.value =
      !displayGrid.value && !displayMap.value && !displayTable.value;

    updateGlobalState("_displayPreferences", {
      grid: displayPreview.value ? false : displayGrid.value,
      table: displayTable.value,
      expandFilters: _expandFilters,
    });
  });

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    displayList,
    displayGrid,
    displayTable,
    displayPreview,
    displayMap,
    expandFilters,
    toggles,
    configPerViewMode,
    viewModesIncludeViewModesMedia,
    showViewModesList,
    determineViewModes,
    getUserPreferredViewModeConfiguration,
    resetToListView,
  };
};
