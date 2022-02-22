<template>
  <div v-for="item in metadata" :key="item.label" class="flex flex-col mb-2 mt-2">
    <div v-if="item.label" class="label" :class="{ loading }" data-test="meta-label">
      <a
        v-if="item.linkedEntity"
        class="underline"
        :href="`/${item.key.replace('entities', 'entity')}`"
      >
        {{ checkTranslationForlabel(item.label) }}
      </a>
      <span v-else>{{ checkTranslationForlabel(item.label) }}</span>
    </div>
    <div v-else class="label" :class="{ loading }">no label</div>
    <div v-if="item.linkedEntity && nested">
      <div class="ml-4">
        <meta-view-line
          v-if="item.linkedEntity.metadata"
          :metadata="item.linkedEntity.metadata"
          :loading="loading"
          :nested="true"
        />
      </div>
    </div>
    <div
      v-if="
        (item.value && !item.linkedEntity) || (item.value && item.linkedEntity && !nested)
      "
      class="value"
      :class="{ loading }"
      data-test="meta-info"
    >
      {{ item.value }}
    </div>
    <div v-if="!item.value" class="value" :class="{ loading }">no data</div>
  </div>
  <div
    v-if="metadata.length == 0"
    class="justify-left items-center flex text-sm text-red-default"
  ></div>
</template>

<script lang="ts">
  import { MetadataAndRelation } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'MetaViewLine',
    props: {
      loading: { type: Boolean, default: false },
      metadata: {
        type: Array as PropType<MetadataAndRelation[]>,
        required: false,
        default: () => [],
      },
      nested: { type: Boolean, default: true },
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
