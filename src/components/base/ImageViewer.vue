<template>
  <div
    v-if="isLoading"
    class="bg-neutral-100 h-100 w-100 opacity-40 animate-pulse"
  />
  <img v-else :src="imageUrl" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

const props = defineProps<{
  src?: any;
}>();

const emit = defineEmits<{
  (event: "error"): void;
}>();

const { getMediafile } = useGetMediafile();
const imageUrl = ref("");
const isLoading = ref(true);

const getImage = async () => {
  try {
    const response = await getMediafile(props.src);
    const videoBlob = await response.blob();
    imageUrl.value = URL.createObjectURL(videoBlob);
    isLoading.value = false;
  } catch (_error: any) {
    isLoading.value = false;
    emitError();
  }
};

const emitError = () => {
  emit("error");
};

onMounted(() => {
  getImage();
});
</script>
