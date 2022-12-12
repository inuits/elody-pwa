<template>
  <div
    v-if="
      mediafileSelectionState.selectedMediafile &&
      mediafileSelectionState.selectedMediafile.metadata &&
      mediafileSelectionState.selectedMediafile.metadata.length > 0
    "
    class="metainfo absolute bg-neutral-0 z-20 mx-4 mt-7 p-4 shadow-sm bottom-0"
  >
    <h3 class="text-sm text-neutral-700 font-semibold">Mediainfo</h3>
    <div v-if="!isEdit && mediafileSelectionState.selectedMediafile.metadata">
      <div v-if="hasPrimaryFunctionality()">
        <div class="label">{{ $t("media-info.primaire-media") }}</div>
        <div class="value h-5 w-5">
          <BaseIcon
            v-if="mediafileSelectionState.selectedMediafile.is_primary"
            :name="Unicons.Check.name"
          />
          <BaseIcon v-else :name="Unicons.Cross.name" />
        </div>

        <div class="label">{{ $t("media-info.thumbnail") }}</div>
        <div class="value h-5 w-5">
          <BaseIcon
            v-if="
              mediafileSelectionState.selectedMediafile.is_primary_thumbnail
            "
            :name="Unicons.Check.name"
          />
          <BaseIcon v-else :name="Unicons.Cross.name" />
        </div>
      </div>
      <div
        v-for="item in mediafileSelectionState.selectedMediafile.metadata"
        :key="item && item.key ? item.key : 'no-key'"
      >
        <div v-if="item" class="flex flex-col mb-2 mt-2">
          <div class="label">{{ item.key }}</div>
          <div v-if="item.value" class="value">
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="isEdit && hasPrimaryFunctionality()"
      class="flex flex-col px-6 -mb-5 w-64 -ml-1"
    >
      <div class="flex justify-between">
        <span class="ml-1 text-neutral-700 text-sm">{{
          $t("media-info.primaire-media")
        }}</span>
        <div class="value h-5 w-5">
          <BaseIcon
            v-if="mediafileSelectionState.selectedMediafile.is_primary"
            :name="Unicons.Check.name"
          />
          <BaseIcon v-else :name="Unicons.Cross.name" />
        </div>
      </div>
      <BaseButton
        style="background-color: #7a869a !important"
        :label="$t('media-info.set-primair')"
        bg-color="neutral-100"
        bg-hover-color="neutral-400"
        txt-color="neutral-0"
        @click="setMediaPrimaire(mediafileSelectionState.selectedMediafile)"
      />
      <div class="flex justify-between">
        <span class="ml-1 text-neutral-700 text-sm">{{
          $t("media-info.thumbnail")
        }}</span>
        <div class="value h-5 w-5">
          <BaseIcon
            v-if="
              mediafileSelectionState.selectedMediafile.is_primary_thumbnail
            "
            :name="Unicons.Check.name"
          />
          <BaseIcon v-else :name="Unicons.Cross.name" />
        </div>
      </div>
      <BaseButton
        style="background-color: #7a869a !important"
        :label="$t('media-info.set-thumbnail')"
        bg-color="neutral-100"
        bg-hover-color="neutral-400"
        txt-color="neutral-0"
        @click="setMediaThumbnail(mediafileSelectionState.selectedMediafile)"
      />
    </div>
    <meta-edit-media
      v-if="isEdit && form?.Form"
      :form="form?.Form"
      :entity-title="''"
    />
  </div>
</template>
<script lang="ts">
import {
  GetFormsDocument,
  SetMediaPrimaireDocument,
  SetThumbnailPrimaireDocument,
} from "@/queries";
import type {
  MediaFile,
  SetMediaPrimaireMutation,
  SetThumbnailPrimaireMutation,
} from "@/queries";
import { useQuery } from "@vue/apollo-composable";
import BaseButton from "../base/BaseButton.vue";
import { defineComponent } from "vue";
import { useEditMode } from "@/composables/useEdit";
import MetaEditMedia from "@/components/base/MetaEditMedia.vue";
import { useEntityMediafileSelector } from "../EntityImageSelection.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import { Unicons } from "@/types";
import { useMutation } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import useMetaDataHelper from "@/composables/useMetaDataHelper";
import useMediaInfoHelper from "@/composables/useMediaInfoHelper";
const { isEdit, addSaveCallback } = useEditMode();

export default defineComponent({
  name: "MediaInfo",
  components: { MetaEditMedia, BaseIcon, BaseButton },
  setup() {
    const { mediafiles } = useMetaDataHelper();
    const { hasPrimaryFunctionality } = useMediaInfoHelper();
    const route = useRoute();
    const { mediafileSelectionState } = useEntityMediafileSelector();
    const { result: form } = useQuery(GetFormsDocument, {
      type: "media",
    });

    const { mutate: mutatePrimary, onError } =
      useMutation<SetMediaPrimaireMutation>(SetMediaPrimaireDocument);

    onError(() => {
      mediafileSelectionState.selectedMediafile.is_primary = false;
    });

    const { mutate: mutateThumbnail } =
      useMutation<SetThumbnailPrimaireMutation>(SetThumbnailPrimaireDocument);

    const setMediaPrimaireFalse = () => {
      mediafiles.value.forEach((mediafile: MediaFile) => {
        mediafile.is_primary = false;
      });
    };

    const setIsThumbnailPrimaireFalse = () => {
      mediafiles.value.forEach((mediafile: MediaFile) => {
        mediafile.is_primary_thumbnail = false;
      });
    };

    const setMediaPrimaire = async (input: any) => {
      setMediaPrimaireFalse();
      input.is_primary = true;
      addSaveCallback(async () => {
        await mutatePrimary({
          entity_id: route.params["id"],
          mediafile_id: input._id.replace("mediafiles/", ""),
        });
      });
    };

    const setMediaThumbnail = async (input: any) => {
      setIsThumbnailPrimaireFalse();
      input.is_primary_thumbnail = true;
      addSaveCallback(async () => {
        await mutateThumbnail({
          entity_id: route.params["id"],
          mediafile_id: input._id.replace("mediafiles/", ""),
        });
      });
    };

    return {
      isEdit,
      form,
      mediafileSelectionState,
      Unicons,
      setMediaPrimaire,
      setMediaThumbnail,
      hasPrimaryFunctionality,
    };
  },
});
</script>
<style lang="postcss" scoped>
.label {
  @apply rounded  text-xs text-neutral-60;
}
.value {
  @apply rounded  text-sm text-neutral-700 mt-0.5;
}
.label.loading,
.value.loading {
  @apply bg-neutral-20 text-neutral-20;
}

.metainfo {
  bottom: 1rem;
}
</style>
