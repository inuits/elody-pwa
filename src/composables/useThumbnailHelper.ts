import { Unicons } from "@/types";
import type { relationValues } from "@/composables/useFormHelpers";


const useThumbnailHelper = (): {
  getThumbnail: (metadata: Me) => string;
} => {
  const getThumbnail = (data: any) => {
    if (
      data?.label === "audio" ||
      (data?.media?.mediafiles?.length > 0 &&
        data?.media?.mediafiles[0]?.mimetype === "audio/mpeg")
    ) {
      // @ts-ignore
      return Unicons.Music.name;
    }

    if (
      data?.label === "subtitle" ||
      (data?.media?.mediafiles?.length > 0 &&
        data?.media?.mediafiles[0]?.mimetype === "text/plain")
    ) {
      // @ts-ignore
      return Unicons.Text.name;
    }

    // @ts-ignore
    return Unicons.NoImage.name;
  };
  return {
    getThumbnail,
  };
};

export default useThumbnailHelper;
