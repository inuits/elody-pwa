import type { BaseEntity, Entity } from "../generated-types/queries";

const useListItemHelper = () => {
  const getMediaFilenameFromEntity = (entity: BaseEntity) => {
    let mediafile = undefined;
    if (entity.media?.primary_transcode) {
      mediafile = entity.media.primary_transcode;
    }
    if (entity?.media?.primaryMediafile) {
      mediafile = entity.media.primaryMediafile;
    }
    if (entity?.media?.mediafiles && entity?.media?.mediafiles[0]) {
      if (entity?.media?.mediafiles[0]?.transcode_filename) {
        mediafile = entity?.media?.mediafiles[0]?.transcode_filename;
      }
      if (entity.media?.mediafiles[0]?.thumbnail_file_location) {
        mediafile = entity.media?.mediafiles[0]?.thumbnail_file_location;
      }
    }
    return mediafile;
  };

  return { getMediaFilenameFromEntity };
};

export default useListItemHelper;
