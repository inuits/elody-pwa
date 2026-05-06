import { ref } from "vue";

export const useMediafileDownload = () => {
  const downloadLoading = ref(false);

  const downloadMediafile = (mediafileId: string, originalFilename?: string): void => {
    downloadLoading.value = true;
    const filename = originalFilename?.replace(/\.[^/.]*$/, "") || "";
    const a = document.createElement("a");
    a.href = `/api/mediafile/${mediafileId}?original=true&originalFilename=${filename}`;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    downloadLoading.value = false;
  };

  return { downloadMediafile, downloadLoading };
};
