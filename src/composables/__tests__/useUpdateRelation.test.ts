import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditStatus } from "@/generated-types/queries";
import type { Entity } from "@/generated-types/queries";

const { mockMutate, mockGetForm } = vi.hoisted(() => ({
  mockMutate: vi.fn().mockResolvedValue({}),
  mockGetForm: vi.fn(),
}));

vi.mock("@/main", () => ({
  apolloClient: { mutate: mockMutate },
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ getForm: mockGetForm }),
}));

import { updateRelationDirect, saveRelatedEntityData } from "@/composables/useUpdateRelation";

const makeEntity = (
  id: string,
  relationValues: Record<string, any[]> = {},
): Entity =>
  ({
    id,
    relationValues,
    intialValues: {},
    teaserMetadata: [],
  }) as unknown as Entity;

describe("updateRelationDirect", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates metadata array on matching relation and marks it Changed", async () => {
    const entity = makeEntity("org-1", {
      refUsers: [
        { key: "user-1", editStatus: EditStatus.Unchanged, metadata: [{ key: "roles", value: ["admin"] }] },
        { key: "user-2", editStatus: EditStatus.Unchanged, metadata: [{ key: "roles", value: ["member"] }] },
      ],
    });

    await updateRelationDirect(entity, "refUsers", "user-1", { roles: "editor" });

    expect(mockMutate).toHaveBeenCalledOnce();
    const { variables } = mockMutate.mock.calls[0][0];
    expect(variables.id).toBe("org-1");

    const relations = variables.formInput.relations;
    const updated = relations.find((r: any) => r.key === "user-1");
    const unchanged = relations.find((r: any) => r.key === "user-2");

    expect(updated?.editStatus).toBe(EditStatus.Changed);
    const rolesEntry = updated?.metadata?.find((m: any) => m.key === "roles");
    expect(rolesEntry?.value).toEqual(["editor"]);
    expect(unchanged?.editStatus).toBe(EditStatus.Unchanged);
  });

  it("wraps scalar in array when existing metadata entry value is an array", async () => {
    const entity = makeEntity("org-1", {
      refUsers: [
        { key: "user-1", editStatus: EditStatus.Unchanged, metadata: [{ key: "roles", value: ["admin"] }] },
      ],
    });

    await updateRelationDirect(entity, "refUsers", "user-1", { roles: "member" });

    const { variables } = mockMutate.mock.calls[0][0];
    const updated = variables.formInput.relations.find((r: any) => r.key === "user-1");
    const rolesEntry = updated?.metadata?.find((m: any) => m.key === "roles");
    expect(rolesEntry?.value).toEqual(["member"]);
  });

  it("adds new metadata entry when key not yet present", async () => {
    const entity = makeEntity("org-1", {
      refUsers: [
        { key: "user-1", editStatus: EditStatus.Unchanged, metadata: [] },
      ],
    });

    await updateRelationDirect(entity, "refUsers", "user-1", { roles: "admin" });

    const { variables } = mockMutate.mock.calls[0][0];
    const updated = variables.formInput.relations.find((r: any) => r.key === "user-1");
    const rolesEntry = updated?.metadata?.find((m: any) => m.key === "roles");
    expect(rolesEntry?.value).toBe("admin");
  });

  it("handles empty relationValues gracefully", async () => {
    const entity = makeEntity("org-1");
    await updateRelationDirect(entity, "refUsers", "user-1", { roles: "member" });

    const { variables } = mockMutate.mock.calls[0][0];
    expect(variables.formInput.relations).toEqual([]);
  });
});

describe("saveRelatedEntityData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does nothing when form has no relatedEntityData.relations entries", async () => {
    mockGetForm.mockReturnValue({ values: { relatedEntityData: { metadata: {}, relations: {} } } });
    await saveRelatedEntityData("org-1", [makeEntity("user-1")]);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("ignores relatedEntityData.metadata (display-only fields like email)", async () => {
    mockGetForm.mockReturnValue({
      values: { relatedEntityData: { metadata: { "email-user-1": "test@example.com" }, relations: {} } },
    });
    await saveRelatedEntityData("org-1", [makeEntity("user-1")]);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("skips null/undefined values in relations", async () => {
    mockGetForm.mockReturnValue({
      values: { relatedEntityData: { metadata: {}, relations: { "roles-user-1": null } } },
    });
    await saveRelatedEntityData("org-1", [makeEntity("user-1")]);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("skips related entities not in the provided list", async () => {
    mockGetForm.mockReturnValue({
      values: { relatedEntityData: { metadata: {}, relations: { "roles-unknown-user": ["admin"] } } },
    });
    await saveRelatedEntityData("org-1", [makeEntity("user-1")]);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("unwraps formatter-wrapped values before saving into metadata array", async () => {
    const user1 = makeEntity("user-1", {
      refOrganizations: [
        { key: "org-1", editStatus: EditStatus.Unchanged, metadata: [{ key: "roles", value: ["venue_admin"] }] },
      ],
    });
    mockGetForm.mockReturnValue({
      values: {
        relatedEntityData: {
          metadata: {},
          relations: { "roles-user-1": { label: "venue_member", formatter: "pill" } },
        },
      },
    });

    await saveRelatedEntityData("org-1", [user1]);

    expect(mockMutate).toHaveBeenCalledOnce();
    const { variables } = mockMutate.mock.calls[0][0];
    const updatedRelation = variables.formInput.relations.find((r: any) => r.key === "org-1");
    const rolesEntry = updatedRelation?.metadata?.find((m: any) => m.key === "roles");
    expect(rolesEntry?.value).toEqual(["venue_member"]);
  });

  it("calls updateRelationDirect for each linked entity with non-null values", async () => {
    const user1 = makeEntity("user-1", {
      refOrganizations: [
        { key: "org-1", editStatus: EditStatus.Unchanged, metadata: [{ key: "roles", value: ["admin"] }] },
      ],
    });
    mockGetForm.mockReturnValue({
      values: {
        relatedEntityData: {
          metadata: { "email-user-1": "test@example.com" },
          relations: { "roles-user-1": "member" },
        },
      },
    });

    await saveRelatedEntityData("org-1", [user1]);

    expect(mockMutate).toHaveBeenCalledOnce();
    const { variables } = mockMutate.mock.calls[0][0];
    expect(variables.id).toBe("user-1");
    const updatedRelation = variables.formInput.relations.find((r: any) => r.key === "org-1");
    expect(updatedRelation?.editStatus).toBe(EditStatus.Changed);
    const rolesEntry = updatedRelation?.metadata?.find((m: any) => m.key === "roles");
    expect(rolesEntry?.value).toEqual(["member"]);
  });
});
