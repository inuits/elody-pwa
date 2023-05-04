<template>
  <div :class="'w-3/6 pt-3 overflow-y-auto'">
    <div class="px-2 mb-1">
      <span class="ml-1 text-neutral-700 text-sm">{{
        $t("media-files.linked-assets.related-assets")
      }}</span>
    </div>
    <div v-for="entity in linkedAssets" :key="entity.id" class="px-2 mb-1">
      <ListItem
        :teaser-metadata="
          entity.teaserMetadata?.flatMap((metadata) => metadata ?? [])
        "
        :media="entity.media ? entity.media.primary_transcode : null"
        :thumb-icon="getThumbnail(entity)"
        @click="
          router.push({ name: 'SingleEntity', params: { id: entity.id } })
        "
        :small="true"
      >
        <template #actions>
          <BaseButton
            class="ml-2"
            :icon="Unicons.Eye.name"
            @click="
              router.push({ name: 'SingleEntity', params: { id: entity.id } })
            "
          />
        </template>
      </ListItem>
    </div>
  </div>
</template>

<script lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import ListItem from "@/components/ListItem.vue";
import type { MediaFileEntity } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { useRouter } from "vue-router";
import useThumbnailHelper from "@/composables/useThumbnailHelper";

export default defineComponent({
  name: "LinkedAssetsList",
  components: {
    BaseButton,
    ListItem,
  },
  props: {
    linkedAssets: {
      type: Array as PropType<MediaFileEntity[]>,
      required: true,
    },
  },
  setup() {
    const { getThumbnail } = useThumbnailHelper();
    const router = useRouter();

    return {
      Unicons,
      router,
      getThumbnail,
    };
  },
});
</script>
