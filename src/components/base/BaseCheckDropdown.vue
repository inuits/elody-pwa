<template>
  <div
    @click="() => emit('checkOption')"
    class="w-1/3 mr-2 flex rounded cursor-pointer select-none"
    :class="[
      checkOption
        ? `bg-accent-light text-accent-normal`
        : `bg-neutral-lightest text-text-light`,
    ]"
  >
    <unicon
      :name="checkOption ? Unicons.CheckSquare.name : Unicons.SquareFull.name"
      :class="checkOption ? `fill-accent-normal` : `fill-text-light`"
      class="inline"
      height="16"
    />
    <span class="m-0 ml-1 py-0.5 px-0">{{ label }}</span>
    <select
      v-model="selectedOption"
      class="block h-7 m-0 p-0 pl-1 w-full cursor-pointer bg-transparent border-none outline-none rounded"
    >
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { onUpdated, ref, watch } from "vue";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    checkOption: boolean;
    label: string;
    options: string[] | number[];
  }>(),
  {
    label: "",
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: string | number): void;
  (event: "checkOption"): void;
}>();

const selectedOption = ref(props.modelValue);

onUpdated(() => (selectedOption.value = props.modelValue));
watch(selectedOption, (value) => emit("update:modelValue", value));
</script>
