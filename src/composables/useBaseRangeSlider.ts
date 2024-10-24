import { ref, computed } from "vue";

export const useBaseRangeSlider = ({
  initialFrom,
  initialTo,
  minValue,
  maxValue,
}: {
  initialFrom: number;
  initialTo: number;
  minValue: number;
  maxValue: number;
}) => {
  const min = ref<number>(minValue);
  const max = ref<number>(maxValue);
  const from = ref<number>(initialFrom);
  const to = ref<number>(initialTo);
  const unit = ref<string | undefined>();

  const extractValueFromInputEvent = (event: Event) => {
    let value = (event.target as HTMLInputElement).value;
    value = value === "" ? "0" : value;
    return parseInt(value);
  };

  const handleFromChange = (event: Event) => {
    const newFrom = extractValueFromInputEvent(event);
    hasFromInputError.value = newFrom > to.value;
    from.value = newFrom;

    if (hasFromInputError.value) return;
    updateSliderValue([newFrom, to.value]);
  };

  const handleToChange = (event: Event) => {
    const newTo = extractValueFromInputEvent(event);
    hasToInputError.value = newTo < from.value;
    to.value = newTo;

    if (hasToInputError.value) return;
    updateSliderValue([from.value, newTo]);
  };

  const sliderValue = ref<number[]>([from.value, to.value]);

  const updateValuesFromSlider = (values: number | number[]) => {
    if (!Array.isArray(values)) return;
    from.value = values[0];
    to.value = values[1];

    resetErrors();
  };

  const updateSliderValue = (newSliderValue: number[]) => {
    sliderValue.value = newSliderValue;
  };

  const getLeftPosition = (position: number) => {
    const diff = max.value - min.value;
    const minimum = 0;
    const maximum = diff;
    return ((position - minimum) / (maximum - minimum)) * 100;
  };

  const ticks = computed(() => {
    const ticks = [];

    for (let i = min.value; i <= max.value; i++) {
      ticks.push(i);
    }

    return ticks;
  });

  const hasFromInputError = ref<boolean>(false);
  const hasToInputError = ref<boolean>(false);

  const resetErrors = () => {
    hasToInputError.value = false;
    hasFromInputError.value = false;
  };

  return {
    from,
    to,
    min,
    max,
    unit,
    sliderValue,
    ticks,
    hasFromInputError,
    hasToInputError,
    handleFromChange,
    handleToChange,
    updateValuesFromSlider,
    getLeftPosition,
    resetErrors,
  };
};
