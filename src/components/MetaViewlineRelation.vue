<template>
  <div class="my-2">
    <div :class="[inputContainerStyle, ' input-container p-4 gap-3 flex-col']">
      <div
        v-for="{ value: metadataValue, key: metadataKey } in metadata.metadataOnRelation"
        :key="`${metadata.id}-${metadataKey}`"
      >
        <div class="label" :class="{ loading }" data-test="meta-label">
          {{ metadataKey }}
        </div>
        <div class="value" :class="{ loading }" data-test="meta-info">
          {{ metadataValue ? metadataValue : 'no data' }}
        </div>
      </div>
      <ListItem
        v-if="metadata.linkedEntity"
        :meta="metadata.linkedEntity.teaserMetadata"
        :thumb-icon="Unicons.NoImage.name"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { MetadataAndRelation } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { Unicons } from '@/types';
  import { inputContainerStyle, lableStyle } from './base/InputField.vue';
  import ListItem from '@/components/ListItem.vue';

  export default defineComponent({
    name: 'MetaViewlineRelation',
    components: { ListItem },
    props: {
      loading: { type: Boolean, default: false },
      metadata: {
        type: Array as PropType<MetadataAndRelation[]>,
        required: false,
        default: () => [],
      },
    },
    setup() {
      const router = useRouter();
      const { t } = useI18n();

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
      };
    },
  });
</script>

<style lang="postcss" scoped>
  .label {
    @apply rounded font-body text-xs text-neutral-60;
  }
  .value {
    @apply rounded font-body text-sm text-neutral-700 mt-0.5;
  }
  .label.loading,
  .value.loading {
    @apply bg-neutral-20 text-neutral-20;
  }
</style>
