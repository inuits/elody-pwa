<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    class="w-full h-full focus:ring-0 border rounded-lg overflow-hidden resize-none"
    rows="3"
    @input="handleInput"
  ></textarea>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

const textareaRef = ref(null);

const updateHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto";
    textareaRef.value.style.height = textareaRef.value.scrollHeight + "px";
  }
};

watch(() => props.modelValue, updateHeight, { immediate: true });

const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
  updateHeight();
};

onMounted(updateHeight);
</script>
