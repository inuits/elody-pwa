import { useMinMaxAdvancedFilter } from "@/composables/useMinMaxAdvancedFilter";
import { AdvancedFilterTypes } from "@/generated-types/queries";
import { extractDate, extractTime } from "@/helpers";
import type { FilterListItem } from "@/composables/useStateManagement";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/helpers", () => ({
  addCurrentTimeZoneToDateTimeString: vi.fn((date) => `${date}+00:00`),
  isDateTime: vi.fn(
    (value) => typeof value === "string" && value.includes("T"),
  ),
  extractDate: vi.fn((value) => (value ? value.split("T")[0] : undefined)),
  extractTime: vi.fn((value) => (value ? value.split("T")[1] : undefined)),
}));

describe("useMinMaxAdvancedFilter", () => {
  const mockFilter: FilterListItem = {
    advancedFilter: {
      type: AdvancedFilterTypes.Date,
      parentKey: "parentKey",
      key: "key",
      aggregation: "sum",
      showTimeForDateFilter: true,
    },
    inputFromState: {
      value: {
        min: "2023-10-01T12:00:00",
        max: "2023-10-02T14:00:00",
      },
    },
  };

  const emitEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes input values correctly", async () => {
    const TestComponent = {
      template: "<div></div>",
      setup() {
        return useMinMaxAdvancedFilter(mockFilter, emitEvent);
      },
    };

    const wrapper = mount(TestComponent);

    await wrapper.vm.$nextTick();

    const { inputMin, inputMax, inputTimeMin, inputTimeMax } = wrapper.vm;

    expect(extractDate).toHaveBeenCalledWith("2023-10-01T12:00:00");
    expect(extractTime).toHaveBeenCalledWith("2023-10-01T12:00:00");
    expect(extractDate).toHaveBeenCalledWith("2023-10-02T14:00:00");
    expect(extractTime).toHaveBeenCalledWith("2023-10-02T14:00:00");

    expect(inputMin).toBe("2023-10-01");
    expect(inputTimeMin).toBe("12:00:00");
    expect(inputMax).toBe("2023-10-02");
    expect(inputTimeMax).toBe("14:00:00");
  });

  it("computes determineInputType correctly", () => {
    const { determineInputType } = useMinMaxAdvancedFilter(
      mockFilter,
      emitEvent,
    );

    expect(determineInputType.value).toEqual(["date", "time"]);

    const numberFilter = {
      ...mockFilter,
      advancedFilter: {
        ...mockFilter.advancedFilter,
        type: AdvancedFilterTypes.Number,
      },
    };
    const { determineInputType: numberInputType } = useMinMaxAdvancedFilter(
      numberFilter,
      emitEvent,
    );
    expect(numberInputType.value).toBe("number");
  });

  it("computes determinePlaceholder correctly", () => {
    const { determinePlaceholder } = useMinMaxAdvancedFilter(
      mockFilter,
      emitEvent,
    );

    expect(determinePlaceholder.value).toBe(
      "filters.matcher-placeholders.date",
    );

    const numberFilter = {
      ...mockFilter,
      advancedFilter: {
        ...mockFilter.advancedFilter,
        type: AdvancedFilterTypes.Number,
      },
    };
    const { determinePlaceholder: numberPlaceholder } = useMinMaxAdvancedFilter(
      numberFilter,
      emitEvent,
    );
    expect(numberPlaceholder.value).toBe("filters.matcher-placeholders.number");
  });

  it("emits correct payload for min and max values", async () => {
    const { inputMin, inputMax, inputTimeMin, inputTimeMax } =
      useMinMaxAdvancedFilter(mockFilter, emitEvent);

    inputMin.value = "2023-10-03";
    inputTimeMin.value = "15:00:00";
    inputMax.value = "2023-10-04";
    inputTimeMax.value = "16:00:00";

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emitEvent).toHaveBeenCalledWith(
      "newAdvancedFilterInput",
      {
        type: AdvancedFilterTypes.Date,
        parent_key: "parentKey",
        key: "key",
        value: {
          min: "2023-10-03T15:00:00+00:00",
          max: "2023-10-04T16:00:00+00:00",
          included: true,
        },
        aggregation: "sum",
      },
      false,
    );
  });

  it("emits correct payload for only min value", async () => {
    const { inputMin, inputTimeMin } = useMinMaxAdvancedFilter(
      mockFilter,
      emitEvent,
    );

    inputMin.value = "2023-10-03";
    inputTimeMin.value = "15:00:00";

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emitEvent).toHaveBeenCalledWith(
      "newAdvancedFilterInput",
      {
        type: AdvancedFilterTypes.Date,
        parent_key: "parentKey",
        key: "key",
        value: {
          min: "2023-10-03T15:00:00+00:00",
          included: true,
        },
        aggregation: "sum",
      },
      false,
    );
  });

  it("emits correct payload for only max value", async () => {
    const { inputMax, inputTimeMax } = useMinMaxAdvancedFilter(
      mockFilter,
      emitEvent,
    );

    inputMax.value = "2023-10-04";
    inputTimeMax.value = "16:00:00";

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emitEvent).toHaveBeenCalledWith(
      "newAdvancedFilterInput",
      {
        type: AdvancedFilterTypes.Date,
        parent_key: "parentKey",
        key: "key",
        value: {
          max: "2023-10-04T16:00:00+00:00",
          included: true,
        },
        aggregation: "sum",
      },
      false,
    );
  });

  it("handles number type correctly", async () => {
    const numberFilter = {
      ...mockFilter,
      advancedFilter: {
        ...mockFilter.advancedFilter,
        type: AdvancedFilterTypes.Number,
      },
    };
    const { inputMin, inputMax } = useMinMaxAdvancedFilter(
      numberFilter,
      emitEvent,
    );

    inputMin.value = 100;
    inputMax.value = 200;

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emitEvent).toHaveBeenCalledWith(
      "newAdvancedFilterInput",
      {
        type: AdvancedFilterTypes.Number,
        parent_key: "parentKey",
        key: "key",
        value: {
          min: 100,
          max: 200,
          included: true,
        },
        aggregation: "sum",
      },
      false,
    );
  });
});
