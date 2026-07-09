<template>
  <div class="w-[100vw] h-[100vh]">
    <i-i-i-f-viewer
      v-if="mediafile"
      :image-filename="mediafile.intialValues.display_filename"
      :logo="logo"
    />
    <div v-if="error" class="flex justify-center items-center text-lg">
      <h1>{{ error.message }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import IIIFViewer from "@/components/IIIFViewer.vue";
import { useQuery } from "@vue/apollo-composable";
import {
  GetPrimaryMediafileFromEntityDocument,
  type GetPrimaryMediafileFromEntityQuery,
} from "@/queryLoader";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { stripEmbeddedViewerSuffix } from "@/helpers";

const route = useRoute();
const { result, error } = useQuery<GetPrimaryMediafileFromEntityQuery>(
  GetPrimaryMediafileFromEntityDocument,
  {
    entityId: route.params.id,
  },
);
const mediafile = computed(() => result.value?.GetPrimaryMediafileFromEntity);

const logo = computed(() => {
  const metaLogo = route.meta?.logo as
    | { src?: string; alt?: string }
    | undefined;
  if (!metaLogo?.src) return undefined;
  return {
    src: metaLogo.src,
    alt: metaLogo.alt ?? "",
    href: stripEmbeddedViewerSuffix(window.location.href),
  };
});
</script>

<style scoped></style>
