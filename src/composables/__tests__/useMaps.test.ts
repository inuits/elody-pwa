import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/composables/useListItemHelper", () => ({
  useListItemHelper: () => ({ setHoveredListItem: vi.fn() }),
}));

vi.mock("@/composables/useGraphqlAsync", () => ({
  useGraphqlAsync: () => ({
    getQueryDocument: vi.fn(),
    queryAsync: vi.fn(),
  }),
}));

// Track Feature instances created during each test.
// vi.hoisted ensures this array is available when the vi.mock factory runs (mocks are hoisted).
const mockInstances = vi.hoisted(
  () =>
    [] as Array<{
      setId: ReturnType<typeof vi.fn>;
      getId: ReturnType<typeof vi.fn>;
      getGeometry: ReturnType<typeof vi.fn>;
      getStyle: ReturnType<typeof vi.fn>;
    }>,
);

// Override the "ol" module so that Feature is a constructable class with trackable methods.
// Regular class syntax avoids the "arrow functions cannot be constructors" error.
vi.mock("ol", () => {
  class FeatureMock {
    private _id: string | number | undefined;
    private _geometry: any;
    readonly setId: ReturnType<typeof vi.fn>;
    readonly getId: ReturnType<typeof vi.fn>;
    readonly getGeometry: ReturnType<typeof vi.fn>;
    readonly getStyle: ReturnType<typeof vi.fn>;

    constructor({ geometry }: any = {}) {
      this._geometry = geometry;
      const self = this;
      this.setId = vi.fn((id: string | number) => {
        self._id = id;
      });
      this.getId = vi.fn(() => self._id);
      this.getGeometry = vi.fn(() => self._geometry);
      this.getStyle = vi.fn(() => null);
      mockInstances.push(this);
    }
  }
  return { Feature: FeatureMock };
});

import { useMaps } from "../useMaps";

describe("useMaps – createPointFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInstances.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is exported from useMaps", () => {
    const maps = useMaps();
    expect(typeof maps.createPointFeature).toBe("function");
  });

  it("sets the entity id on the feature via setId", () => {
    const { createPointFeature } = useMaps();
    createPointFeature(51.0, 4.5, "entity-abc");
    expect(mockInstances[0].setId).toHaveBeenCalledWith("entity-abc");
  });

  it("returns the constructed feature instance", () => {
    const { createPointFeature } = useMaps();
    const result = createPointFeature(51.0, 4.5, "entity-1");
    expect(result).toBe(mockInstances[0]);
  });

  it("passes a geometry to the Feature constructor", () => {
    const { createPointFeature } = useMaps();
    createPointFeature(51.0, 4.5, "entity-1", "EPSG:4326");
    const geometry = mockInstances[0].getGeometry();
    // geometry is the real OL Point object (ol/geom is not mocked globally)
    expect(geometry).toBeDefined();
    expect(geometry).not.toBeNull();
  });

  it("does not set an inline style (cluster source applies its own styling)", () => {
    const { createPointFeature } = useMaps();
    createPointFeature(51.0, 4.5, "entity-1");
    expect(mockInstances[0].getStyle()).toBeNull();
  });

  it("creates independent feature instances for separate calls", () => {
    const { createPointFeature } = useMaps();
    createPointFeature(51.0, 4.5, "entity-1");
    createPointFeature(52.0, 5.0, "entity-2");
    expect(mockInstances).toHaveLength(2);
    expect(mockInstances[0].setId).toHaveBeenCalledWith("entity-1");
    expect(mockInstances[1].setId).toHaveBeenCalledWith("entity-2");
  });
});
