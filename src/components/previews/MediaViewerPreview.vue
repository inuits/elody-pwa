<template>
  <div
    class="flex flex-col h-[50vh] max-md:h-(--preview-viewer-height-compact)"
  >
    <div
      v-if="mediafilesLoading"
      class="flex-1 min-h-0 w-full flex justify-center items-center"
    >
      <spinner-loader theme="accent" />
    </div>
    <MediaViewerNew
      v-else
      :key="entityId"
      class="flex-1 min-h-0"
      :mediafiles="mediafiles"
      :current-mediafile="currentMediafile"
      :cropMediafileCoordinatesKey="cropMediafileCoordinatesKey"
      :parent-entity-id="parentEntityId"
      :parent-entity-type="parentEntityType"
      :relation-type="relationType"
      :refetch-entities="refetchEntities"
      :hide-navigation="showsThumbnailStrip"
      @toggle-preview-component="
        (id: string) => emit('togglePreviewComponent', id)
      "
    />
    <!-- full-screen on a small screen: a strip to jump between the files -->
    <div
      v-if="showsThumbnailStrip"
      class="shrink-0 flex gap-2 p-(--thumb-strip-pad) border-t border-border-subtle overflow-x-auto"
    >
      <button
        v-for="thumbnail in thumbnails"
        :key="thumbnail.id"
        type="button"
        data-cy="preview-thumbnail"
        class="flex items-center justify-center shrink-0 size-(--thumb-strip-size) rounded-sm overflow-hidden bg-surface-muted text-text-subtle cursor-pointer"
        :class="thumbnail.isCurrent ? 'ring-2 ring-accent ring-offset-2' : ''"
        :aria-label="thumbnail.label"
        :aria-current="thumbnail.isCurrent || undefined"
        @click="!thumbnail.isCurrent && emit('togglePreviewComponent', thumbnail.id)"
      >
        <ImageViewer
          v-if="thumbnail.url"
          height-class="h-full"
          width-class="w-full object-cover"
          :url="thumbnail.url"
          :media-is-link="thumbnail.isLink"
        />
        <unicon v-else :name="Unicons.Image.name" height="22" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type Entity, type Entitytyping } from "@/generated-types/queries";
import MediaViewerNew from "@/components/base/MediaViewerNew.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { isCompact } from "@/composables/useNavMenu";
import { useListItemHelper } from "@/composables/useListItemHelper";
import { getTitleOrNameFromEntity, stringIsUrl } from "@/helpers";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    currentMediafile?: Entity | undefined;
    mediafiles: Entity[];
    mediafilesLoading: boolean;
    entityId: string | undefined;
    cropMediafileCoordinatesKey: string;
    parentEntityId?: string;
    parentEntityType?: Entitytyping;
    relationType?: string;
    refetchEntities?: () => Promise<void>;
  }>(),
  {
    currentMediafile: undefined,
  },
);
const emit = defineEmits<{
  (event: "togglePreviewComponent", entityId: string): void;
}>();

const { getMediaFilenameFromEntity } = useListItemHelper();

const showsThumbnailStrip = computed(
  () => isCompact.value && props.mediafiles.length > 1,
);

// The same square IIIF crop a list row shows.
const thumbnails = computed(() =>
  props.mediafiles.map((mediafile) => {
    const media = getMediaFilenameFromEntity(mediafile);
    const isLink = stringIsUrl(media ?? "");
    return {
      id: mediafile.id,
      label: getTitleOrNameFromEntity(mediafile),
      isCurrent: mediafile.id === props.entityId,
      isLink,
      url:
        media && (isLink ? media : `/api/iiif/3/${media}/square/^100,/0/default.jpg`),
    };
  }),
);
</script>

<style scoped></style>
