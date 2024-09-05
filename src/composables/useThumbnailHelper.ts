import { Unicons } from "@/types";

const useThumbnailHelper = (): {
  getThumbnail: (entity: any) => string;
} => {
  const getThumbnail = (data: any) => {
    try {
      if (data.intialValues.mimetype.includes("audio")) {
        return Unicons.Music.name;
      }

      if (data.intialValues.mimetype.includes("zip")) {
        return Unicons.Folder.name;
      }

      if (data.intialValues.mimetype.includes("text")) {
        return Unicons.Text.name;
      }

      if (data.intialValues.mimetype.includes("video")) {
        return Unicons.VideoSlash.name;
      }

      return Unicons.NoImage.name;
    } catch (e) {
      return Unicons.NoImage.name;
    }
  };
  return {
    getThumbnail,
  };
};

export default useThumbnailHelper;
