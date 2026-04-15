import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ref, nextTick } from "vue";
import { useViewModes } from "../useViewModes";
import {
  DamsIcons,
  ViewModes,
  BaseLibraryModes,
} from "@/generated-types/queries";
import type { Entity } from "@/generated-types/queries";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockGetGlobalState = vi.fn();
const mockUpdateGlobalState = vi.fn();

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({
    getGlobalState: mockGetGlobalState,
    updateGlobalState: mockUpdateGlobalState,
  }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeEntity = (type: string, viewModeNames: string[] = []): Entity =>
  ({
    id: "test-id",
    uuid: "test-uuid",
    type,
    allowedViewModes: {
      viewModes: viewModeNames.map((viewMode) => ({ viewMode, config: null })),
    },
  }) as unknown as Entity;

const makeRoute = (name: string) => ({ name }) as any;

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useViewModes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGlobalState.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── determineViewModes ────────────────────────────────────────────────────

  describe("determineViewModes", () => {
    it("preserves config order: Table first, Grid second", () => {
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.Table, ViewModes.ViewModesGrid]),
      ]);
      const { determineViewModes, toggles } = useViewModes({ entities });

      determineViewModes([ViewModes.Table, ViewModes.ViewModesGrid]);

      expect(toggles.value).toHaveLength(2);
      expect(toggles.value[0].iconOn).toBe(DamsIcons.Table);
      expect(toggles.value[1].iconOn).toBe(DamsIcons.Apps);
    });

    it("preserves config order: Grid first, Table second", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles } = useViewModes({ entities });

      determineViewModes([ViewModes.ViewModesGrid, ViewModes.Table]);

      expect(toggles.value).toHaveLength(2);
      expect(toggles.value[0].iconOn).toBe(DamsIcons.Apps);
      expect(toggles.value[1].iconOn).toBe(DamsIcons.Table);
    });

    it("returns empty toggles for empty viewModes array", () => {
      const entities = ref<Entity[]>([]);
      const { determineViewModes, toggles } = useViewModes({ entities });

      determineViewModes([]);

      expect(toggles.value).toHaveLength(0);
    });

    it("sets displayTable to false when Table is not in viewModes", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, displayTable } = useViewModes({ entities });

      displayTable.value = true;
      determineViewModes([ViewModes.ViewModesGrid]);

      expect(displayTable.value).toBe(false);
    });

    it("does not reset displayTable when Table is in viewModes", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, displayTable } = useViewModes({ entities });

      displayTable.value = true;
      determineViewModes([ViewModes.Table]);

      expect(displayTable.value).toBe(true);
    });

    it("sets displayMap to false when Map is not in viewModes", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, displayMap } = useViewModes({ entities });

      displayMap.value = true;
      determineViewModes([ViewModes.Table]);

      expect(displayMap.value).toBe(false);
    });

    it("does not reset displayMap when Map is in viewModes", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, displayMap } = useViewModes({ entities });

      displayMap.value = true;
      determineViewModes([ViewModes.ViewModesMap]);

      expect(displayMap.value).toBe(true);
    });

    it("excludes Table and sets displayTable false when entities have mixed types", () => {
      const entities = ref<Entity[]>([
        makeEntity("production"),
        makeEntity("mediafile"),
      ]);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { determineViewModes, toggles, displayTable } = useViewModes({
        entities,
      });

      displayTable.value = true;
      determineViewModes([ViewModes.Table]);

      expect(toggles.value).toHaveLength(0);
      expect(displayTable.value).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Table view requires all entities"),
      );
    });

    it("includes all 5 view modes in correct order", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles } = useViewModes({ entities });

      determineViewModes([
        ViewModes.ViewModesList,
        ViewModes.ViewModesGrid,
        ViewModes.Table,
        ViewModes.ViewModesMedia,
        ViewModes.ViewModesMap,
      ]);

      expect(toggles.value).toHaveLength(5);
      expect(toggles.value[0].iconOn).toBe(DamsIcons.ListUl);
      expect(toggles.value[1].iconOn).toBe(DamsIcons.Apps);
      expect(toggles.value[2].iconOn).toBe(DamsIcons.Table);
      expect(toggles.value[3].iconOn).toBe(DamsIcons.Image);
      expect(toggles.value[4].iconOn).toBe(DamsIcons.Map);
    });

    it("binds displayList ref to the List toggle's isOn", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles, displayList } = useViewModes({
        entities,
      });

      determineViewModes([ViewModes.ViewModesList]);

      displayList.value = true;
      expect(toggles.value[0].isOn).toBe(true);

      displayList.value = false;
      expect(toggles.value[0].isOn).toBe(false);
    });

    it("binds displayGrid ref to the Grid toggle's isOn", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles, displayGrid } = useViewModes({
        entities,
      });

      determineViewModes([ViewModes.ViewModesGrid]);

      displayGrid.value = true;
      expect(toggles.value[0].isOn).toBe(true);
    });

    it("binds displayTable ref to the Table toggle's isOn", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles, displayTable } = useViewModes({
        entities,
      });

      determineViewModes([ViewModes.Table]);

      displayTable.value = true;
      expect(toggles.value[0].isOn).toBe(true);
    });

    it("binds displayPreview ref to the Media toggle's isOn", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles, displayPreview } = useViewModes({
        entities,
        enablePreview: true,
      });

      determineViewModes([ViewModes.ViewModesMedia]);

      expect(toggles.value[0].isOn).toBe(true);
      displayPreview.value = false;
      expect(toggles.value[0].isOn).toBe(false);
    });

    it("binds displayMap ref to the Map toggle's isOn", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles, displayMap } = useViewModes({
        entities,
      });

      determineViewModes([ViewModes.ViewModesMap]);

      displayMap.value = true;
      expect(toggles.value[0].isOn).toBe(true);
    });

    it("ignores unknown view mode names", () => {
      const entities = ref<Entity[]>([makeEntity("production")]);
      const { determineViewModes, toggles } = useViewModes({ entities });

      determineViewModes(["UnknownMode", ViewModes.Table]);

      expect(toggles.value).toHaveLength(1);
      expect(toggles.value[0].iconOn).toBe(DamsIcons.Table);
    });
  });

  // ── getUserPreferredViewModeConfiguration ─────────────────────────────────

  describe("getUserPreferredViewModeConfiguration", () => {
    it("returns without changes when no preferences are stored", () => {
      mockGetGlobalState.mockReturnValue(null);
      const entities = ref<Entity[]>([]);
      const {
        getUserPreferredViewModeConfiguration,
        displayGrid,
        displayTable,
      } = useViewModes({ entities });

      getUserPreferredViewModeConfiguration();

      expect(displayGrid.value).toBe(false);
      expect(displayTable.value).toBe(false);
    });

    it("restores grid preference when stored", () => {
      mockGetGlobalState.mockReturnValue({
        grid: true,
        table: false,
        expandFilters: false,
      });
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.ViewModesGrid, ViewModes.Table]),
      ]);
      const { getUserPreferredViewModeConfiguration, displayGrid } =
        useViewModes({ entities });

      getUserPreferredViewModeConfiguration();

      expect(displayGrid.value).toBe(true);
    });

    it("restores table preference when stored", () => {
      mockGetGlobalState.mockReturnValue({
        grid: false,
        table: true,
        expandFilters: false,
      });
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.Table, ViewModes.ViewModesGrid]),
      ]);
      const { getUserPreferredViewModeConfiguration, displayTable } =
        useViewModes({ entities });

      getUserPreferredViewModeConfiguration();

      expect(displayTable.value).toBe(true);
    });

    it("sets displayList to true when both grid and table are false and no map", () => {
      mockGetGlobalState.mockReturnValue({
        grid: false,
        table: false,
        expandFilters: false,
      });
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.ViewModesGrid, ViewModes.Table]),
      ]);
      const { getUserPreferredViewModeConfiguration, displayList } =
        useViewModes({ entities });

      getUserPreferredViewModeConfiguration();

      expect(displayList.value).toBe(true);
    });

    it("does not restore expandFilters when enableAdvancedFilters is false", () => {
      mockGetGlobalState.mockReturnValue({
        grid: false,
        table: false,
        expandFilters: true,
      });
      const entities = ref<Entity[]>([]);
      const { getUserPreferredViewModeConfiguration, expandFilters } =
        useViewModes({
          entities,
          enableAdvancedFilters: false,
        });

      getUserPreferredViewModeConfiguration();

      expect(expandFilters.value).toBe(false);
    });

    it("restores expandFilters when enableAdvancedFilters is true", () => {
      mockGetGlobalState.mockReturnValue({
        grid: false,
        table: false,
        expandFilters: true,
      });
      const entities = ref<Entity[]>([]);
      const { getUserPreferredViewModeConfiguration, expandFilters } =
        useViewModes({
          entities,
          enableAdvancedFilters: true,
        });

      getUserPreferredViewModeConfiguration();

      expect(expandFilters.value).toBe(true);
    });

    it("uses config keys (not stored preferences) when only one view mode is configured", () => {
      mockGetGlobalState.mockReturnValue({
        grid: true,
        table: false,
        expandFilters: false,
      });
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.Table]),
      ]);
      const {
        getUserPreferredViewModeConfiguration,
        displayTable,
        displayGrid,
      } = useViewModes({
        entities,
      });

      getUserPreferredViewModeConfiguration();

      expect(displayTable.value).toBe(true);
      expect(displayGrid.value).toBe(false);
    });

    it("ignores grid/table preferences when displayPreview is active", () => {
      mockGetGlobalState.mockReturnValue({
        grid: true,
        table: true,
        expandFilters: false,
      });
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.ViewModesGrid, ViewModes.Table]),
      ]);
      const {
        getUserPreferredViewModeConfiguration,
        displayGrid,
        displayTable,
        displayPreview,
      } = useViewModes({
        entities,
        enablePreview: true,
      });

      getUserPreferredViewModeConfiguration();

      expect(displayGrid.value).toBe(false);
      expect(displayTable.value).toBe(false);
    });

    it("still restores grid/table preferences when displayMap is active (only single-mode path is gated)", () => {
      mockGetGlobalState.mockReturnValue({
        grid: true,
        table: true,
        expandFilters: false,
      });
      const entities = ref<Entity[]>([
        makeEntity("production", [
          ViewModes.ViewModesGrid,
          ViewModes.Table,
          ViewModes.ViewModesMap,
        ]),
      ]);
      const {
        getUserPreferredViewModeConfiguration,
        displayGrid,
        displayTable,
        displayMap,
      } = useViewModes({
        entities,
      });
      displayMap.value = true;

      getUserPreferredViewModeConfiguration();

      // displayMap only affects the single-mode early-return path, not the general preference restoration
      expect(displayGrid.value).toBe(true);
      expect(displayTable.value).toBe(true);
    });
  });

  // ── resetToListView ───────────────────────────────────────────────────────

  describe("resetToListView", () => {
    it("resets all view mode display refs and sets displayList to true", () => {
      const entities = ref<Entity[]>([]);
      const {
        resetToListView,
        displayList,
        displayGrid,
        displayTable,
        displayMap,
      } = useViewModes({ entities });

      displayGrid.value = true;
      displayTable.value = true;
      displayMap.value = true;
      displayList.value = false;

      resetToListView();

      expect(displayMap.value).toBe(false);
      expect(displayGrid.value).toBe(false);
      expect(displayTable.value).toBe(false);
      expect(displayList.value).toBe(true);
    });
  });

  // ── configPerViewMode ─────────────────────────────────────────────────────

  describe("configPerViewMode", () => {
    it("returns empty object when entities is empty", () => {
      const entities = ref<Entity[]>([]);
      const { configPerViewMode } = useViewModes({ entities });

      expect(configPerViewMode.value).toEqual({});
    });

    it("maps view mode names to their configs", () => {
      const entities = ref<Entity[]>([
        {
          ...makeEntity("production"),
          allowedViewModes: {
            viewModes: [
              { viewMode: ViewModes.Table, config: null },
              { viewMode: ViewModes.ViewModesGrid, config: null },
            ],
          },
        } as unknown as Entity,
      ]);
      const { configPerViewMode } = useViewModes({ entities });

      expect(configPerViewMode.value).toEqual({
        [ViewModes.Table]: null,
        [ViewModes.ViewModesGrid]: null,
      });
    });

    it("returns empty object when allowedViewModes is missing", () => {
      const entities = ref<Entity[]>([
        { id: "x", type: "production" } as unknown as Entity,
      ]);
      const { configPerViewMode } = useViewModes({ entities });

      expect(configPerViewMode.value).toEqual({});
    });
  });

  // ── viewModesIncludeViewModesMedia ────────────────────────────────────────

  describe("viewModesIncludeViewModesMedia", () => {
    it("returns false when entities is empty", () => {
      const entities = ref<Entity[]>([]);
      const { viewModesIncludeViewModesMedia } = useViewModes({ entities });

      expect(viewModesIncludeViewModesMedia.value).toBe(false);
    });

    it("returns true when ViewModesMedia is in the allowed view modes", () => {
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.ViewModesMedia]),
      ]);
      const { viewModesIncludeViewModesMedia } = useViewModes({ entities });

      expect(viewModesIncludeViewModesMedia.value).toBe(true);
    });

    it("returns false when ViewModesMedia is not in the allowed view modes", () => {
      const entities = ref<Entity[]>([
        makeEntity("production", [ViewModes.Table, ViewModes.ViewModesGrid]),
      ]);
      const { viewModesIncludeViewModesMedia } = useViewModes({ entities });

      expect(viewModesIncludeViewModesMedia.value).toBe(false);
    });
  });

  // ── showViewModesList ─────────────────────────────────────────────────────

  describe("showViewModesList", () => {
    it("returns false when displayTable is true", () => {
      const entities = ref<Entity[]>([]);
      const { showViewModesList, displayTable } = useViewModes({ entities });

      displayTable.value = true;

      expect(showViewModesList.value).toBe(false);
    });

    it("returns true when displayList is true", () => {
      const entities = ref<Entity[]>([]);
      const { showViewModesList, displayList } = useViewModes({ entities });

      displayList.value = true;

      expect(showViewModesList.value).toBe(true);
    });

    it("returns true when displayGrid is true", () => {
      const entities = ref<Entity[]>([]);
      const { showViewModesList, displayGrid } = useViewModes({ entities });

      displayGrid.value = true;

      expect(showViewModesList.value).toBe(true);
    });

    it("returns true when loading, not map, and not SingleEntity route", () => {
      const entities = ref<Entity[]>([]);
      const entitiesLoading = ref(true);
      const route = makeRoute("Overview");
      const { showViewModesList } = useViewModes({
        entities,
        entitiesLoading,
        route,
      });

      expect(showViewModesList.value).toBe(true);
    });

    it("returns false when loading, SingleEntity route, and NormalBaseLibrary mode", () => {
      const entities = ref<Entity[]>([]);
      const entitiesLoading = ref(true);
      const route = makeRoute("SingleEntity");
      const { showViewModesList } = useViewModes({
        entities,
        entitiesLoading,
        route,
        baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
      });

      expect(showViewModesList.value).toBe(false);
    });

    it("returns true when loading, SingleEntity route, and non-Normal mode", () => {
      const entities = ref<Entity[]>([]);
      const entitiesLoading = ref(true);
      const route = makeRoute("SingleEntity");
      const { showViewModesList } = useViewModes({
        entities,
        entitiesLoading,
        route,
        baseLibraryMode: BaseLibraryModes.PreviewBaseLibrary,
      });

      expect(showViewModesList.value).toBe(true);
    });

    it("returns false when loading but displayMap is true", () => {
      const entities = ref<Entity[]>([]);
      const entitiesLoading = ref(true);
      const route = makeRoute("Overview");
      const { showViewModesList, displayMap } = useViewModes({
        entities,
        entitiesLoading,
        route,
      });

      displayMap.value = true;

      expect(showViewModesList.value).toBe(false);
    });
  });

  // ── persist watcher ───────────────────────────────────────────────────────

  describe("persist watcher", () => {
    it("calls updateGlobalState when displayGrid changes", async () => {
      const entities = ref<Entity[]>([]);
      const { displayGrid } = useViewModes({ entities });

      displayGrid.value = true;
      await nextTick();

      expect(mockUpdateGlobalState).toHaveBeenCalledWith(
        "_displayPreferences",
        expect.objectContaining({ grid: true, table: false }),
      );
    });

    it("calls updateGlobalState when displayTable changes", async () => {
      const entities = ref<Entity[]>([]);
      const { displayTable } = useViewModes({ entities });

      displayTable.value = true;
      await nextTick();

      expect(mockUpdateGlobalState).toHaveBeenCalledWith(
        "_displayPreferences",
        expect.objectContaining({ grid: false, table: true }),
      );
    });

    it("saves grid as false when displayPreview is active even if displayGrid is true", async () => {
      const entities = ref<Entity[]>([]);
      const { displayGrid, displayPreview } = useViewModes({
        entities,
        enablePreview: true,
      });

      displayGrid.value = true;
      await nextTick();

      expect(mockUpdateGlobalState).toHaveBeenCalledWith(
        "_displayPreferences",
        expect.objectContaining({ grid: false }),
      );
    });

    it("sets displayList to true when all view modes are turned off", async () => {
      const entities = ref<Entity[]>([]);
      const { displayGrid, displayTable, displayList } = useViewModes({
        entities,
      });

      displayGrid.value = true;
      await nextTick();
      displayGrid.value = false;
      await nextTick();

      expect(displayList.value).toBe(true);
    });

    it("preserves stored expandFilters on SingleEntity route", async () => {
      mockGetGlobalState.mockReturnValue({ expandFilters: true });
      const entities = ref<Entity[]>([]);
      const route = makeRoute("SingleEntity");
      const { displayGrid } = useViewModes({ entities, route });

      displayGrid.value = true;
      await nextTick();

      expect(mockUpdateGlobalState).toHaveBeenCalledWith(
        "_displayPreferences",
        expect.objectContaining({ expandFilters: true }),
      );
    });

    it("uses current expandFilters value on non-SingleEntity route", async () => {
      const entities = ref<Entity[]>([]);
      const route = makeRoute("Overview");
      const { displayGrid, expandFilters } = useViewModes({
        entities,
        route,
        enableAdvancedFilters: true,
      });

      expandFilters.value = true;
      displayGrid.value = true;
      await nextTick();

      expect(mockUpdateGlobalState).toHaveBeenCalledWith(
        "_displayPreferences",
        expect.objectContaining({ expandFilters: true }),
      );
    });
  });
});
