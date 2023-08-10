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
      @click="(event) => event.stopPropagation()"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option"
        class="text-text-body"
      >
        {{ t(option.label).toLowerCase() }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownOption } from "@/generated-types/queries";
import { onUpdated, ref, watch } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption;
    options: DropdownOption[];
    checkOption: boolean;
    label: string;
  }>(),
  {
    label: "",
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: DropdownOption): void;
  (event: "checkOption"): void;
}>();

const { t } = useI18n();
const selectedOption = ref(props.modelValue);

onUpdated(() => (selectedOption.value = props.modelValue));
watch(selectedOption, (value) => emit("update:modelValue", value));
</script>
