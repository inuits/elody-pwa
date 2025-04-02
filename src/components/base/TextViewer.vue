<template>
  <div class="flex w-full h-full relative">
    <div class="w-full h-full p-4 bg-neutral-20 overflow-y-scroll">
      <p v-html="fileContent"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

interface Source {
  intialValues: {
    original_file_location: string;
  };
}

const props = defineProps<{ source: Source }>();

const fileContent = ref<string>("");
const { getMediafile, getMediafilePath } = useGetMediafile();

const getText = async () => {
  const response = await getMediafile(
    `/api/mediafile/${getMediafilePath(props.source.intialValues.original_file_location)}`,
  );
  const text = await response.text();
  fileContent.value = text.split(/\r\n|\n/).join("<br/>");
};

watch(() => props.source, getText, { deep: true });

onMounted(getText);
</script>
