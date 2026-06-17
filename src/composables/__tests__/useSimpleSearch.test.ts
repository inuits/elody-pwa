import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSimpleSearch } from "@/composables/useSimpleSearch";
import { AdvancedFilterTypes, Operator, Permission } from "@/generated-types/queries";

let mockConfig: any;

vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    inject: vi.fn(() => mockConfig),
  };
});

const mockCan = vi.fn();
vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({ can: mockCan }),
}));

const makeConfig = (overrides: Record<string, any> = {}) => ({
  features: {
    simpleSearch: {
      itemTypes: ["production", "venue"],
      simpleSearchMetadataKey: ["title"],
      clientKeyFormat: [],
      ...overrides,
    },
  },
});

describe("useSimpleSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = makeConfig();
    mockCan.mockReturnValue(true);
  });

  describe("buildFilters — entity type filter", () => {
    it("prepends entity type filter when all types are permitted", () => {
      const { buildFilters } = useSimpleSearch();
      const filters = buildFilters("venice");
      const typeFilter = filters.find((f) => f.type === AdvancedFilterTypes.Selection);
      expect(typeFilter).toBeDefined();
      expect(typeFilter?.key).toBe("type");
      expect(typeFilter?.value).toEqual(["production", "venue"]);
      expect(typeFilter?.match_exact).toBe(true);
    });

    it("excludes types the user has no permission for", () => {
      mockCan.mockImplementation(
        (_permission: string, type: string) => type === "production",
      );
      const { buildFilters } = useSimpleSearch();
      const filters = buildFilters("venice");
      const typeFilter = filters.find((f) => f.type === AdvancedFilterTypes.Selection);
      expect(typeFilter?.value).toEqual(["production"]);
    });

    it("omits entity type filter when no types are permitted", () => {
      mockCan.mockReturnValue(false);
      const { buildFilters } = useSimpleSearch();
      const filters = buildFilters("venice");
      expect(filters.every((f) => f.type !== AdvancedFilterTypes.Selection)).toBe(true);
    });

    it("omits entity type filter when itemTypes is empty", () => {
      mockConfig = makeConfig({ itemTypes: [] });
      const { buildFilters } = useSimpleSearch();
      const filters = buildFilters("venice");
      expect(filters.every((f) => f.type !== AdvancedFilterTypes.Selection)).toBe(true);
    });

    it("entity type filter appears before text filters", () => {
      const { buildFilters } = useSimpleSearch();
      const filters = buildFilters("venice");
      const typeIdx = filters.findIndex((f) => f.type === AdvancedFilterTypes.Selection);
      const textIdx = filters.findIndex((f) => f.type === AdvancedFilterTypes.Text);
      expect(typeIdx).toBeLessThan(textIdx);
    });
  });

  describe("buildFilters — text filters", () => {
    it("creates one text filter per metadata key", () => {
      mockConfig = makeConfig({ simpleSearchMetadataKey: ["title", "description"] });
      const { buildFilters } = useSimpleSearch();
      const textFilters = buildFilters("venice").filter(
        (f) => f.type === AdvancedFilterTypes.Text,
      );
      expect(textFilters).toHaveLength(2);
    });

    it("sets type=Text, operator=Or, match_exact=false on text filters", () => {
      const { buildFilters } = useSimpleSearch();
      const textFilter = buildFilters("venice").find(
        (f) => f.type === AdvancedFilterTypes.Text,
      );
      expect(textFilter?.type).toBe(AdvancedFilterTypes.Text);
      expect(textFilter?.operator).toBe(Operator.Or);
      expect(textFilter?.match_exact).toBe(false);
    });

    it("passes search term as filter value", () => {
      const { buildFilters } = useSimpleSearch();
      const textFilter = buildFilters("venice").find(
        (f) => f.type === AdvancedFilterTypes.Text,
      );
      expect(textFilter?.value).toBe("venice");
    });
  });

  describe("key formatting", () => {
    it("uses default elody key format when clientKeyFormat is empty", () => {
      const { buildFilters } = useSimpleSearch();
      const textFilter = buildFilters("venice").find(
        (f) => f.type === AdvancedFilterTypes.Text,
      );
      expect(textFilter?.key).toEqual(["elody:1|metadata.title.value"]);
    });

    it("applies clientKeyFormat template when provided", () => {
      mockConfig = makeConfig({
        clientKeyFormat: ["ns:1|properties.$metadata_key.value"],
      });
      const { buildFilters } = useSimpleSearch();
      const textFilter = buildFilters("venice").find(
        (f) => f.type === AdvancedFilterTypes.Text,
      );
      expect(textFilter?.key).toEqual(["ns:1|properties.title.value"]);
    });

    it("applies all clientKeyFormat entries per metadata key", () => {
      mockConfig = makeConfig({
        clientKeyFormat: ["ns:1|properties.$metadata_key.value", "ns:2|meta.$metadata_key"],
      });
      const { buildFilters } = useSimpleSearch();
      const textFilter = buildFilters("venice").find(
        (f) => f.type === AdvancedFilterTypes.Text,
      );
      expect(textFilter?.key).toEqual([
        "ns:1|properties.title.value",
        "ns:2|meta.title",
      ]);
    });

    it("uses preConfigured key directly when metadataKey has preConfigured flag", () => {
      mockConfig = makeConfig({
        simpleSearchMetadataKey: [{ preConfigured: true, key: ["custom:key"] }],
      });
      const { buildFilters } = useSimpleSearch();
      const textFilter = buildFilters("venice").find(
        (f) => f.type === AdvancedFilterTypes.Text,
      );
      expect(textFilter?.key).toEqual(["custom:key"]);
    });
  });
});
