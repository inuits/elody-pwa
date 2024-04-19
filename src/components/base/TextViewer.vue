<template>
  <div class="flex w-full h-full relative">
    <div class="w-full h-full p-4 bg-neutral-20 overflow-y-scroll">
      <p v-html="fileContent"></p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

export default defineComponent({
  name: "TextViewer",
  components: {},
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const fileContent = ref<string>();
    const { getMediafile } = useGetMediafile();

    const getText = async () => {
      const response = await getMediafile(
        "/api/mediafile/" + props.source.intialValues.filename
      );
      const text = await response.text();
      fileContent.value = text.split(/\r\n|\n/).join("<br/>");
    };

    onMounted(() => {
      getText();
    });

    return { fileContent };
  },
});
</script>
