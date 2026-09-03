import { describe, expect, it, beforeEach } from "vitest";
import { useModalActions } from "@/composables/useModalActions";
import {
  ActionType,
  BulkOperationTypes,
  Collection,
  RouteNames,
} from "@/generated-types/queries";

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

describe("useModalActions download", () => {
  beforeEach(() => {
    useModalActions().resetAllProperties();
  });

  // The completeness-overview panels render their mediafile list through a
  // per-panel custom context, so the ids can only be recognised as mediafiles
  // by the type the enqueued items carry themselves.
  it("sends mediafiles enqueued in a custom context as mediafiles, not entities", () => {
    const { initializePropertiesForDownload, extractActionArguments } =
      useModalActions();

    initializePropertiesForDownload(
      [
        { id: "mf-1", type: "mediafile" },
        { id: "mf-2", type: "MediaFile" },
      ] as any,
      "EntityElementListrefMediafilesPosters" as any,
    );

    expect(extractActionArguments(ActionType.Download)).toMatchObject({
      mediafiles: ["mf-1", "mf-2"],
      entities: [],
    });
  });

  it("keeps sending non-mediafile items as entities", () => {
    const { initializePropertiesForDownload, extractActionArguments } =
      useModalActions();

    initializePropertiesForDownload(
      [{ id: "prod-1", type: "production" }] as any,
      "EntityElementListrefProductions" as any,
    );

    expect(extractActionArguments(ActionType.Download)).toMatchObject({
      mediafiles: [],
      entities: ["prod-1"],
    });
  });

  it("falls back to the context when the enqueued items carry no type", () => {
    const { initializePropertiesForDownload, extractActionArguments } =
      useModalActions();

    initializePropertiesForDownload(
      [{ id: "mf-1" }] as any,
      RouteNames.Mediafiles,
    );

    expect(extractActionArguments(ActionType.Download)).toMatchObject({
      mediafiles: ["mf-1"],
      entities: [],
    });
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
