import type { BaseEntity, Entity } from "../generated-types/queries";

const useListItemHelper = () => {
  const getMediaFilenameFromEntity = (entity: BaseEntity) => {
    return (
      entity?.media?.primary_transcode ||
      entity?.media?.primaryMediafile ||
      entity.media?.mediafiles[0]?.transcode_filename ||
      null
    );
  };

  return { getMediaFilenameFromEntity };
};

export default useListItemHelper;
