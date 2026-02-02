<template>
  <div class="w-[100vw] h-[100vh]">
    <i-i-i-f-viewer
      v-if="mediafile"
      :image-filename="mediafile.intialValues.display_filename"
    />
    <div v-if="error" class="flex justify-center items-center text-lg">
      <h1>{{ error.message }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import IIIFViewer from "@/components/IIIFViewer.vue";
import { useQuery } from "@vue/apollo-composable";
import { GetPrimaryMediafileFromEntityDocument } from "@/generated-types/queries";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const { result, error } = useQuery(GetPrimaryMediafileFromEntityDocument, {
  entityId: route.params.id,
});
const mediafile = computed(() => result.value?.GetPrimaryMediafileFromEntity);
</script>

<style scoped></style>
