<template>
  <div class="w-6 h-6 cursor-pointer">
    <BaseIcon :name="Unicons.PlusCircle.name" />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { Unicons } from "@/types";
import BaseIcon from "@/components/base/BaseIcon.vue";

export default defineComponent({
  name: "PlusCircleIcon",
  components: {
    BaseIcon,
  },
  setup() {
    return { Unicons };
  },
});
</script>
