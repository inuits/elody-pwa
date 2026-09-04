import { Unicons } from "@/types";
import { splitMimetype } from "@/utils/mimetype";

const useThumbnailHelper = (): {
  getThumbnail: (entity: any) => string;
} => {
  const getThumbnail = (data: any) => {
    const { type, subtype } = splitMimetype(data?.intialValues?.mimetype);

    if (type === "audio") return Unicons.Music.name;
    if (type === "video") return Unicons.VideoSlash.name;
    if (type === "text") return Unicons.Text.name;
    if (subtype.includes("zip")) return Unicons.Folder.name;
    if (subtype === "pdf") return Unicons.FileAlt.name;

    return Unicons.NoImage.name;
  };

  return {
    getThumbnail,
  };
};

export default useThumbnailHelper;
