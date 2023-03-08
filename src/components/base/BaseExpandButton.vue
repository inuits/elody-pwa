<template>
  <div :class="['flex', 'items-end', { invisible: isHidden }]">
    <div
      :class="
        'flex justify-center items-center w-8 h-8 bg-tag-neutral cursor-pointer ' +
        rounding
      "
      @click="toggleExpandedMediaList"
    >
      <unicon :name="currentArrow" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { ref, type PropType } from "vue";

const props = withDefaults(
  defineProps<{
    isHidden?: boolean;
    orientation?: "Left" | "Right";
  }>(),
  {
    isHidden: false,
    orientation: "Right",
  }
);
const emit = defineEmits(["expandMediaList"]);
const rounding = props.orientation == "Right" ? "rounded-r-md" : "rounded-l-md";
const arrows = [Unicons.AngleRight.name, Unicons.AngleLeft.name];
let currentArrow = ref<string>(
  props.orientation == "Right" ? arrows[0] : arrows[1]
);

const toggleExpandedMediaList = () => {
  currentArrow.value = currentArrow.value == arrows[0] ? arrows[1] : arrows[0];
  emit("expandMediaList");
};
</script>
