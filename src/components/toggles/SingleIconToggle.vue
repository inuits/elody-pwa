<template>
  <div
    @click="toggleCheck"
    class="rounded h-full w-9 bg-neutral-0 cursor-pointer flex items-center justify-center"
  >
    <unicon v-if="checked" :name="iconOn" />
    <unicon v-else :name="iconOff" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
defineProps({
  label: { type: String, required: false },
  iconOn: { type: String, required: true },
  iconOff: { type: String, required: true },
});
const emit = defineEmits(["update:checked"]);

const checked = ref<boolean>(false);

const toggleCheck = () => {
  checked.value = !checked.value;
  emit("update:checked", checked.value);
};
</script>
