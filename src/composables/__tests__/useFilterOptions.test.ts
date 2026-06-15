import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFilterOptions } from "../useFilterOptions";

const i18nMocks = vi.hoisted(() => ({ locale: "en" }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => `t:${key}`,
    locale: {
      get value() {
        return i18nMocks.locale;
      },
    },
  }),
}));

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
    watchQuery: vi.fn(),
  },
}));

vi.mock(import("@/helpers"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getEntityTitle: vi.fn().mockImplementation((entity) => entity?.title || ""),
  };
});

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

  it("extracts dropdown options labels and values from formatter value correctly", async () => {
    const { options, entities, init } = useFilterOptions();

    const mockEntities = [
      {
        id: "1",
        name: "Entity 1",
        title: { label: "title1", formatter: "pill" },
      },
      {
        id: "2",
        name: "Entity 2",
        title: { label: "title2", formatter: "pill" },
      },
    ];

    await init("TEST_ENTITY", { value: "title", label: "title" });

    entities.value = mockEntities;

    expect(options.value).toEqual([
      { icon: expect.anything(), label: "title1", value: "title1" },
      { icon: expect.anything(), label: "title2", value: "title2" },
    ]);
  });
});

describe("useFilterOptions - multilingual (translation) values", () => {
  beforeEach(() => {
    i18nMocks.locale = "en";
  });

  const buildEntities = () => [
    {
      id: "SC-M9VG4EYHR",
      intialValues: {
        name: [
          { key: "name", value: "AAAtest123", lang: "en" },
          { key: "name", value: "arabic", lang: "ar" },
        ],
      },
    },
  ];

  it("resolves the current locale value when label/value paths share a translation array", async () => {
    const { options, entities, init } = useFilterOptions();

    await init("TEST_ENTITY", {
      label: "intialValues.name",
      value: "intialValues.name",
    });

    entities.value = buildEntities();

    expect(options.value).toEqual([
      {
        icon: expect.anything(),
        label: "AAAtest123",
        value: "AAAtest123",
      },
    ]);
  });

  it("produces a single option (not one per language) for a translation array", () => {
    const { options, entities, init } = useFilterOptions();

    init("TEST_ENTITY", {
      label: "intialValues.name",
      value: "intialValues.name",
    });

    entities.value = buildEntities();

    expect(options.value).toHaveLength(1);
  });

  it("falls back to the first translation entry when the locale has no match", async () => {
    i18nMocks.locale = "fr";
    const { options, entities, init } = useFilterOptions();

    await init("TEST_ENTITY", {
      label: "intialValues.name",
      value: "intialValues.name",
    });

    entities.value = buildEntities();

    expect(options.value).toEqual([
      {
        icon: expect.anything(),
        label: "AAAtest123",
        value: "AAAtest123",
      },
    ]);
  });

  it("resolves the matching locale value for a non-default language", async () => {
    i18nMocks.locale = "ar";
    const { options, entities, init } = useFilterOptions();

    await init("TEST_ENTITY", {
      label: "intialValues.name",
      value: "intialValues.name",
    });

    entities.value = buildEntities();

    expect(options.value).toEqual([
      { icon: expect.anything(), label: "arabic", value: "arabic" },
    ]);
  });

  it("resolves translation arrays when label and value paths differ", async () => {
    const { options, entities, init } = useFilterOptions();

    await init("TEST_ENTITY", {
      label: "intialValues.title",
      value: "intialValues.name",
    });

    entities.value = [
      {
        id: "SC-1",
        intialValues: {
          name: [
            { key: "name", value: "name-en", lang: "en" },
            { key: "name", value: "name-ar", lang: "ar" },
          ],
          title: [
            { key: "name", value: "title-en", lang: "en" },
            { key: "name", value: "title-ar", lang: "ar" },
          ],
        },
      },
    ];

    expect(options.value).toEqual([
      { icon: expect.anything(), label: "title-en", value: "name-en" },
    ]);
  });
});

describe("useFilterOptions.setPredefinedOptions", () => {
  it("translates each option label via t() and exposes them as options", () => {
    const { setPredefinedOptions, options } = useFilterOptions();
    setPredefinedOptions([
      { icon: "NoIcon", label: "metadata.labels.role", value: "admin" } as any,
    ]);
    expect(options.value).toEqual([
      { icon: "NoIcon", label: "t:metadata.labels.role", value: "admin" },
    ]);
  });

  it("does not fetch entities when predefined options are set", () => {
    const { setPredefinedOptions, entities } = useFilterOptions();
    setPredefinedOptions([
      { icon: "NoIcon", label: "metadata.labels.role", value: "admin" } as any,
    ]);
    expect(entities.value).toEqual([]);
  });
});
