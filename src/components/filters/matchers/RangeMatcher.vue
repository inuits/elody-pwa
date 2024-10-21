<template>
  <div id="app">
    <div class="slider-container">
      <!-- Dual Range Slider -->
      <div class="range-slider">
        <input
          type="range"
          :value="fromValue"
          :min="min"
          :max="max"
          step="1"
          @input="handleFromChange"
          class="thumb thumb--left"
        />
        <input
          type="range"
          :value="tillValue"
          :min="min"
          :max="max"
          step="1"
          @input="handleTillChange"
          class="thumb thumb--right"
        />

        <!-- Track bar -->
        <div class="slider-track"></div>
        <div class="highlight-track" :style="highlightStyle"></div>
      </div>

      <!-- Dynamic labels and ticks underneath the slider -->
      <div class="range-labels">
        <span v-for="n in rangeLabels" :key="n" class="range-label">
          {{ n }}
          <div class="tick"></div>
        </span>
      </div>

      <!-- Display current range values -->
      <div class="value-display">
        <label
          >From: <span>{{ from }}</span></label
        >
        <label
          >Till: <span>{{ to }}</span></label
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";

// Props to pass dynamic range values and labels
const props = defineProps<{
  initialFrom: number;
  initialTill: number;
  min: number;
  max: number;
}>();

// Reactive values for internal state
const fromValue = ref<number>(props.initialFrom);
const tillValue = ref<number>(props.initialTill);

const from = ref<number>(props.initialFrom);
const to = ref<number>(props.initialTill);

// Generate range labels only for even numbers
const rangeLabels = computed(() => {
  const labels: number[] = [];
  for (let i = Math.max(props.min, 0); i <= props.max; i += 2) {
    labels.push(i);
  }
  return labels;
});

watch(
  () => [props.initialFrom, props.initialTill],
  ([newFrom, newTill]) => {
    fromValue.value = newFrom;
    tillValue.value = newTill;
  }
);

// Handlers for input changes
const handleFrom = (event: Event) => {
  const newValue = parseInt((event.target as HTMLInputElement).value);
  console.log("from(reactive): ", newValue);

  from.value = newValue;
};

const handleTill = (event: Event) => {
  const newValue = parseInt((event.target as HTMLInputElement).value);
  console.log("to(reactive): ", newValue);
  to.value = newValue;
};

const handleFromChange = (event: Event) => {
  const newValue = parseInt((event.target as HTMLInputElement).value);
  console.log("from: ", newValue);
  if (newValue > tillValue.value) {
    fromValue.value = tillValue.value;
    tillValue.value = newValue;
    return;
  }

  fromValue.value = newValue;
  // fromValue.value = Math.min(newValue, tillValue.value - 1);
};

const handleTillChange = (event: Event) => {
  const newValue = parseInt((event.target as HTMLInputElement).value);
  console.log("till: ", newValue);
  if (newValue < fromValue.value) {
    tillValue.value = fromValue.value;
    from.value = newValue;
    return;
  }

  tillValue.value = newValue;
  // tillValue.value = Math.max(newValue, fromValue.value + 1);
};

// Highlight track style based on selected range

const highlightStyle = computed(() => ({
  left: `${((fromValue.value - props.min) / (props.max - props.min)) * 100}%`,
  right: `${
    (1 - (tillValue.value - props.min) / (props.max - props.min)) * 100
  }%`,
}));

// const highlightStyle = computed(() => {
//   const left = `${((from.value - props.min) / (props.max - props.min)) * 100}%`;
//   const right = `${
//     (1 - (to.value - props.min) / (props.max - props.min)) * 100
//   }%`;

//   const isFromBigger = from.value > to.value;

//   return {
//     left: isFromBigger ? right : left,
//     right: isFromBigger ? left : right,
//   };
// });
</script>

<style scoped>
/* Container to hold the slider and labels */
.slider-container {
  position: relative;
  width: 100%;
  margin: 0 auto;
  padding: 10px;
}

/* Range slider container */
.range-slider {
  position: relative;
  width: 100%;
  height: 5px;
  background: #e0e0e0;
  margin-bottom: 20px; /* Add space for ticks */
}

/* Track and thumb customization */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 5px;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: all;
  width: 12px;
  height: 12px;
  background: #009688;
  border-radius: 50%;
  cursor: pointer;
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: #ddd;
}

/* Highlighted range track between the two sliders */
.highlight-track {
  position: absolute;
  top: 0;
  height: 5px;
  background-color: #00bcd4;
}

/* Thumbs styling for left and right */
.thumb--left {
  z-index: 3;
}

.thumb--right {
  z-index: 4;
}

/* Range labels and ticks container */
.range-labels {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding-bottom: 10px;
}

.range-label {
  position: relative;
  text-align: center;
  font-size: 12px;
  color: #999;
  width: 7%; /* Adjust width for proper spacing */
}

/* Small ticks below the numbers */
.tick {
  width: 1px;
  height: 10px;
  background-color: #999;
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
}

/* Display the selected range values */
.value-display {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
}

.value-display label {
  font-size: 14px;
  color: #333;
}
</style>
