<template>
  <div class="my-2">
    <div :class="[inputContainerStyle, ' input-container  gap-3 flex-col']">
      <!-- <pre>
        {{metadata}}
      </pre> -->
      <div
        v-for="m in metadata.metadataOnRelation"
        :key="`${metadata.key}-${m ? m.key : 'no-key'}`"
        class="px-8 pt-2"
      >
      <div v-if="m">
        <div class="label" :class="{ loading }" data-test="meta-label">
          {{ m.key }}
        </div>
        <div class="value" :class="{ loading }" data-test="meta-info">
          {{ m.value ? m.value : "no data" }}
        </div>
      </div>
      </div>
      <ListItem
        v-if="
          metadata.linkedEntity &&
          metadata.linkedEntity.__typename !== 'IntermediateEntity'
        "
        :meta="metadata.linkedEntity.teaserMetadata"
        :media="
          metadata.linkedEntity.media
            ? metadata.linkedEntity.media.primary_transcode
            : null
        "
        :thumb-icon="getThumbnail(metadata)"
        :small="true"
        @click="
          router.push({
            name: 'SingleEntity',
            params: { id: metadata?.linkedEntity.id },
          })
        "
      />
      <div
        v-if="
          metadata.linkedEntity &&
          metadata.linkedEntity.__typename === 'IntermediateEntity'
        "
      >
        <div
          v-for="metadataFromLinkedEntity in metadata.linkedEntity.metadata"
          :key="metadataFromLinkedEntity ? metadataFromLinkedEntity.key : 'no-key'"
          :metadata="metadataFromLinkedEntity"
          class="p-2"
        >
          <div v-if="metadataFromLinkedEntity">
            <div
              v-if="metadataFromLinkedEntity.label"
              class="label"
              :class="{ loading }"
              data-test="meta-label"
            >
              {{ checkTranslationForlabel(metadataFromLinkedEntity.label) }}
            </div>
            <div
              v-else-if="
                metadataFromLinkedEntity.label != metadataFromLinkedEntity.key
              "
              class="label"
              :class="{ loading }"
            >
            {{$t('meta.no-label')}}
            </div>

            <meta-viewline-relation
              v-if="metadataFromLinkedEntity.linkedEntity"
              :metadata="metadataFromLinkedEntity"
            />

            <div
              v-if="!metadataFromLinkedEntity.linkedEntity"
              class="value"
              :class="{ loading }"
              data-test="meta-info"
            >
              {{
                metadataFromLinkedEntity.value
                  ? metadataFromLinkedEntity.value
                  : $t('meta.no-data')
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { MetadataRelation } from "@/queries";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Unicons } from "@/types";
import { inputContainerStyle } from "./base/InputField.vue";
import ListItem from "@/components/ListItem.vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";

export default defineComponent({
  name: "MetaViewlineRelation",
  components: { ListItem },
  props: {
    loading: { type: Boolean, default: false },
    metadata: {
      type: Object as PropType<MetadataRelation>,
      required: false,
      default: () => {},
    },
  },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const { getThumbnail } = useThumbnailHelper();
    const checkTranslationForlabel = (input: string) => {
      const translationKey = `metadata.${input}`;
      const translation = t(translationKey);

      return translation === translationKey ? input : translation;
    };

    return {
      t,
      router,
      Unicons,
      inputContainerStyle,
      checkTranslationForlabel,
      getThumbnail,
    };
  },
});
</script>

<style lang="postcss" scoped>
.label {
  @apply rounded text-xs text-neutral-60;
}
.value {
  @apply rounded text-sm text-neutral-700 mt-0.5;
}
.label.loading,
.value.loading {
  @apply bg-neutral-20 text-neutral-20;
}
</style>
