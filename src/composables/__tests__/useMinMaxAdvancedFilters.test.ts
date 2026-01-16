import { useMinMaxAdvancedFilter } from "@/composables/useMinMaxAdvancedFilter";
import { AdvancedFilterTypes } from "@/generated-types/queries";
import type { FilterListItem } from "@/composables/useStateManagement";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

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
}));

describe("useMinMaxAdvancedFilter", () => {
  const getMockFilter = (values: any = {}): FilterListItem => {
    return {
      advancedFilter: {
        type: AdvancedFilterTypes.Date,
        parentKey: "parentKey",
        key: "key",
        aggregation: "sum",
        showTimeForDateFilter: true,
      },
      inputFromState: {
        value: {
          min: "2026-01-15T11:00:00",
          max: "2026-01-16T22:00:00",
          ...values,
        },
      },
    };
  };

  const emitEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = (values: any = {}, filter = getMockFilter(values)) => {
    return mount({
      template: "<div></div>",
      setup() {
        return useMinMaxAdvancedFilter(filter, emitEvent);
      },
    });
  };

  it("initializes input values directly from state (no extraction needed)", async () => {
    const wrapper = createWrapper();
    await nextTick();

    const { inputMin, inputMax } = wrapper.vm;

    expect(inputMin).toBe("2026-01-15T11:00:00");
    expect(inputMax).toBe("2026-01-16T22:00:00");
  });

  it("initializes input values with timezone directly from state (no extraction needed)", async () => {
    const min = "2026-05-20T10:00:00+00:00";
    const max = "2026-05-21T11:00:00+00:00";
    const wrapper = createWrapper({
      min,
      max,
    });
    await nextTick();

    const { inputMin, inputMax } = wrapper.vm;

    console.log(inputMin, inputMax);

    expect(inputMin).toBe(min);
    expect(inputMax).toBe(max);
  });

  it("computes determineInputType correctly for various types", () => {
    const datetimeWrapper = createWrapper();
    expect(datetimeWrapper.vm.determineInputType).toBe("datetime-local");

    const dateOnlyFilter = {
      ...getMockFilter(),
      advancedFilter: {
        ...getMockFilter().advancedFilter,
        showTimeForDateFilter: false,
      },
    };
    const dateOnlyWrapper = createWrapper({}, dateOnlyFilter);
    expect(dateOnlyWrapper.vm.determineInputType).toBe("date");

    const numberFilter = {
      ...getMockFilter(),
      advancedFilter: {
        ...getMockFilter().advancedFilter,
        type: AdvancedFilterTypes.Number,
      },
    };
    const numberWrapper = createWrapper({}, numberFilter);
    expect(numberWrapper.vm.determineInputType).toBe("number");
  });

  it("emits correct payload when inputs change", async () => {
    const wrapper = createWrapper();

    wrapper.vm.inputMin = "2026-05-20T10:00:00";
    wrapper.vm.inputMax = "2026-05-21T11:00:00";

    await nextTick();

    expect(emitEvent).toHaveBeenCalledWith("updateValue", {
      min: "2026-05-20T10:00:00+00:00",
      max: "2026-05-21T11:00:00+00:00",
      included: true,
    });
  });

  it("emits undefined if both inputs are empty", async () => {
    const wrapper = createWrapper();

    wrapper.vm.inputMin = "";
    wrapper.vm.inputMax = "";

    await nextTick();

    expect(emitEvent).toHaveBeenCalledWith("updateValue", undefined);
  });

  it("handles number type correctly without normalization", async () => {
    const numberFilter = {
      ...getMockFilter(),
      advancedFilter: {
        ...getMockFilter().advancedFilter,
        type: AdvancedFilterTypes.Number,
      },
    };
    const wrapper = createWrapper(numberFilter);

    wrapper.vm.inputMin = 100;
    wrapper.vm.inputMax = 200;

    await nextTick();

    expect(emitEvent).toHaveBeenCalledWith("updateValue", {
      min: 100,
      max: 200,
      included: true,
    });
  });

  it("identifies number type correctly", () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.isNumberType).toBe(false);

    const numberFilter = {
      ...getMockFilter(),
      advancedFilter: {
        ...getMockFilter().advancedFilter,
        type: AdvancedFilterTypes.Number,
      },
    };
    const numberWrapper = createWrapper({}, numberFilter);
    expect(numberWrapper.vm.isNumberType).toBe(true);
  });
});
