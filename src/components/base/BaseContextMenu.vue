<template>
  <BaseButton
    bg-color="blue-50"
    bg-hover-color="blue-75"
    :icon="icon"
    txt-color="blue-300"
    class="disabled:cursor-not-allowed disabled:opacity-50 w-10"
    @click="toggleContextMenu"
    :id="id"
  />
  <div
    v-show="isDisplayingContextMenu"
    class="mt-2 w-56 origin-top-right bg-neutral-0 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    :class="extraClass"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="menu-button"
    tabindex="-1"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import BaseButton from "./BaseButton.vue";
import { Unicons } from "@/types";

const isDisplayingContextMenu = ref<Boolean>(false);

const props = withDefaults(
  defineProps<{
    icon?: string;
    extraClass: string;
    id: string;
  }>(),
  {
    extraClass: () => {
      return "";
    },
    id: () => {
      return "no-id-set";
    },
    icon: () => {
      return Unicons.EllipsisV.name;
    },
  }
);

const toggleContextMenu = () => {
  isDisplayingContextMenu.value = !isDisplayingContextMenu.value;
};

window.addEventListener("click", function (e: Event) {
  if (
    e &&
    !(
      document.getElementById(props.id) &&
      document.getElementById(props.id)?.contains(e.target as HTMLInputElement)
    )
  ) {
    isDisplayingContextMenu.value = false;
  }
});
</script>
