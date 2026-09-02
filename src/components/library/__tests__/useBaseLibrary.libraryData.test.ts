import { describe, it, expect, vi } from "vitest";
import { effectScope } from "vue";

// useBaseLibrary calls these at setup time; mock them so the composable can be
// instantiated outside of a component.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ locale: { value: "nl" } }),
}));
vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({
    getStateForRoute: vi.fn(),
    updateStateForRoute: vi.fn(),
  }),
}));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn().mockResolvedValue(undefined),
  }),
}));

import { useBaseLibrary, getLibraryDataValue } from "../useBaseLibrary";
import { BaseLibraryModes } from "@/generated-types/queries";

const mockApolloClient = {} as any;

const runFetchedLibrary = (
  libraryDataKey: string,
  count: number,
  fetchSequence: number = 1,
) => {
  const scope = effectScope();
  scope.run(() => {
    const library = useBaseLibrary(
      mockApolloClient,
      true,
      BaseLibraryModes.NormalBaseLibrary,
      libraryDataKey,
    );
    library.totalEntityCount.value = count;
    library.fetchSequence.value = fetchSequence;
  });
  return scope;
};

const countConfig = (queryName: string) => ({ queryName, dataKey: "count" });

describe("useBaseLibrary – library data for panel headers", () => {
  it("exposes the count of the library registered under its own key", () => {
    const sceneImages = runFetchedLibrary("GetSceneImagesFilters", 7);
    const trailer = runFetchedLibrary("GetTrailerFilters", 2);

    expect(getLibraryDataValue(countConfig("GetSceneImagesFilters"))).toBe(7);
    expect(getLibraryDataValue(countConfig("GetTrailerFilters"))).toBe(2);

    sceneImages.stop();
    trailer.stop();
  });

  it("exposes nothing for an unknown query name", () => {
    expect(getLibraryDataValue(countConfig("GetNothing"))).toBeUndefined();
  });

  it("exposes nothing while the library has not fetched yet", () => {
    const scope = runFetchedLibrary("GetSceneImagesFilters", 0, 0);

    expect(
      getLibraryDataValue(countConfig("GetSceneImagesFilters")),
    ).toBeUndefined();

    scope.stop();
  });

  it("exposes zero once an empty library has fetched", () => {
    const scope = runFetchedLibrary("GetSceneImagesFilters", 0);

    expect(getLibraryDataValue(countConfig("GetSceneImagesFilters"))).toBe(0);

    scope.stop();
  });

  it("exposes nothing for an unsupported data key", () => {
    const scope = runFetchedLibrary("GetSceneImagesFilters", 7);

    expect(
      getLibraryDataValue({
        queryName: "GetSceneImagesFilters",
        dataKey: "facets",
      }),
    ).toBeUndefined();

    scope.stop();
  });

  it("stops exposing data once the library is disposed", () => {
    const scope = runFetchedLibrary("GetSceneImagesFilters", 7);
    scope.stop();

    expect(
      getLibraryDataValue(countConfig("GetSceneImagesFilters")),
    ).toBeUndefined();
  });
});
