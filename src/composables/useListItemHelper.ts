import type { BaseEntity } from "@/generated-types/queries";

const useListItemHelper = () => {
  const getMediaFilenameFromEntity = (entity: BaseEntity) => {
    let mediafile: string | undefined = undefined;
    try {
      if (!entity.teaserMetadata) return mediafile;

      let thumbnailKey = undefined;

      const metadata: { [key: string]: any } = entity.teaserMetadata;
      for (const key in metadata) {
        if (metadata[key]?.__typename === "PanelThumbnail") {
          const customUrl: string = metadata[key].customUrl;
          if (customUrl) return customUrl;
          thumbnailKey = key;
        }
      }

      if (!thumbnailKey) return mediafile;
      const intialValues: { [key: string]: any } = entity.intialValues;
      mediafile = intialValues[thumbnailKey];
    } catch (e) {
      console.log(e);
    }
    return mediafile;
  };

  return { getMediaFilenameFromEntity };
};

export default useListItemHelper;
