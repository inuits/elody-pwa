import { describe, expect, it } from "vitest";
import {
  moveItem,
  pageOfIndex,
  parseOrderCsv,
  serializeOrderCsv,
} from "@/composables/useEntityReorder";

describe("moveItem", () => {
  it("moves an item down and up", () => {
    expect(moveItem(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("clamps the target to the list bounds", () => {
    expect(moveItem(["a", "b", "c"], 1, -5)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 0, 99)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the input", () => {
    const order = ["a", "b"];
    moveItem(order, 0, 1);
    expect(order).toEqual(["a", "b"]);
  });
});

describe("pageOfIndex", () => {
  it("returns the 0-based page an absolute index sits on", () => {
    expect(pageOfIndex(0, 20)).toBe(0);
    expect(pageOfIndex(19, 20)).toBe(0);
    expect(pageOfIndex(20, 20)).toBe(1);
    expect(pageOfIndex(47, 20)).toBe(2);
  });
});

describe("order csv", () => {
  const csv = [
    "id,type,file_identifier,owning_entity_id",
    "m1,mediafile,first.jpg,a1",
    'm2,mediafile,"second, with comma.jpg",a1',
    "m3,mediafile,third.jpg,a1",
    "",
  ].join("\n");

  it("parses rows with their id and filename", () => {
    const parsed = parseOrderCsv(csv);
    expect(parsed.header).toBe("id,type,file_identifier,owning_entity_id");
    expect(parsed.rows.map((row) => row.id)).toEqual(["m1", "m2", "m3"]);
    expect(parsed.rows[1].name).toBe("second, with comma.jpg");
  });

  it("falls back to the base filename column", () => {
    const parsed = parseOrderCsv(
      "identifier,type,filename\r\nx,mediafile,x.tif\r\n",
    );
    expect(parsed.rows).toEqual([
      { id: "x", name: "x.tif", line: "x,mediafile,x.tif" },
    ]);
  });

  it("serializes the rows in the given order, keeping each line intact", () => {
    const parsed = parseOrderCsv(csv);
    expect(
      serializeOrderCsv(parsed.header, ["m3", "m1", "m2"], parsed.rows),
    ).toBe(
      [
        "id,type,file_identifier,owning_entity_id",
        "m3,mediafile,third.jpg,a1",
        "m1,mediafile,first.jpg,a1",
        'm2,mediafile,"second, with comma.jpg",a1',
      ].join("\n"),
    );
  });
});
