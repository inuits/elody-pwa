import { describe, expect, it } from "vitest";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { sortFilters } from "./test-utils";

describe("useFiltersBaseNew - Filter Normalization", () => {
  it("normalizes text filter to make an api call", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          label: "metadata.labels.title",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          value: "title",
          match_exact: false,
        },
      },
    ];

    expect(activeFilterCount.value).toEqual(1);

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "text",
        key: ["elody:1|metadata.title.value"],
        value: "title",
        match_exact: false,
      },
    ]);
  });

  it("normalizes type filter to make an api call", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isActive: true,
        isDisplayed: false,
        advancedFilter: {
          type: "type",
          defaultValue: "assetPart",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          type: "type",
          key: undefined,
          value: "assetPart",
          parent_key: undefined,
          match_exact: true,
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "type",
        value: "assetPart",
        match_exact: true,
      },
    ]);
  });

  it("normalizes selection filter to make an api call", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|relations.hasCreator.key"],
          label: "metadata.labels.creator",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "selection",
          parent_key: undefined,
          key: ["elody:1|relations.hasCreator.key"],
          value: ["5fc21f1a-a94d-4908-b1a4-6312f1d1b874"],
          match_exact: true,
          aggregation: undefined,
        },
      },
    ];

    expect(activeFilterCount.value).toEqual(1);

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "selection",
        key: ["elody:1|relations.hasCreator.key"],
        value: ["5fc21f1a-a94d-4908-b1a4-6312f1d1b874"],
        match_exact: true,
      },
    ]);
  });

  it("normalizes date filter to make an api call", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "date",
          key: ["elody:1|date_created"],
          label: "metadata.labels.date-created",
          isDisplayedByDefault: true,
          showTimeForDateFilter: false,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "date",
          parent_key: undefined,
          key: ["elody:1|date_created"],
          value: {
            min: "2025-04-01T00:00:00+02:00",
            max: "2025-04-04T00:00:00+02:00",
            included: true,
          },
          aggregation: undefined,
        },
      },
    ];

    expect(activeFilterCount.value).toEqual(1);

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "date",
        key: ["elody:1|date_created"],
        value: {
          min: "2025-04-01T00:00:00+02:00",
          max: "2025-04-04T00:00:00+02:00",
          included: true,
        },
      },
    ]);

    filters.value = [
      {
        ...filters.value[0],
        inputFromState: {
          type: "date",
          parent_key: undefined,
          key: ["elody:1|date_created"],
          value: {
            min: "2025-03-12T00:00:00+02:00",
            max: undefined,
            included: true,
          },
          aggregation: undefined,
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "date",
        key: ["elody:1|date_created"],
        value: {
          min: "2025-03-12T00:00:00+02:00",
          max: undefined,
          included: true,
        },
      },
    ]);

    filters.value = [
      {
        ...filters.value[0],
        inputFromState: {
          type: "date",
          parent_key: undefined,
          key: ["elody:1|date_created"],
          value: {
            min: undefined,
            max: "2025-03-12T00:00:00+02:00",
            included: true,
          },
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "date",
        key: ["elody:1|date_created"],
        value: {
          min: undefined,
          max: "2025-03-12T00:00:00+02:00",
          included: true,
        },
      },
    ]);

    filters.value = [
      {
        ...filters.value[0],
        inputFromState: {
          type: "date",
          parent_key: undefined,
          key: ["elody:1|date_created"],
          value: "2025-04-04",
          match_exact: true,
          aggregation: undefined,
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "date",
        key: ["elody:1|date_created"],
        value: "2025-04-04",
        match_exact: true,
      },
    ]);
  });

  it("normalizes number filter to make an api call", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "number",
          key: "lookup.virtual_relations.hasMediafile",
          aggregation: "size",
          label: "metadata.labels.number-of-mediafiles",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "number",
          parent_key: undefined,
          key: "lookup.virtual_relations.hasMediafile",
          value: 3,
          match_exact: true,
          aggregation: "size",
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "number",
        key: "lookup.virtual_relations.hasMediafile",
        value: 3,
        match_exact: true,
        aggregation: "size",
      },
    ]);

    filters.value = [
      {
        ...filters.value[0],
        inputFromState: {
          type: "number",
          parent_key: undefined,
          key: "lookup.virtual_relations.hasMediafile",
          value: { min: 1, max: undefined, included: true },
          aggregation: "size",
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "number",
        key: "lookup.virtual_relations.hasMediafile",
        value: {
          min: 1,
          included: true,
        },
        aggregation: "size",
      },
    ]);

    filters.value = [
      {
        ...filters.value[0],
        inputFromState: {
          type: "number",
          parent_key: undefined,
          key: "lookup.virtual_relations.hasMediafile",
          value: { min: undefined, max: 3, included: true },
          aggregation: "size",
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "number",
        key: "lookup.virtual_relations.hasMediafile",
        value: {
          max: 3,
          included: true,
        },
        aggregation: "size",
      },
    ]);

    filters.value = [
      {
        ...filters.value[0],
        inputFromState: {
          type: "number",
          parent_key: undefined,
          key: "lookup.virtual_relations.hasMediafile",
          value: { min: 1, max: 5, included: true },
          aggregation: "size",
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "number",
        key: "lookup.virtual_relations.hasMediafile",
        value: {
          min: 1,
          max: 5,
          included: true,
        },
        aggregation: "size",
      },
    ]);
  });

  it("normalizes boolean filter to make an api call", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "boolean",
          key: ["elody:1|metadata.external.value"],
          label: "metadata.labels.external",
          isDisplayedByDefault: true,
        },
        isActive: true,
        inputFromState: {
          type: "boolean",
          parent_key: undefined,
          key: ["elody:1|metadata.external.value"],
          value: true,
          match_exact: true,
          aggregation: undefined,
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "boolean",
        key: ["elody:1|metadata.external.value"],
        value: true,
        match_exact: true,
      },
    ]);

    filters.value = [
      {
        ...filters.value[0],
        inputFromState: {
          type: "boolean",
          parent_key: undefined,
          key: ["elody:1|metadata.external.value"],
          value: false,
          match_exact: true,
          aggregation: undefined,
        },
      },
    ];

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "boolean",
        key: ["elody:1|metadata.external.value"],
        value: false,
        match_exact: true,
      },
    ]);
  });

  it("normalizes combination of filters to make an api call", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isActive: true,
        isDisplayed: false,
        advancedFilter: {
          type: "type",
          defaultValue: "asset",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          type: "type",
          value: "asset",
          match_exact: true,
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|relations.hasArchesLink.key"],
          label: "metadata.labels.arches-link",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|relations.hasAdlibLink.key"],
          label: "metadata.labels.adlib-link",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|relations.hasBrocadeLink.key"],
          label: "metadata.labels.brocade-link",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|relations.hasEdepotLink.key"],
          label: "metadata.labels.edpot-link",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|created_by"],
          label: "metadata.labels.created-by",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|created_by"],
              value: "*",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isActive: true,
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          label: "metadata.labels.title",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          value: "shylock",
          match_exact: false,
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.description.value"],
          label: "metadata.labels.description",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|relations.hasInstitution.key"],
          label: "metadata.labels.administrator",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|relations.hasInstitution.key"],
              value: "*",
              metadata_key_as_label: "metadata.name.value",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|metadata.format.value"],
          label: "metadata.labels.format",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|metadata.format.value"],
              value: "*",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "selection",
          key: ["elody:1|metadata.format.value"],
          value: ["350 x 215", "405 x 330"],
          match_exact: true,
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.source.value"],
          label: "metadata.labels.source",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|metadata.language.value"],
          label: "metadata.labels.language",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|metadata.language.value"],
              value: "*",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|metadata.type.value"],
          label: "metadata.labels.type",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|metadata.type.value"],
              value: "*",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|metadata.collection_form.value"],
          label: "metadata.labels.collection-form",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|metadata.collection_form.value"],
              value: "*",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|relations.hasTag.value"],
          label: "metadata.labels.tag",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|relations.hasTag.value"],
              value: "*",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isActive: false,
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|relations.hasCreator.key"],
          label: "metadata.labels.creator",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              key: ["elody:1|relations.hasCreator.key"],
              value: "*",
              metadata_key_as_label: "metadata.name.value",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "selection",
          key: ["elody:1|metadata.copyright_color.value"],
          label: "metadata.labels.copyright-color",
          isDisplayedByDefault: true,
          advancedFilterInputForRetrievingOptions: [
            {
              type: "text",
              parent_key: null,
              key: ["elody:1|metadata.copyright_color.value"],
              value: "*",
              item_types: ["asset"],
              __typename: "AdvancedFilterInputType",
            },
          ],
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isActive: true,
        isDisplayed: true,
        advancedFilter: {
          type: "date",
          key: ["elody:1|date_created"],
          label: "metadata.labels.date-created",
          isDisplayedByDefault: true,
          showTimeForDateFilter: false,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          type: "date",
          key: ["elody:1|date_created"],
          value: {
            min: "2025-02-03T00:00:00+02:00",
            included: true,
          },
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "date",
          key: ["elody:1|date_updated"],
          label: "metadata.labels.date-updated",
          isDisplayedByDefault: true,
          showTimeForDateFilter: false,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          lookup: {
            from: "mediafiles",
            local_field: "relations.hasMediafile.key",
            foreign_field: "_id",
            as: "lookup.virtual_relations.hasMediafile",
            __typename: "LookupInputType",
          },
          type: "text",
          key: "lookup.virtual_relations.hasMediafile.original_filename",
          label: "metadata.labels.original-filename",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          lookup: {
            from: "mediafiles",
            local_field: "relations.hasMediafile.key",
            foreign_field: "_id",
            as: "lookup.virtual_relations.hasMediafile",
            __typename: "LookupInputType",
          },
          type: "text",
          key: "lookup.virtual_relations.hasMediafile.metadata.text_from_ocr.value",
          label: "metadata.labels.ocr-text",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isActive: true,
        isDisplayed: true,
        advancedFilter: {
          lookup: {
            from: "mediafiles",
            local_field: "relations.hasMediafile.key",
            foreign_field: "_id",
            as: "lookup.virtual_relations.hasMediafile",
            __typename: "LookupInputType",
          },
          type: "number",
          key: "lookup.virtual_relations.hasMediafile",
          aggregation: "size",
          label: "metadata.labels.number-of-mediafiles",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          type: "number",
          key: "lookup.virtual_relations.hasMediafile",
          value: {
            min: 1,
            max: 5,
            included: true,
          },
          aggregation: "size",
          lookup: {
            from: "mediafiles",
            local_field: "relations.hasMediafile.key",
            foreign_field: "_id",
            as: "lookup.virtual_relations.hasMediafile",
          },
        },
      },
    ];

    expect(sortFilters(getNormalizedFiltersForApi())).toEqual(
      sortFilters([
        {
          type: "type",
          value: "asset",
          match_exact: true,
        },
        {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          value: "shylock",
          match_exact: false,
        },
        {
          type: "date",
          key: ["elody:1|date_created"],
          value: {
            min: "2025-02-03T00:00:00+02:00",
            included: true,
          },
        },
        {
          type: "number",
          key: "lookup.virtual_relations.hasMediafile",
          value: {
            min: 1,
            max: 5,
            included: true,
          },
          aggregation: "size",
          lookup: {
            from: "mediafiles",
            local_field: "relations.hasMediafile.key",
            foreign_field: "_id",
            as: "lookup.virtual_relations.hasMediafile",
          },
        },
        {
          type: "selection",
          key: ["elody:1|metadata.format.value"],
          value: ["350 x 215", "405 x 330"],
          match_exact: true,
        },
      ]),
    );
  });

  it("normalizes combination of filters to make an api call - v2", () => {
    const { filters, activeFilterCount, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.id.value"],
          label: "metadata.labels.id",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
        isActive: false,
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.key.value"],
          label: "metadata.labels.key",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.key.value"],
          value: "ke3",
          match_exact: true,
        },
        selectedMatcher: {
          icon: "NoIcon",
          label: "is exactly",
          value: "ExactMatcher",
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.name.value"],
          label: "metadata.labels.name",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.name.value"],
          value: "name",
          match_exact: false,
        },
        selectedMatcher: {
          icon: "NoIcon",
          label: "contains",
          value: "ContainsMatcher",
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.description.value"],
          label: "metadata.labels.description",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.description.value"],
          value: "",
        },
        selectedMatcher: {
          icon: "NoIcon",
          label: "has no value",
          value: "NoneMatcher",
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.url.value"],
          label: "metadata.labels.url",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.url.value"],
          value: "*",
        },
        selectedMatcher: {
          icon: "NoIcon",
          label: "has a value",
          value: "AnyMatcher",
        },
      },
      {
        isActive: true,
        isDisplayed: false,
        advancedFilter: {
          type: "type",
          defaultValue: "license",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          type: "type",
          value: "license",
          match_exact: true,
        },
      },
    ];

    expect(sortFilters(getNormalizedFiltersForApi())).toEqual(
      sortFilters([
        {
          type: "type",
          value: "license",
          match_exact: true,
        },
        {
          type: "text",
          key: ["elody:1|metadata.name.value"],
          value: "name",
          match_exact: false,
        },
        {
          type: "text",
          key: ["elody:1|metadata.description.value"],
          value: "",
        },
        {
          type: "text",
          key: ["elody:1|metadata.url.value"],
          value: "*",
        },
        {
          type: "text",
          key: ["elody:1|metadata.key.value"],
          value: "ke3",
          match_exact: true,
        },
      ]),
    );
  });
});
