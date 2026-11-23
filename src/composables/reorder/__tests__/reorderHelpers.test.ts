import { describe, expect, it } from "vitest";
import {
  dropLineClass,
  isValidPosition,
  moveItem,
  pageOfIndex,
  parseOrderCsv,
  serializeOrderCsv,
} from "@/composables/reorder/reorderHelpers";

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

describe("isValidPosition", () => {
  it("accepts whole positions from 1 to the total", () => {
    expect(isValidPosition(1, 7)).toBe(true);
    expect(isValidPosition(7, 7)).toBe(true);
    expect(isValidPosition(0, 7)).toBe(false);
    expect(isValidPosition(8, 7)).toBe(false);
    expect(isValidPosition(2.5, 7)).toBe(false);
    expect(isValidPosition(NaN, 7)).toBe(false);
  });
});

describe("dropLineClass", () => {
  it("draws the line on the side the dragged row comes from", () => {
    expect(dropLineClass(2, 5, 2)).toBe("shadow-reorder-drop-before");
    expect(dropLineClass(5, 2, 5)).toBe("shadow-reorder-drop-after");
  });

  it("draws nothing on rows that are not the drop target", () => {
    expect(dropLineClass(3, undefined, 3)).toBe("");
    expect(dropLineClass(3, 1, 4)).toBe("");
    expect(dropLineClass(3, 3, 3)).toBe("");
  });
});
