<template>
  <div :class="['flex', 'items-end', { invisible: isHidden }]">
    <button
      type="button"
      :aria-expanded="toggled"
      :aria-label="label"
      :class="
        'flex justify-center items-center w-8 h-8 bg-tag-neutral cursor-pointer ' +
        rounding
      "
      @click="toggleExpandedMediaList"
    >
      <unicon :name="currentArrow" aria-hidden="true" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

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
const { t, te } = useI18n();
const label = computed(() => {
  const key = toggled.value ? "expand-button.collapse" : "expand-button.expand";
  if (te(key)) return t(key);
  return toggled.value ? "Collapse" : "Expand";
});
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
