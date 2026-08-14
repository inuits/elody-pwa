import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useEntityDiff, computeEntityDiff } from "../useEntityDiff";
import { getMetadataFields } from "@/helpers";

vi.mock("@/helpers", () => ({
  getMetadataFields: vi.fn(),
}));

describe("useEntityDiff", () => {
  const mockPanels = ref<any[]>([{ panelType: "info" }]);

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
    mockPanels.value = [{ panelType: "info" }];
  });

  it("should return null if no entity is provided", () => {
    const props = { entity: null as any, entities: [], entityId: "1" };
    const { diffedResults } = useEntityDiff(props, mockPanels);
    expect(diffedResults.value).toBeNull();
  });

  it("should handle the 'Initial Version' case (no previous version available)", () => {
    const entityA = createMockEntity("v1", "First Name", "Active");
    const props = {
      entity: entityA,
      entities: [entityA],
      entityId: "1",
    };

    const { diffedResults } = useEntityDiff(props, mockPanels);

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

    const { diffedResults } = useEntityDiff(props, mockPanels);

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
    const { diffedResults } = useEntityDiff(props, mockPanels);

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
    const { diffedResults, keysToCompare } = useEntityDiff(props, mockPanels);

    expect(keysToCompare.value).toContain("name");
    expect(
      diffedResults.value?.selectedVersion.intialValues.name.formatter,
    ).toBe("pill|added");

    mockPanels.value = [];

    expect(keysToCompare.value).toEqual([]);
  });

  it("should correctly diff arrays", () => {
    const v1 = { id: "v1", intialValues: { tags: ["vue", "ts"] } } as any;
    const v2 = { id: "v2", intialValues: { tags: ["vue", "js"] } } as any;

    vi.mocked(getMetadataFields).mockReturnValue([{ key: "tags" }]);

    const props = { entity: v2, entities: [v2, v1], entityId: "1" };
    const { diffedResults } = useEntityDiff(props, mockPanels);

    expect(
      diffedResults.value?.selectedVersion.intialValues.tags.formatter,
    ).toBe("pill|added");
    expect(
      diffedResults.value?.selectedVersion.intialValues.tags.label,
    ).toEqual(["vue", "js"]);
  });

  it("should merge fields from multiple panels", () => {
    const v1 = createMockEntity("id-1", "Old Name", "Pending");
    const v2 = createMockEntity("id-2", "New Name", "Active");

    const multiplePanels = ref<any[]>([
      { panelType: "info" },
      { panelType: "status" },
    ]);

    vi.mocked(getMetadataFields)
      .mockReturnValueOnce([{ key: "name" }])
      .mockReturnValueOnce([{ key: "status" }]);

    const props = { entity: v2, entities: [v2, v1], entityId: "1" };
    const { diffedResults, keysToCompare } = useEntityDiff(props, multiplePanels);

    expect(keysToCompare.value).toContain("name");
    expect(keysToCompare.value).toContain("status");
    expect(keysToCompare.value).toHaveLength(2);
    expect(diffedResults.value?.selectedVersion.intialValues.name.formatter).toBe("pill|added");
    expect(diffedResults.value?.selectedVersion.intialValues.status.formatter).toBe("pill|added");
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
    const { diffedResults: resA } = useEntityDiff(propsA, mockPanels);
    expect(
      resA.value?.selectedVersion.intialValues.updated.formatter,
    ).toBeUndefined();

    const propsB = { entity: v3, entities: [v3, v1], entityId: "1" };
    const { diffedResults: resB } = useEntityDiff(propsB, mockPanels);
    expect(resB.value?.selectedVersion.intialValues.updated.formatter).toBe(
      "pill|added",
    );
    expect(
      resB.value?.selectedVersion.intialValues.updated.label,
    ).toStrictEqual(date3);
  });
});

