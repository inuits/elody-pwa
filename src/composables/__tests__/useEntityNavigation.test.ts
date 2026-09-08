import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useEntityNavigation } from "@/composables/useEntityNavigation";
import type { Entity } from "@/generated-types/queries";

vi.mock("@/helpers", () => ({
  getEntityPageRoute: (entity: any, listItemRouteName: string) => ({
    name: listItemRouteName,
    params: { id: entity.id, type: entity.type },
  }),
}));

const makeEntity = (id: string, type = "asset") =>
  ({ id, type }) as unknown as Entity;

describe("useEntityNavigation", () => {
  beforeEach(() => {
    const { setNavigationEntities } = useEntityNavigation();
    setNavigationEntities(undefined, "");
  });

  it("has no navigation entities before any list is cached", () => {
    const { hasNavigationEntities } = useEntityNavigation();

    expect(hasNavigationEntities()).toBe(false);
  });

  it("reports navigation entities once a list is cached", () => {
    const { setNavigationEntities, hasNavigationEntities } =
      useEntityNavigation();

    setNavigationEntities(ref([makeEntity("1")]), "SingleEntity");

    expect(hasNavigationEntities()).toBe(true);
  });

  it("returns undefined for previous/next when no list is cached", () => {
    const { getPreviousEntity, getNextEntity } = useEntityNavigation();

    expect(getPreviousEntity("1")).toBeUndefined();
    expect(getNextEntity("1")).toBeUndefined();
  });

  it("returns the next entity relative to the current id", () => {
    const { setNavigationEntities, getNextEntity } = useEntityNavigation();
    setNavigationEntities(
      ref([makeEntity("1"), makeEntity("2"), makeEntity("3")]),
      "SingleEntity",
    );

    expect(getNextEntity("1")).toEqual(makeEntity("2"));
  });

  it("returns the previous entity relative to the current id", () => {
    const { setNavigationEntities, getPreviousEntity } =
      useEntityNavigation();
    setNavigationEntities(
      ref([makeEntity("1"), makeEntity("2"), makeEntity("3")]),
      "SingleEntity",
    );

    expect(getPreviousEntity("2")).toEqual(makeEntity("1"));
  });

  it("returns undefined for previous entity at the start of the list", () => {
    const { setNavigationEntities, getPreviousEntity } =
      useEntityNavigation();
    setNavigationEntities(
      ref([makeEntity("1"), makeEntity("2")]),
      "SingleEntity",
    );

    expect(getPreviousEntity("1")).toBeUndefined();
  });

  it("returns undefined for next entity at the end of the list", () => {
    const { setNavigationEntities, getNextEntity } = useEntityNavigation();
    setNavigationEntities(
      ref([makeEntity("1"), makeEntity("2")]),
      "SingleEntity",
    );

    expect(getNextEntity("2")).toBeUndefined();
  });

  it("returns undefined when the current id is not part of the cached list", () => {
    const { setNavigationEntities, getPreviousEntity, getNextEntity } =
      useEntityNavigation();
    setNavigationEntities(
      ref([makeEntity("1"), makeEntity("2")]),
      "SingleEntity",
    );

    expect(getPreviousEntity("unknown")).toBeUndefined();
    expect(getNextEntity("unknown")).toBeUndefined();
  });

  it("reflects live updates to the underlying entities ref", () => {
    const { setNavigationEntities, getNextEntity } = useEntityNavigation();
    const entities = ref([makeEntity("1"), makeEntity("2")]);
    setNavigationEntities(entities, "SingleEntity");

    entities.value = [makeEntity("1"), makeEntity("2"), makeEntity("3")];

    expect(getNextEntity("2")).toEqual(makeEntity("3"));
  });

  it("builds a navigation route for an entity using the cached list item route name", () => {
    const { setNavigationEntities, getNavigationRoute } =
      useEntityNavigation();
    setNavigationEntities(ref([]), "SingleEntity");

    expect(getNavigationRoute(makeEntity("5"))).toEqual({
      name: "SingleEntity",
      params: { id: "5", type: "asset" },
    });
  });
});
