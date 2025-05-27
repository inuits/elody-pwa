import {
  KeyValueSource,
  type MediaFileEntity,
} from "@/generated-types/queries";
import { reactive, ref } from "vue";

type MediaFileRootKeys = "id" | "uuid";

type MediaFileMetadataKeys =
  | "id"
  | "filename"
  | "original_filename"
  | "original_file_location"
  | "transcode_filename"
  | "thumbnail_file_location"
  | "mimetype"
  | "is_primary"
  | "is_primary_thumbnail";

type MediafileSelectionState = {
  mediafiles: MediaFileEntity[];
  selectedMediafile: MediaFileEntity | undefined;
};

const mediafileSelectionState = ref<{
  [key: string]: reactive<MediafileSelectionState>;
}>({});

export const useEntityMediafileSelector = () => {
  const addMediafileSelectionStateContext = (context: string): void => {
    mediafileSelectionState.value[context] = reactive<MediafileSelectionState>({
      mediafiles: [],
      selectedMediafile: undefined,
    });
  };

  const getValueOfMediafile = (
    context: string,
    key: MediaFileRootKeys | MediaFileMetadataKeys,
    mediafile: MediaFileEntity | undefined = mediafileSelectionState.value[
      context
    ].selectedMediafile,
    source: KeyValueSource = KeyValueSource.Metadata
  ) => {
    if (source === KeyValueSource.Metadata)
      return (mediafile?.intialValues as any)?.[key as MediaFileMetadataKeys];
    if (source === KeyValueSource.Root)
      return mediafile?.[key as MediaFileRootKeys];
    else return undefined;
  };

  const setEntityMediafiles = (
    context: string,
    mediafiles: MediaFileEntity[]
  ) => {
    if (!context) return;
    mediafileSelectionState.value[context].mediafiles = mediafiles;
    updateSelectedEntityMediafile(context, mediafiles[0])
  };

  const updateSelectedEntityMediafile = (
    context: string,
    mediafile: MediaFileEntity | undefined
  ) => {
    if (!context) return;
    mediafileSelectionState.value[context].selectedMediafile = mediafile;
  };

  const selectPreviousMediafile = (context: string): string | undefined => {
    const currentIndex = getCurrentlySelectedMediafileIndex(context);
    if (currentIndex === undefined) return undefined;

    let previousIndex = 0;
    if (currentIndex > 0) previousIndex = currentIndex - 1;
    else
      previousIndex =
        mediafileSelectionState.value[context].mediafiles.length - 1;
    if (currentIndex === previousIndex) return undefined;

    return setSelectedMediafileByIndex(context, previousIndex);
  };

  const selectNextMediafile = (context: string): string | undefined => {
    const currentIndex = getCurrentlySelectedMediafileIndex(context);
    if (currentIndex === undefined) return undefined;

    let nextIndex = 0;
    if (
      currentIndex <
      mediafileSelectionState.value[context].mediafiles.length - 1
    )
      nextIndex = currentIndex + 1;
    else nextIndex = 0;
    if (currentIndex === nextIndex) return undefined;

    return setSelectedMediafileByIndex(context, nextIndex);
  };

  const getCurrentlySelectedMediafileIndex = (
    context: string
  ): number | undefined => {
    if (
      mediafileSelectionState.value[context].mediafiles.length === 0 ||
      !mediafileSelectionState.value[context].selectedMediafile
    )
      return undefined;

    const index = mediafileSelectionState.value[context].mediafiles.indexOf(
      mediafileSelectionState.value[context].selectedMediafile
    );
    return index;
  };

  const setSelectedMediafileByIndex = (context: string, index: number): string | undefined => {
    if (
      index >= mediafileSelectionState.value[context].mediafiles.length ||
      index < 0
    )
      return undefined;
    mediafileSelectionState.value[context].selectedMediafile =
      mediafileSelectionState.value[context].mediafiles[index];

    return (mediafileSelectionState.value[context].mediafiles[index] as any)?.["id" as MediaFileMetadataKeys];
  };

  return {
    mediafileSelectionState,
    addMediafileSelectionStateContext,
    getValueOfMediafile,
    setEntityMediafiles,
    updateSelectedEntityMediafile,
    selectPreviousMediafile,
    selectNextMediafile,
  };
};
