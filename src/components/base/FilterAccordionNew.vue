<template>
  <div class="bg-neutral-10">
    <button
      class="flex items-center space-x-3 border-solid border-b-2 border-neutral-50 border-r-0 w-full justify-between px-3 py-5"
      :class="props.active == true ? 'bg-blue-50' : ''"
      @click="toggleAccordion()"
    >
      <BaseLabel
        :name="props.label"
        :color="props.active == true ? 'blue-50' : 'bg-neutral-10'"
        class="text-neutral-900"
      />
      <p>
        <span v-show="isOpen"
          ><unicon
            :name="Unicons.Minus.name"
            height="20"
            fill="var(--neutral-900)"
        /></span>
        <span v-show="!isOpen"
          ><unicon
            :name="Unicons.Plus.name"
            height="20"
            fill="var(--neutral-900)"
        /></span>
      </p>
    </button>
    <div
      v-show="isOpen"
      class="border-solid border-b-2 border-neutral-50 px-3 py-5"
    >
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { Unicons } from "../../types";
import BaseLabel from "./BaseLabel.vue";

const props = defineProps<{
  active: Boolean;
  label?: String;
}>();
const isOpen = ref(false);

const emit = defineEmits<{
  (event: "toggled"): boolean;
}>();

const toggleAccordion = () => {
  if (!isOpen.value) {
    emit("toggled");
  }
  isOpen.value = !isOpen.value;
};
</script>
