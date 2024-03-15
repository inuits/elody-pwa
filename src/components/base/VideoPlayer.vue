<template>
  <div class="w-full relative">
    <video class="w-full h-full" controls>
      <source
        :src="source && fileName ? '/api/mediafile/' + fileName : 'no-src'"
        :type="
          source && getValueOfMediafile('mimetype')
            ? getValueOfMediafile('mimetype')
            : 'no-type'
        "
      />
    </video>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const props = defineProps<{
  source?: any;
}>();

const { getValueOfMediafile } = useEntityMediafileSelector();
const auth = useAuth();
const fileName =
  getValueOfMediafile("filename") || getValueOfMediafile("transcode_filename");

onMounted(() => {
  fetchVideoFile();
});

const fetchVideoFile = async () => {
  if (!auth.isAuthenticated.value) return;

  fetch("/api/mediafile/" + fileName, {
    method: "GET",
    headers: {
      "Content-Type": "video/mp4",
      Authorization: `Bearer token`,
    },
  })
    .then((response) => {
      console.log("response: ", response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((blob) => {
      console.log(blob);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

// fetch("/api/mediafile/" + fileName, {
//   method: "GET",
//   headers: {
//     "Content-Type": "video/mp4",
//     Token: auth.to,
//   },
// })
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     return response.blob();
//   })
//   .then((blob) => {
//     // Handle the blob data here
//   })
//   .catch((error) => {
//     console.error("Error fetching data:", error);
//   });
</script>
