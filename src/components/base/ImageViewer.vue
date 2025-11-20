<template>
  <div ref="containerRef" :class="[heightClass, widthClass]">
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
      loading="lazy"
    />
  </div>
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
const containerRef = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);
const abortController = ref<AbortController | null>(null);

const getImage = async () => {
  if (abortController.value) {
    abortController.value.abort();
  }

  abortController.value = new AbortController();

  if (props.mediaIsLink) {
    imageUrl.value = props.url;
    isLoading.value = false;
    return;
  }

  try {
    const response = await getMediafile(
      props.url,
      abortController.value.signal,
    );
    const blob = await response.blob();

    if (blobUrl.value) {
      URL.revokeObjectURL(blobUrl.value);
    }

    blobUrl.value = URL.createObjectURL(blob);
    imageUrl.value = blobUrl.value;
    isLoading.value = false;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
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

onMounted(() => {
  const options = {
    root: null,
    threshold: 0.1,
  };

  observer.value = new IntersectionObserver(([entry]) => {
    if (entry && entry.isIntersecting) {
      if (!blobUrl.value) getImage();

      if (containerRef.value) {
        observer.value?.unobserve(containerRef.value);
      }
    }
  }, options);

  if (containerRef.value) {
    observer.value.observe(containerRef.value);
  }
});

onUnmounted(() => {
  if (abortController.value) {
    abortController.value.abort();
  }

  if (observer.value && containerRef.value) {
    observer.value.unobserve(containerRef.value);
  }

  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
  }
});

watch(
  () => props.url,
  (newUrl, oldUrl) => {
    if (newUrl !== oldUrl) {
      if (abortController.value) {
        abortController.value.abort();
      }

      if (blobUrl.value) {
        URL.revokeObjectURL(blobUrl.value);
        blobUrl.value = "";
      }

      isLoading.value = true;
      imageUrl.value = "";

      if (observer.value && containerRef.value) {
        observer.value.unobserve(containerRef.value);
        observer.value.observe(containerRef.value);
      } else {
        getImage();
      }
    }
  },
);
</script>
