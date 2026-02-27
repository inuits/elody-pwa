import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useEntityDiff } from "../useEntityDiff";
import { getMetadataFields } from "@/helpers";

vi.mock("@/helpers", () => ({
  getMetadataFields: vi.fn(),
}));

describe("useEntityDiff", () => {
  const mockPanel = ref<any>({ panelType: "info" });

  const createMockEntity = (id: string, name: string, status: string) =>
    ({
      id,
      intialValues: {
        name,
        status,
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMetadataFields).mockReturnValue([
      { key: "name" },
      { key: "status" },
    ]);
    mockPanel.value = { panelType: "info" };
  });

  it("should return null if no entity is provided", () => {
    const props = { entity: null as any, entities: [], entityId: "1" };
    const { diffedResults } = useEntityDiff(props, mockPanel);
    expect(diffedResults.value).toBeNull();
  });

  it("should handle the 'Initial Version' case (no previous version available)", () => {
    const entityA = createMockEntity("v1", "First Name", "Active");
    const props = {
      entity: entityA,
      entities: [entityA],
      entityId: "1",
    };

    const { diffedResults } = useEntityDiff(props, mockPanel);

    expect(diffedResults.value?.previousVersion).toEqual({});
    expect(diffedResults.value?.selectedVersion.intialValues.name).toBe(
      "First Name",
    );
    expect(diffedResults.value?.selectedVersion.id).toBe("v1_selected");
  });

  it("should identify differences and apply pill formatters", () => {
    const v1 = createMockEntity("id-1", "Old Name", "Pending");
    const v2 = createMockEntity("id-2", "New Name", "Pending");

    const props = {
      entity: v2,
      entities: [v2, v1],
      entityId: "parent-1",
    };

    const { diffedResults } = useEntityDiff(props, mockPanel);

    expect(diffedResults.value?.previousVersion.intialValues.name).toEqual({
      formatter: "pill|modified",
      label: "Old Name",
    });

    expect(diffedResults.value?.selectedVersion.intialValues.name).toEqual({
      formatter: "pill|added",
      label: "New Name",
    });

    expect(diffedResults.value?.selectedVersion.intialValues.status).toBe(
      "Pending",
    );
  });

  it("should handle formatted values (label/formatter objects) correctly", () => {
    const v1 = {
      id: "v1",
      intialValues: {
        status: { formatter: "some-style", label: "Archived" },
      },
    } as any;

    const v2 = {
      id: "v2",
      intialValues: {
        status: { formatter: "some-style", label: "Active" },
      },
    } as any;

    const props = { entity: v2, entities: [v2, v1], entityId: "1" };
    const { diffedResults } = useEntityDiff(props, mockPanel);

    expect(diffedResults.value?.selectedVersion.intialValues.status.label).toBe(
      "Active",
    );
    expect(
      diffedResults.value?.selectedVersion.intialValues.status.formatter,
    ).toBe("pill|added");
  });

  it("should update diffs when panel or keys change", () => {
    const v1 = createMockEntity("id-1", "A", "StatusA");
    const v2 = createMockEntity("id-2", "B", "StatusA");

    const props = { entity: v2, entities: [v2, v1], entityId: "1" };
    const { diffedResults, keysToCompare } = useEntityDiff(props, mockPanel);

    expect(keysToCompare.value).toContain("name");
    expect(
      diffedResults.value?.selectedVersion.intialValues.name.formatter,
    ).toBe("pill|added");

    mockPanel.value = null;

    expect(keysToCompare.value).toEqual([]);
  });

  it("should correctly diff arrays", () => {
    const v1 = { id: "v1", intialValues: { tags: ["vue", "ts"] } } as any;
    const v2 = { id: "v2", intialValues: { tags: ["vue", "js"] } } as any;

    vi.mocked(getMetadataFields).mockReturnValue([{ key: "tags" }]);

    const props = { entity: v2, entities: [v2, v1], entityId: "1" };
    const { diffedResults } = useEntityDiff(props, mockPanel);

    expect(
      diffedResults.value?.selectedVersion.intialValues.tags.formatter,
    ).toBe("pill|added");
    expect(
      diffedResults.value?.selectedVersion.intialValues.tags.label,
    ).toEqual(["vue", "js"]);
  });

  it("should correctly handle Date objects", () => {
    const date1 = new Date("2024-01-01T10:00:00Z");
    const date2 = new Date("2024-01-01T10:00:00Z");
    const date3 = new Date("2024-01-02T10:00:00Z");

    const v1 = { id: "v1", intialValues: { updated: date1 } } as any;
    const v2 = { id: "v2", intialValues: { updated: date2 } } as any;
    const v3 = { id: "v3", intialValues: { updated: date3 } } as any;

    vi.mocked(getMetadataFields).mockReturnValue([{ key: "updated" }]);

    const propsA = { entity: v2, entities: [v2, v1], entityId: "1" };
    const { diffedResults: resA } = useEntityDiff(propsA, mockPanel);
    expect(
      resA.value?.selectedVersion.intialValues.updated.formatter,
    ).toBeUndefined();

    const propsB = { entity: v3, entities: [v3, v1], entityId: "1" };
    const { diffedResults: resB } = useEntityDiff(propsB, mockPanel);
    expect(resB.value?.selectedVersion.intialValues.updated.formatter).toBe(
      "pill|added",
    );
    expect(
      resB.value?.selectedVersion.intialValues.updated.label,
    ).toStrictEqual(date3);
  });
});
