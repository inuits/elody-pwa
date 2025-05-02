import type { BaseEntity } from "@/generated-types/queries";
import { ref } from "vue";

const hoveredListItem = ref<string | undefined>(undefined);

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
          if (metadata[key].filename) return metadata[key].filename;
          if (metadata[key].key)
            return getValueFromIntialValue(metadata[key].key, entity);
          thumbnailKey = key;
        }
      }

      if (!thumbnailKey) return mediafile;
      mediafile = getValueFromIntialValue(thumbnailKey, entity);
    } catch (e) {
      console.log(e);
    }
    return mediafile;
  };

  const getValueFromIntialValue = (key: string, entity: BaseEntity) => {
    const intialValues: { [key: string]: any } = entity.intialValues;
    return intialValues[key];
  };

  const setHoveredListItem = (id: string | undefined) => {
    hoveredListItem.value = id;
  }

  return {
    getMediaFilenameFromEntity,
    setHoveredListItem
  };
};

export {
  useListItemHelper,
  hoveredListItem
};
