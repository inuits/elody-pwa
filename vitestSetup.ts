import { vi } from "vitest";
import { ref } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();

  return {
    ...actual,
    inject: (key: string) => {
      if (key === "config") {
        return {
          features: {
            multilanguage: {
              supportsMultilingualMetadataEditing: false,
            },
          },
        };
      }
      return actual.inject(key);
    },
  };
});

// Mock OpenLayers and vue3-openlayers
vi.mock("ol/Feature", () => ({
  default: vi.fn(),
}));

vi.mock("ol/extent", () => ({
  Extent: vi.fn(),
  extend: vi.fn(),
}));

vi.mock("ol/View", () => ({
  default: vi.fn(),
}));

vi.mock("vue3-openlayers", () => ({
  Map: {
    OlMap: vi.fn(),
    OlView: vi.fn(),
  },
  Layers: {
    OlTileLayer: vi.fn(),
    OlVectorLayer: vi.fn(),
  },
  Sources: {
    OlSourceXyz: vi.fn(),
    OlSourceVector: vi.fn(),
  },
}));

vi.mock("@/generated-types/queries", async () => {
  return await import("@/__mocks__/queries");
});

vi.mock("@/main", () => {
  const actualModule = vi.importActual("@/main");

  return {
    ...actualModule,
    apolloClient: {
      ...actualModule.apolloClient,
      query: vi.fn().mockResolvedValue({
        data: {},
      }),
    },
    auth: {
      isAuthenticated: ref(true),
    },
  };
});
