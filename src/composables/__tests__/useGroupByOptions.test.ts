import { describe, it, expect, vi } from "vitest";
import { DamsIcons, type GroupByConfig } from "@/generated-types/queries";
import { useGroupByOptions } from "../useGroupByOptions";

const option = (key: string, label: string, primary = false): GroupByConfig => ({
  key,
  label,
  primary,
  filterKey: [`vlacc:1|properties.${key}.value`],
  distinctBy: `properties.${key}.value`,
  groupOrderBy: "properties.last_activity_at.value",
});

const category = option("intialValues.category", "Categorie", true);
const author = option("intialValues.author_name", "Maker");

const setup = (options: GroupByConfig[] = [category, author]) => {
  const onChange = vi.fn();
  const groupBy = useGroupByOptions({ onChange });
  groupBy.setOptions(options);
  return { groupBy, onChange };
};

describe("useGroupByOptions", () => {
  it("offers no grouping first, followed by the configured options", () => {
    const { groupBy } = setup();

    expect(groupBy.dropdownOptions.value).toEqual([
      { icon: DamsIcons.NoIcon, label: "library.no-group-by", value: "" },
      { icon: DamsIcons.NoIcon, label: "Categorie", value: category.key },
      { icon: DamsIcons.NoIcon, label: "Maker", value: author.key },
    ]);
  });

  it("selects and reports the primary option as default", () => {
    const { groupBy, onChange } = setup();

    expect(groupBy.selectedKey.value).toBe(category.key);
    expect(onChange).toHaveBeenCalledWith(category);
  });

  it("selects no grouping when no option is primary", () => {
    const { groupBy, onChange } = setup([
      { ...category, primary: false },
      author,
    ]);

    expect(groupBy.selectedKey.value).toBe("");
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("reports the chosen option", () => {
    const { groupBy, onChange } = setup();

    groupBy.select(author.key);

    expect(onChange).toHaveBeenLastCalledWith(author);
    expect(groupBy.selectedKey.value).toBe(author.key);
  });

  it("reports no grouping as null", () => {
    const { groupBy, onChange } = setup();

    groupBy.select("");

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(groupBy.selectedKey.value).toBe("");
  });

  it("ignores selecting the option that is already selected", () => {
    const { groupBy, onChange } = setup();

    groupBy.select(category.key);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps the user's choice when the options are reloaded", () => {
    const { groupBy, onChange } = setup();
    groupBy.select(author.key);

    groupBy.setOptions([category, author]);

    expect(groupBy.selectedKey.value).toBe(author.key);
    expect(onChange).toHaveBeenLastCalledWith(author);
  });

  it("forgets the options and the user's choice when cleared", () => {
    const { groupBy, onChange } = setup();
    groupBy.select(author.key);

    groupBy.clear();

    expect(groupBy.hasOptions.value).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(null);
    groupBy.setOptions([category, author]);
    expect(groupBy.selectedKey.value).toBe(category.key);
  });

  it("has no options when none are configured", () => {
    const groupBy = useGroupByOptions({ onChange: vi.fn() });

    expect(groupBy.hasOptions.value).toBe(false);
  });
});
