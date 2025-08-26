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
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    isHidden?: boolean;
    orientation?: "left" | "right";
  }>(),
  {
    isHidden: false,
    orientation: "right",
  },
);
const emit = defineEmits(["expandMediaList"]);
const rounding = props.orientation == "right" ? "rounded-r-md" : "rounded-l-md";
const arrows = [Unicons.AngleRight.name, Unicons.AngleLeft.name];
const currentArrow = ref<string>(
  props.orientation == "right" ? arrows[0] : arrows[1],
);
const toggled = ref<boolean>(false);

const toggleExpandedMediaList = () => {
  toggled.value = !toggled.value;
  currentArrow.value = currentArrow.value == arrows[0] ? arrows[1] : arrows[0];
  emit("expandMediaList", toggled.value);
};
</script>
