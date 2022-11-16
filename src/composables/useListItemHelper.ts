import type { BaseEntity, Entity } from "../queries";

const useListItemHelper = () => {
  const getMediaFilenameFromEntity = (entity: BaseEntity) => {
    return entity?.media?.primary_transcode
      ? entity.media.primary_transcode
      : entity.media?.mediafiles && entity.media.mediafiles[0]
      ? entity.media?.mediafiles[0]?.transcode_filename
      : null;
  };

  return { getMediaFilenameFromEntity };
};

export default useListItemHelper;
