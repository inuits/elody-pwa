import { describe, expect, it, vi } from "vitest";

// The composable pulls in apollo + entity mutations via the app-wide import chain;
// only the two pure helpers are under test here.
vi.mock("@/main", () => ({ apolloClient: {} }));
vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: () => ({
    createEntity: vi.fn(),
    saveEntityValues: vi.fn(),
    addRelations: vi.fn(),
  }),
}));
vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({ getUserName: () => "Tester" }),
}));

const { groupComments, extractTaggedRelations, flattenRelationsExceptTags } =
  await import("../useComments");

const comment = (
  id: string,
  { subjectId, status, createdAt }: any = {},
): any => ({
  id,
  uuid: id,
  type: "comment",
  intialValues: { body: `<p>${id}</p>`, status, created_at: createdAt },
  relationValues: {
    refParentEntity: [{ key: "W-1", type: "refParentEntity" }],
    ...(subjectId
      ? { refSubject: [{ key: subjectId, type: "refSubject" }] }
      : {}),
  },
});

describe("flattenRelationsExceptTags", () => {
  it("keeps an editStatus on every surviving relation", () => {
    // BaseRelationValuesInput.editStatus is non-null, so a relation without one fails
    // variable coercion before the mutation is ever sent — which is what broke
    // resolving a thread.
    const relations = flattenRelationsExceptTags(
      comment("CMT-a", { subjectId: "CMT-x" }),
      ["refTaggedUsers"],
    );

    expect(relations.length).toBe(2);
    for (const relation of relations) {
      expect(relation.editStatus).toBeTruthy();
    }
  });

  it("drops the tag relations it is asked to replace", () => {
    const withTags = comment("CMT-a");
    withTags.relationValues.refTaggedUsers = [
      { key: "U-1", type: "refTaggedUsers" },
    ];

    const relations = flattenRelationsExceptTags(withTags, ["refTaggedUsers"]);

    expect(relations.map((relation: any) => relation.type)).toEqual([
      "refParentEntity",
    ]);
  });
});

describe("groupComments", () => {
  it("splits subjects from replies and counts them", () => {
    const threads = groupComments([
      comment("CMT-a", { status: "open", createdAt: "2026-01-01" }),
      comment("CMT-b", { createdAt: "2026-01-02" }),
      comment("CMT-a1", { subjectId: "CMT-a", createdAt: "2026-01-03" }),
      comment("CMT-a2", { subjectId: "CMT-a", createdAt: "2026-01-04" }),
      comment("CMT-b1", { subjectId: "CMT-b", createdAt: "2026-01-05" }),
    ]);

    expect(threads).toHaveLength(2);

    const threadA = threads.find((t) => t.subject.id === "CMT-a")!;
    const threadB = threads.find((t) => t.subject.id === "CMT-b")!;
    expect(threadA.replyCount).toBe(2);
    expect(threadB.replyCount).toBe(1);
    expect(threadA.replies.map((r) => r.id)).toEqual(["CMT-a1", "CMT-a2"]);
  });

  it("defaults a subject with no status property to open", () => {
    const [thread] = groupComments([comment("CMT-a")]);
    expect(thread.status).toBe("open");
  });

  it("keeps an explicit resolved status", () => {
    const [thread] = groupComments([comment("CMT-a", { status: "resolved" })]);
    expect(thread.status).toBe("resolved");
  });

  it("orders threads newest first and replies oldest first", () => {
    const threads = groupComments([
      comment("CMT-old", { createdAt: "2026-01-01" }),
      comment("CMT-new", { createdAt: "2026-06-01" }),
      comment("CMT-r2", { subjectId: "CMT-new", createdAt: "2026-06-03" }),
      comment("CMT-r1", { subjectId: "CMT-new", createdAt: "2026-06-02" }),
    ]);

    expect(threads.map((t) => t.subject.id)).toEqual(["CMT-new", "CMT-old"]);
    expect(threads[0].replies.map((r) => r.id)).toEqual(["CMT-r1", "CMT-r2"]);
  });

  it("ignores a reply whose subject is not in the list", () => {
    const threads = groupComments([
      comment("CMT-a"),
      comment("CMT-orphan", { subjectId: "CMT-missing" }),
    ]);
    expect(threads).toHaveLength(1);
    expect(threads[0].replyCount).toBe(0);
  });
});

describe("extractTaggedRelations", () => {
  const configurations: any = [
    { tag: "user", relationType: "refTaggedUsers", taggableEntityType: "user" },
    { tag: "work", relationType: "refTaggedEntities", taggableEntityType: "work" },
  ];

  it("maps @ and # tags to their configured relation types and dedupes", () => {
    const html =
      "<p>hey " +
      '<elody-user data-entity-id="U-1" contenteditable="false">Ann</elody-user>' +
      " see " +
      '<elody-work data-entity-id="W-7" contenteditable="false">Dune</elody-work>' +
      // Same user tagged twice must yield a single relation.
      '<elody-user data-entity-id="U-1" contenteditable="false">Ann</elody-user>' +
      "</p>";

    const relations = extractTaggedRelations(html, configurations);

    expect(relations).toHaveLength(2);
    expect(
      relations.filter((r) => r.type === "refTaggedUsers").map((r) => r.key),
    ).toEqual(["U-1"]);
    expect(
      relations.filter((r) => r.type === "refTaggedEntities").map((r) => r.key),
    ).toEqual(["W-7"]);
  });

  it("keeps the same id separate when tagged as a user and as an entity", () => {
    const html =
      '<p><elody-user data-entity-id="X-1">a</elody-user>' +
      '<elody-work data-entity-id="X-1">b</elody-work></p>';
    expect(extractTaggedRelations(html, configurations)).toHaveLength(2);
  });

  it("returns nothing for an untagged body", () => {
    expect(extractTaggedRelations("<p>hi there</p>", configurations)).toEqual(
      [],
    );
  });

  it("skips tag elements that carry no entityId", () => {
    expect(
      extractTaggedRelations("<p><elody-user>Ann</elody-user></p>", configurations),
    ).toEqual([]);
  });

  it("ignores an element whose name is not in this composer's configuration", () => {
    const html = '<p><elody-word data-entity-id="W-9">x</elody-word></p>';
    expect(extractTaggedRelations(html, configurations)).toEqual([]);
  });

  it("returns nothing when there is no body or no configuration", () => {
    expect(extractTaggedRelations("", configurations)).toEqual([]);
    expect(extractTaggedRelations("<p>x</p>", [])).toEqual([]);
  });
});
