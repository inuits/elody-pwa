import { Unicons } from "@/types";

const useThumbnailHelper = (): {
  getThumbnail: (entity: any) => string;
} => {
  const getThumbnail = (data: any) => {
    try {
      if (
        data?.label === "audio" ||
        (data?.media?.mediafiles?.length > 0 &&
          data?.media?.mediafiles[0]?.mimetype.includes("audio"))
      ) {
        // @ts-ignore
        return Unicons.Music.name;
      }

      if (
        data?.label === "subtitle" ||
        (data?.media?.mediafiles?.length > 0 &&
          data?.media?.mediafiles[0]?.mimetype.includes("text"))
      ) {
        // @ts-ignore
        return Unicons.Text.name;
      }

      // @ts-ignore
      return Unicons.NoImage.name;
    } catch (e) {
      console.log("Unable to get thumbnail, fallback to default");
      return Unicons.NoImage.name;
    }
  };
  return {
    getThumbnail,
  };
};

export default useThumbnailHelper;
