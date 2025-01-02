<template>
  <div class="flex gap-2">
    <!-- <div v-if="media && !imageSrcError" :class="['flex items-center']">
      <ImageViewer
        v-if="media"
        :class="['object-cover self-center outline-none h-10 w-10']"
        :url="
          mediaIsLink
            ? media
            : `/api/iiif/3/${media}/square/${50},/0/default.jpg`
        "
        @error="setNoImage()"
      />
    </div>
    <div
      v-if="imageSrcError"
      name="image-slash"
      class="'text-neutral-700 rounded-sm outline-none self-center h-10 w-10 flex flex-col justify-center items-center shadow-sm mb-4',"
    >
      <unicon
        name="image-slash"
        class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none self-center"
      />
    </div> -->

    <div v-for="(metadataItem, idx) in normalizedTeaserMetadata" :key="idx">
      <metadata-wrapper
        class=""
        form-id="listview"
        :metadata="metadataItem"
        :is-edit="false"
        :linked-entity-id="entity.id"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import {
  BaseEntity,
  BaseLibraryModes,
  Entitytyping,
  GetEntityByIdQueryVariables,
  GetEntityByIdDocument,
} from "@/generated-types/queries";
import { computed, inject, ref } from "vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import type { ApolloClient } from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { formatTeaserMetadata, stringIsUrl } from "@/helpers";
import useListItemHelper from "@/composables/useListItemHelper";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { apolloClient } from "@/main";

const props = defineProps<{
  entity: BaseEntity;
}>();

const imageSrcError = ref<boolean>(false);
const entitiesLoading = ref<boolean>(true);
const mediaIsLink = computed(() => stringIsUrl(media.value || ""));
const { getMediaFilenameFromEntity } = useListItemHelper();

// const { getEntityById, entities, entitiesLoading } = useBaseLibrary(
//   apolloClient as ApolloClient<any>,
//   false,
//   BaseLibraryModes.NormalBaseLibrary,
// );

onMounted(async () => {
  await getEntityById(props.entity.type as Entitytyping, props.entity.id);
});

const setNoImage = () => {
  imageSrcError.value = true;
};

const entityData = ref<any>(null);

const media = computed(() => {
  if (!entityData.value) return null;

  return getMediaFilenameFromEntity(entityData.value as BaseEntity);
});

const getEntityById = async (
  entityType: Entitytyping,
  id: string,
): Promise<void> => {
  const variables: GetEntityByIdQueryVariables = {
    id: id,
    type: entityType,
  };
  entitiesLoading.value = true;
  apolloClient
    .query({
      query: GetEntityByIdDocument,
      variables: variables,
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      entityData.value = result.data.Entity;
      entitiesLoading.value = false;
    })
    .catch(() => {
      entityData.value = null;
      entitiesLoading.value = false;
    });
};

const normalizedTeaserMetadata = computed(() => {
  if (!entityData.value) return [];

  return formatTeaserMetadata(
    entityData.value?.teaserMetadata,
    entityData.value?.intialValues,
  );
});
</script>
