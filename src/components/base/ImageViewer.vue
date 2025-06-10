<template>
  <div
    v-if="isLoading"
    :class="[
      'relative bg-neutral-100 opacity-40 animate-pulse z-0',
      heightClass,
      widthClass,
    ]"
  />
  <img v-else :class="[heightClass, widthClass]" :src="imageUrl" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useGetMediafile } from "@/composables/useGetMediafile";
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";

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

const getImage = async () => {
  if (props.mediaIsLink) {
    imageUrl.value = props.url;
    isLoading.value = false;
    return;
  }

  try {
    const response = await getMediafile(props.url);
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
