import { ref } from 'vue';
import { LinkMediafileToEntityDocument, LinkMediafileToEntityMutation, MediaFile } from '@/queries';
import { useMutation } from '@vue/apollo-composable';
import { useRoute } from 'vue-router';

const linkList = ref<Array<MediaFile>>([]);

const useMediaAssetLinkHelper = () => {

  const { mutate } = useMutation<LinkMediafileToEntityMutation>(LinkMediafileToEntityDocument);
  const route = useRoute();

  const removeMediaFileFromLinkList = (id: string) => {
    linkList.value = linkList.value.filter((link: MediaFile) => link._id !== id);
  };

  const clearMediaFilesToLinkToEntity = () => {
    linkList.value = [];
  };

  const addMediaFileToLinkList = (mediaFile: MediaFile) => {
    linkList.value.push(mediaFile);
  };

  const linkMediaFilesToEntity = () => {
    linkList.value.forEach((mediaFile: MediaFile) => {

      mediaFile.metadata?.forEach((meta: any) => {
        delete meta['__typename'];
      });

      delete mediaFile['__typename'];

      mutate({
        entityId: route.params['id'],
        mediaFileInput: mediaFile
      });
    });
    clearMediaFilesToLinkToEntity();
  };

  const isMediaFileInLinkList = (id: string) => {
    return linkList.value.some((link: MediaFile) => {
      if (link._id === id) {
        return true;
      } else {
        return false;
      }
    });
  };

  return {
    removeMediaFileFromLinkList,
    clearMediaFilesToLinkToEntity,
    linkMediaFilesToEntity,
    addMediaFileToLinkList,
    isMediaFileInLinkList,
    linkList
  };
};

export default useMediaAssetLinkHelper;
