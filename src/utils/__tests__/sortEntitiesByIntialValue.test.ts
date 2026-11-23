import { describe, expect, it } from "vitest";
import { sortEntitiesByIntialValue } from "@/utils/sortEntitiesByIntialValue";

const entity = (id: string, value: unknown) =>
  ({ id, intialValues: { volume_number_label: value } }) as any;

const ids = (entities: any[]) => entities.map((item) => item.id);

describe("sortEntitiesByIntialValue", () => {
  it("sorts numerically first, then alphabetically", () => {
    const entities = [
      entity("4d", "4d"),
      entity("10", "10"),
      entity("1b", "1b"),
      entity("3a", "3a"),
      entity("2", "2"),
      entity("1a", "1a"),
      entity("4c", "4c"),
    ];

    expect(
      ids(sortEntitiesByIntialValue(entities, "volume_number_label")),
    ).toEqual(["1a", "1b", "2", "3a", "4c", "4d", "10"]);
  });

  it("puts entities without a value last, keeping their order", () => {
    const entities = [
      entity("empty", ""),
      entity("2", "2"),
      entity("missing", undefined),
      entity("1", "1"),
    ];

    expect(
      ids(sortEntitiesByIntialValue(entities, "volume_number_label")),
    ).toEqual(["1", "2", "empty", "missing"]);
  });

  it("reads formatted values and numbers", () => {
    const entities = [
      entity("b", { label: "2", formatter: "" }),
      entity("a", 1),
    ];

    expect(
      ids(sortEntitiesByIntialValue(entities, "volume_number_label")),
    ).toEqual(["a", "b"]);
  });

  it("does not mutate the input", () => {
    const entities = [entity("2", "2"), entity("1", "1")];

    sortEntitiesByIntialValue(entities, "volume_number_label");

    expect(ids(entities)).toEqual(["2", "1"]);
  });
});
