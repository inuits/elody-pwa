import { ref } from 'vue';
import { LinkMediafileToEntityDocument, LinkMediafileToEntityMutation, MediaFile } from '@/queries';
import { useMutation } from '@vue/apollo-composable';
import { useRoute } from 'vue-router';

const linkList = ref<Array<MediaFile>>([]);

const useMediaAssetLinkHelper = () => {

  const { mutate } = useMutation<LinkMediafileToEntityMutation>(LinkMediafileToEntityDocument);
  const route = useRoute();

  const clearMediaFilesToLinkToEntity = () => {
    linkList.value = [];
  };

  const addMediaFileToLinkList = (mediaFile: MediaFile) => {
    linkList.value.push(mediaFile);
  };

  const linkMediaFilesToEntity = () => {
    console.log('mediafiles to link towards entity: ', linkList.value);
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

  return {
    clearMediaFilesToLinkToEntity,
    linkMediaFilesToEntity,
    addMediaFileToLinkList,
    linkList
  };
};

export default useMediaAssetLinkHelper;
