import { describe, it, expect } from "vitest";
import { usableFilters } from "@/composables/filters/useFilterState";

const filter = (key: string) => ({ key, label: key }) as any;

describe("usableFilters", () => {
  it("drops the __typename string", () => {
    const filters = usableFilters({
      __typename: "AdvancedFilters",
      email: filter("email"),
    } as any);

    expect(filters.map((f) => f.key)).toEqual(["email"]);
  });

  it("drops a filter the caller may not use, which comes back null", () => {
    const filters = usableFilters({
      __typename: "AdvancedFilters",
      email: filter("email"),
      roles: null,
      organization: filter("organization"),
    } as any);

    expect(filters.map((f) => f.key)).toEqual(["email", "organization"]);
  });

  it("survives an absent filter map", () => {
    expect(usableFilters(undefined as any)).toEqual([]);
  });
});
