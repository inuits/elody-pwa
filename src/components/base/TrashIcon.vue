<template>
  <div
    class="w-6 h-6 rounded cursor-pointer top-0 right-0 absolute m-1 bg-neutral-30 hover:bg-red-default border-2 border-neutral-900"
  >
    <BaseIcon :name="Unicons.Trash.name" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Unicons } from "../../types";
import BaseIcon from "./BaseIcon.vue";

export default defineComponent({
  name: "TrashIcon",
  components: {
    BaseIcon,
  },
  setup() {
    return { Unicons };
  },
});
</script>
