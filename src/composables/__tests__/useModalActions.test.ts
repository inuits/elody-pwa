import { describe, expect, it, beforeEach } from "vitest";
import { useModalActions } from "@/composables/useModalActions";
import { ActionType, BulkOperationTypes, Collection } from "@/generated-types/queries";

describe("useModalActions extractActionArguments(Submit)", () => {
  beforeEach(() => {
    useModalActions().resetAllProperties();
  });

  it("builds a relation from parentId when a real relationType is configured", () => {
    const { initializeGeneralProperties, extractActionArguments } =
      useModalActions();
    initializeGeneralProperties(
      "org-1",
      "refOrganizations",
      Collection.Entities,
      [],
      BulkOperationTypes.CreateEntity,
    );

    expect(extractActionArguments(ActionType.Submit)).toEqual({
      refOrganizations: [
        { key: "org-1", type: "refOrganizations", editStatus: "new" },
      ],
    });
  });

  // formRelationType is unset for most bulk ops (e.g. a guided-flow create
  // step with no relations of its own) — initializeGeneralProperties still
  // sets parentId unconditionally, with relationType defaulting to "". That
  // must not produce a bogus, type-less relation on the created entity.
  it("does not build a relation when relationType is empty (no formRelationType configured)", () => {
    const { initializeGeneralProperties, extractActionArguments } =
      useModalActions();
    initializeGeneralProperties(
      "org-1",
      "",
      Collection.Entities,
      [],
      BulkOperationTypes.CreateEntity,
    );

    // falls through to the generic (empty) callback-functions arguments
    // instead of a relation object
    expect(extractActionArguments(ActionType.Submit)).toEqual([]);
  });
});

describe("useModalActions bulk update metadata", () => {
  beforeEach(() => {
    useModalActions().resetAllProperties();
  });

  it("stashes the enqueued item ids and returns them for BulkUpdateMetadata", () => {
    const { initializePropertiesForBulkUpdateMetadata, extractActionArguments } =
      useModalActions();

    initializePropertiesForBulkUpdateMetadata([
      { id: "notif-1" },
      { id: "notif-2" },
      { id: "notif-3" },
    ] as any);

    expect(extractActionArguments(ActionType.BulkUpdateMetadata)).toEqual({
      ids: ["notif-1", "notif-2", "notif-3"],
    });
  });

  it("returns an empty id list when nothing was stashed", () => {
    const { extractActionArguments } = useModalActions();

    expect(extractActionArguments(ActionType.BulkUpdateMetadata)).toEqual({
      ids: [],
    });
  });
});
