<template>
  <BaseInputTextNumberDatetime
    disabled
    input-style="default"
    type="text"
    :model-value="''"
  />
</template>

<script lang="ts" setup>
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { defineEmits, onMounted } from "vue";

const emit = defineEmits<{
  (event: "updateValue", arg: string): void;
}>();

onMounted(() => {
  emit("updateValue", "*");
});

const reset = () => {};

defineExpose({
  reset,
});
</script>

<style></style>
