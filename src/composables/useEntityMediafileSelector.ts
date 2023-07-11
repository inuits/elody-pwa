import type { MediaFileEntity } from "@/generated-types/queries";
import { reactive } from "vue";

type MediaFileKeys =
  | "filename"
  | "original_file_location"
  | "transcode_filename"
  | "thumbnail_file_location"
  | "mimetype"
  | "is_primary"
  | "is_primary_thumbnail";

type MediafileSelectionState = {
  mediafiles: MediaFileEntity[];
  selectedMediafile: MediaFileEntity | undefined;
  toBeDeleted: string[];
};

const mediafileSelectionState = reactive<MediafileSelectionState>({
  mediafiles: [],
  selectedMediafile: undefined,
  toBeDeleted: [],
});

export const useEntityMediafileSelector = () => {
  const getValueOfMediafile = (
    key: MediaFileKeys,
    mediafile:
      | MediaFileEntity
      | undefined = mediafileSelectionState.selectedMediafile
  ) => (mediafile?.intialValues as any)?.[key];

  const setEntityMediafiles = (mediafiles: [MediaFileEntity]) => {
    mediafileSelectionState.mediafiles = mediafiles;
  };

  const updateSelectedEntityMediafile = (
    mediafile: MediaFileEntity | undefined
  ) => {
    mediafileSelectionState.selectedMediafile = mediafile;
  };

  const selectPreviousMediafile = () => {
    const currentIndex = getCurrentlySelectedMediafileIndex();
    if (currentIndex === undefined) return;

    let previousIndex = 0;
    if (currentIndex > 0) previousIndex = currentIndex - 1;
    else previousIndex = mediafileSelectionState.mediafiles.length - 1;

    setSelectedMediafileByIndex(previousIndex);
  };

  const selectNextMediafile = () => {
    const currentIndex = getCurrentlySelectedMediafileIndex();
    if (currentIndex === undefined) return;

    let nextIndex = 0;
    if (currentIndex < mediafileSelectionState.mediafiles.length - 1)
      nextIndex = currentIndex + 1;
    else nextIndex = 0;

    setSelectedMediafileByIndex(nextIndex);
  };

  const getCurrentlySelectedMediafileIndex = (): number | undefined => {
    if (
      mediafileSelectionState.mediafiles.length === 0 ||
      !mediafileSelectionState.selectedMediafile
    )
      return undefined;

    const index = mediafileSelectionState.mediafiles.indexOf(
      mediafileSelectionState.selectedMediafile
    );
    return index;
  };

  const setSelectedMediafileByIndex = (index: number) => {
    if (index >= mediafileSelectionState.mediafiles.length || index < 0) return;
    mediafileSelectionState.selectedMediafile =
      mediafileSelectionState.mediafiles[index];
  };

  return {
    mediafileSelectionState,
    getValueOfMediafile,
    setEntityMediafiles,
    updateSelectedEntityMediafile,
    selectPreviousMediafile,
    selectNextMediafile,
  };
};
