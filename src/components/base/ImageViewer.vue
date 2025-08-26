<template>
  <div
    v-if="isLoading"
    :class="[
      'relative bg-neutral-100 opacity-40 animate-pulse z-0',
      heightClass,
      widthClass,
    ]"
  />
  <img
    v-else
    :class="[heightClass, widthClass]"
    :src="imageUrl"
    @error="handleImageError"
  />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

const props = withDefaults(
  defineProps<{
    url?: any;
    mediaIsLink: boolean;
    heightClass: string;
    widthClass: string;
  }>(),
  {
    heightClass: "h-10",
    widthClass: "w-10",
  },
);

const emit = defineEmits<{
  (event: "error"): void;
}>();

const { getMediafile } = useGetMediafile();
const imageUrl = ref("");
const isLoading = ref(true);
const blobUrl = ref("");

const getImage = async () => {
  if (props.mediaIsLink) {
    imageUrl.value = props.url;
    isLoading.value = false;
    return;
  }

  try {
    const response = await getMediafile(props.url);
    const blob = await response.blob();

    // Revoke previous URL if exists
    if (blobUrl.value) {
      URL.revokeObjectURL(blobUrl.value);
    }

    // Create and store new URL
    blobUrl.value = URL.createObjectURL(blob);
    imageUrl.value = blobUrl.value;
    isLoading.value = false;
  } catch {
    isLoading.value = false;
    emitError();
  }
};

const emitError = () => {
  emit("error");
};

const handleImageError = () => {
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
    blobUrl.value = "";
  }
  emitError();
};

onUnmounted(() => {
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
  }
});

watch(
  () => props.url,
  (newUrl, oldUrl) => {
    if (newUrl !== oldUrl) {
      if (blobUrl.value) {
        URL.revokeObjectURL(blobUrl.value);
        blobUrl.value = "";
      }
      getImage();
    }
  },
);

onMounted(() => {
  getImage();
});
</script>
