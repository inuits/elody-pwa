import { describe, expect, it } from "vitest";
import { createEntityFromOptionMetadata } from "@/composables/createEntityFromOptionMetadata";

describe("createEntityFromOptionMetadata", () => {
  it("stores the option label under the configured key", () => {
    expect(createEntityFromOptionMetadata("title", "Tango")).toEqual([
      { key: "title", value: "Tango" },
    ]);
  });

  it("returns no metadata without a key and without extra metadata", () => {
    expect(createEntityFromOptionMetadata(undefined, "Tango")).toEqual([]);
    expect(createEntityFromOptionMetadata("", "Tango", null)).toEqual([]);
  });

  it("adds the configured extra metadata after the label", () => {
    expect(
      createEntityFromOptionMetadata("title", "Tango", [
        { key: "title_type", value: "reeks" },
      ]),
    ).toEqual([
      { key: "title", value: "Tango" },
      { key: "title_type", value: "reeks" },
    ]);
  });

  it("never lets extra metadata overwrite the typed label", () => {
    expect(
      createEntityFromOptionMetadata("title", "Tango", [
        { key: "title", value: "Other" },
        { key: "title_type", value: "uniforme titel" },
      ]),
    ).toEqual([
      { key: "title", value: "Tango" },
      { key: "title_type", value: "uniforme titel" },
    ]);
  });

  it("ignores malformed extra metadata", () => {
    expect(
      createEntityFromOptionMetadata("title", "Tango", [
        { value: "reeks" },
        null,
        "x",
      ] as any),
    ).toEqual([{ key: "title", value: "Tango" }]);
  });
});
