import { describe, it, expect, vi } from "vitest";
import { useFilterOptions } from "../useFilterOptions";

vi.mock("@/helpers", () => ({
  getEntityTitle: vi.fn().mockImplementation((entity) => entity?.title || ""),
}));

describe("useFilterOptions - data mapping", () => {
  it("should directly return dropdownOptions when available", () => {
    const { options, dropdownOptions } = useFilterOptions();

    const mockOptions = [
      { label: "Option 1", value: "1", icon: expect.anything() },
      { label: "Option 2", value: "2", icon: expect.anything() },
    ];

    dropdownOptions.value = mockOptions;

    expect(options.value).toEqual(mockOptions);
  });

  it("should map entities using provided label/value paths", async () => {
    const { options, entities, init } = useFilterOptions();

    const mockEntities = [
      { id: "1", customName: "Entity 1", code: "E1" },
      { id: "2", customName: "Entity 2", code: "E2" },
    ];

    entities.value = mockEntities;

    await init("TEST_ENTITY", {
      label: "customName",
      value: "code",
    });

    expect(options.value).toEqual([
      { icon: expect.anything(), label: "Entity 1", value: "E1" },
      { icon: expect.anything(), label: "Entity 2", value: "E2" },
    ]);
  });

  it("should map entities using provided label/value paths from an array", async () => {
    const { options, entities, init } = useFilterOptions();

    const mockEntities = [
      { id: "1", code: ["E1", "E4"] },
      { id: "2", code: "E2" },
    ];

    entities.value = mockEntities;

    await init("TEST_ENTITY", {
      label: "code",
      value: "code",
    });

    expect(options.value).toEqual([
      { icon: expect.anything(), label: "E1", value: "E1" },
      { icon: expect.anything(), label: "E4", value: "E4" },
      { icon: expect.anything(), label: "E2", value: "E2" },
    ]);
  });

  it("should fall back to default id and title when no mapping provided", () => {
    const { options, entities, init } = useFilterOptions();

    const mockEntities = [
      { id: "1", title: "Entity 1" },
      { id: "2", title: "Entity 2" },
    ];

    entities.value = mockEntities;
    init("TEST_ENTITY");

    expect(options.value).toEqual([
      { icon: expect.anything(), label: "Entity 1", value: "1" },
      { icon: expect.anything(), label: "Entity 2", value: "2" },
    ]);
  });

  it("should use getEntityTitle when no label path is provided", async () => {
    const { options, entities } = useFilterOptions();

    const mockEntities = [
      { id: "1", name: "Entity 1", title: "Fallback Title 1" },
      { id: "2", name: "Entity 2", title: "Fallback Title 2" },
    ];

    entities.value = mockEntities;

    await useFilterOptions().init("TEST_ENTITY", { value: "id" });

    expect(options.value).toEqual([
      { icon: expect.anything(), label: "Fallback Title 1", value: "1" },
      { icon: expect.anything(), label: "Fallback Title 2", value: "2" },
    ]);
  });
});
