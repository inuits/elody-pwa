import { describe, it, expect, beforeEach } from "vitest";
import { useBaseRangeSlider } from "../useBaseRangeSlider";

describe("useBaseRangeSlider", () => {
  let composable: ReturnType<typeof useBaseRangeSlider>;

  beforeEach(() => {
    composable = useBaseRangeSlider({
      initialFrom: 10,
      initialTo: 50,
      minValue: 0,
      maxValue: 100,
    });
  });

  it("initializes correctly", () => {
    expect(composable.from.value).toBe(10);
    expect(composable.to.value).toBe(50);
    expect(composable.min.value).toBe(0);
    expect(composable.max.value).toBe(100);
    expect(composable.hasFromInputError.value).toBe(false);
    expect(composable.hasToInputError.value).toBe(false);
    expect(composable.sliderValue.value).toEqual([10, 50]);
  });

  it("updates from value and checks for errors", () => {
    const event = { target: { value: "20" } } as unknown;
    composable.handleFromChange(event as Event);
    expect(composable.from.value).toBe(20);
    expect(composable.hasFromInputError.value).toBe(false);
    expect(composable.sliderValue.value).toEqual([20, 50]);

    const errorEvent = { target: { value: "60" } } as unknown;
    composable.handleFromChange(errorEvent as Event);
    expect(composable.from.value).toBe(60);
    expect(composable.hasFromInputError.value).toBe(true);
    expect(composable.sliderValue.value).toEqual([20, 50]);
  });

  it("does not update slider value when from is greater than to", () => {
    const errorEvent = { target: { value: "55" } } as unknown;
    composable.handleFromChange(errorEvent as Event);

    expect(composable.hasFromInputError.value).toBe(true);
    expect(composable.from.value).toBe(55);
    expect(composable.sliderValue.value).toEqual([10, 50]);
  });

  it("updates to value and checks for errors", () => {
    const event = { target: { value: "40" } } as unknown;
    composable.handleToChange(event as Event);
    expect(composable.to.value).toBe(40);
    expect(composable.hasToInputError.value).toBe(false);
    expect(composable.sliderValue.value).toEqual([10, 40]);

    const errorEvent = { target: { value: "5" } } as unknown;
    composable.handleToChange(errorEvent as Event);
    expect(composable.to.value).toBe(5);
    expect(composable.hasToInputError.value).toBe(true);
    expect(composable.sliderValue.value).toEqual([10, 40]);
  });

  it("does not update slider value when to is less than from", () => {
    const errorEvent = { target: { value: "5" } } as unknown;
    composable.handleToChange(errorEvent as Event);

    expect(composable.hasToInputError.value).toBe(true);
    expect(composable.to.value).toBe(5);
    expect(composable.sliderValue.value).toEqual([10, 50]);
  });

  it("updates slider values from external input", () => {
    composable.updateValuesFromSlider([30, 60]);
    expect(composable.from.value).toBe(30);
    expect(composable.to.value).toBe(60);
    expect(composable.sliderValue.value).toEqual([30, 60]);
  });

  it("computes ticks based on min and max values", () => {
    expect(composable.ticks.value.length).toBe(101);
    expect(composable.ticks.value[0]).toBe(0);
    expect(composable.ticks.value[100]).toBe(100);

    const newComposable = useBaseRangeSlider({
      initialFrom: 20,
      initialTo: 80,
      minValue: 10,
      maxValue: 100,
    });

    const ticks = newComposable.ticks.value;

    expect(ticks.length).toBe(91);
    expect(ticks[0]).toBe(10);
    expect(ticks[ticks.length - 1]).toBe(100);
  });

  it("calculates left position correctly", () => {
    const position = composable.getLeftPosition(50);
    expect(position).toBeCloseTo(50);
  });

  it("calculates correct left position with various values", () => {
    const composable = useBaseRangeSlider({
      initialFrom: 10,
      initialTo: 50,
      minValue: 0,
      maxValue: 100,
    });

    expect(composable.getLeftPosition(0)).toBeCloseTo(0);
    expect(composable.getLeftPosition(24)).toBeCloseTo(24);
    expect(composable.getLeftPosition(44)).toBeCloseTo(44);
    expect(composable.getLeftPosition(50)).toBeCloseTo(50);
    expect(composable.getLeftPosition(68)).toBeCloseTo(68);
    expect(composable.getLeftPosition(94)).toBeCloseTo(94);
    expect(composable.getLeftPosition(100)).toBeCloseTo(100);
  });

  it("calculates correct left position with minValue = 24 and maxValue = 45", () => {
    const composable = useBaseRangeSlider({
      initialFrom: 30,
      initialTo: 40,
      minValue: 24,
      maxValue: 45,
    });

    const range = composable.max.value - composable.min.value;

    const getIndexFromValue = (value: number) => {
      return composable.ticks.value.findIndex((item: number) => item === value);
    };

    expect(composable.getLeftPosition(getIndexFromValue(24))).toBeCloseTo(0); // 0%
    expect(composable.getLeftPosition(getIndexFromValue(45))).toBeCloseTo(100); // 100%
    expect(composable.getLeftPosition(getIndexFromValue(34))).toBeCloseTo(
      ((34 - 24) / range) * 100
    ); // 50%
    expect(composable.getLeftPosition(getIndexFromValue(25))).toBeCloseTo(
      ((25 - 24) / range) * 100
    ); // ~4.76%
    expect(composable.getLeftPosition(getIndexFromValue(44))).toBeCloseTo(
      ((44 - 24) / range) * 100
    ); // ~95.24%
  });

  it("resets errors", () => {
    composable.hasFromInputError.value = true;
    composable.hasToInputError.value = true;
    composable.resetErrors();
    expect(composable.hasFromInputError.value).toBe(false);
    expect(composable.hasToInputError.value).toBe(false);
  });
});
