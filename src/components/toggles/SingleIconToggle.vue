<template>
  <div
    @click="toggleCheck"
    class="rounded h-9 w-9 bg-neutral-0 cursor-pointer flex items-center justify-center mt-8"
  >
    <div class="p-2" v-if="checked"><unicon :name="iconOn" /></div>
    <div class="p-2" v-else><unicon :name="iconOff" /></div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const props = defineProps({
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
