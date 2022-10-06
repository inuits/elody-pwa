<template>
  <div class="w-6 h-6 cursor-pointer">
    <Icon :name="Unicons.PlusCircle.name" />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { Unicons } from "@/types";
import Icon from "@/components/base/Icon.vue";

export default defineComponent({
  name: "PlusCircleIcon",
  components: {
    Icon,
  },
  setup() {
    return { Unicons };
  },
});
</script>