describe("computeEntityDiff - repeatable panel fields", () => {
  const repeatableFields = [
    {
      repetitionKey: "parallel_title_group",
      fieldKeys: ["parallel_title", "other_title_details"],
    },
  ];

  it("pill-wraps only the sub-field that changed within a repetition item, leaving the rest of the item untouched", () => {
    const current = {
      id: "current",
      intialValues: {
        parallel_title_group: [
          { parallel_title: "New title", other_title_details: "Same" },
        ],
      },
    } as any;
    const previous = {
      id: "previous",
      intialValues: {
        parallel_title_group: [
          { parallel_title: "Old title", other_title_details: "Same" },
        ],
      },
    } as any;

    const result = computeEntityDiff({
      previousVersion: previous,
      selectedVersion: current,
      fields: [],
      repeatableFields,
    });

    expect(
      result.selectedVersion.intialValues.parallel_title_group[0]
        .parallel_title,
    ).toEqual({ formatter: "pill|added", label: "New title" });
    expect(
      result.previousVersion.intialValues.parallel_title_group[0]
        .parallel_title,
    ).toEqual({ formatter: "pill|modified", label: "Old title" });
    expect(
      result.selectedVersion.intialValues.parallel_title_group[0]
        .other_title_details,
    ).toBe("Same");
    expect(
      result.previousVersion.intialValues.parallel_title_group[0]
        .other_title_details,
    ).toBe("Same");
  });

  it("marks every sub-field of a repetition item added entirely on the current side as pill|added", () => {
    const current = {
      id: "current",
      intialValues: {
        parallel_title_group: [
          { parallel_title: "First", other_title_details: "A" },
          { parallel_title: "Second", other_title_details: "B" },
        ],
      },
    } as any;
    const previous = {
      id: "previous",
      intialValues: {
        parallel_title_group: [
          { parallel_title: "First", other_title_details: "A" },
        ],
      },
    } as any;

    const result = computeEntityDiff({
      previousVersion: previous,
      selectedVersion: current,
      fields: [],
      repeatableFields,
    });

    const currentArr = result.selectedVersion.intialValues.parallel_title_group;
    expect(currentArr).toHaveLength(2);
    expect(currentArr[0].parallel_title).toBe("First");
    expect(currentArr[1].parallel_title).toEqual({
      formatter: "pill|added",
      label: "Second",
    });

    expect(
      result.previousVersion.intialValues.parallel_title_group,
    ).toHaveLength(1);
  });

  it("marks a repetition item only present on the previous side as pill|modified, without padding the current side", () => {
    const current = {
      id: "current",
      intialValues: {
        parallel_title_group: [
          { parallel_title: "First", other_title_details: "A" },
        ],
      },
    } as any;
    const previous = {
      id: "previous",
      intialValues: {
        parallel_title_group: [
          { parallel_title: "First", other_title_details: "A" },
          { parallel_title: "Removed", other_title_details: "B" },
        ],
      },
    } as any;

    const result = computeEntityDiff({
      previousVersion: previous,
      selectedVersion: current,
      fields: [],
      repeatableFields,
    });

    expect(
      result.selectedVersion.intialValues.parallel_title_group,
    ).toHaveLength(1);

    const prevArr = result.previousVersion.intialValues.parallel_title_group;
    expect(prevArr).toHaveLength(2);
    expect(prevArr[1].parallel_title).toEqual({
      formatter: "pill|modified",
      label: "Removed",
    });
  });

  it("leaves repeatable fields untouched when there is no previous version to diff against", () => {
    const current = {
      id: "current",
      intialValues: {
        parallel_title_group: [
          { parallel_title: "First", other_title_details: "A" },
        ],
      },
    } as any;

    const result = computeEntityDiff({
      previousVersion: null,
      selectedVersion: current,
      fields: [],
      repeatableFields,
    });

    expect(
      result.selectedVersion.intialValues.parallel_title_group[0]
        .parallel_title,
    ).toBe("First");
  });
});
