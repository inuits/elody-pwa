<template>
  <div v-for="item in metadata" :key="item.label" class="flex flex-col mb-2 mt-2">
    <div v-if="item.label" class="label" :class="{ loading }" data-test="meta-label">
      <a
        v-if="item.nested"
        class="underline"
        :href="`/${item.key.replace('entities', 'entity')}`"
        v-html="t(`${item.label}`)"
      />
      <span v-else v-html="t(`${item.label}`)" />
    </div>
    <div v-else class="label" :class="{ loading }">no label</div>
    <div v-if="item.data && item.nested && nested">
      <div
        v-for="data in item.data"
        :key="data?.nestedMetaData ? data?.nestedMetaData.id : 'no-id'"
        class="ml-4"
      >
        <meta-view-line
          v-if="data?.nestedMetaData?.metadataCollection"
          :metadata="data?.nestedMetaData?.metadataCollection"
          :loading="loading"
          :nested="false"
        />
      </div>
    </div>
    <div
      v-if="(item.data && !item.nested) || (item.data && item.nested && !nested)"
      class="value"
      :class="{ loading }"
      data-test="meta-info"
    >
      {{ concatMetaDataValue(item.data) }}
    </div>
    <div v-if="!item.data" class="value" :class="{ loading }">no data</div>
  </div>
  <div
    v-if="metadata.length == 0"
    class="justify-left items-center flex text-sm text-red-default"
  >
    No metadata available
  </div>
</template>

<script lang="ts">
  import { Maybe, Metadata, MetadataCollection } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'MetaViewLine',
    props: {
      loading: { type: Boolean, default: false },
      metadata: { type: Array as PropType<MetadataCollection[]>, required: false },
      nested: { type: Boolean, default: true },
    },
    setup() {
      const router = useRouter();
      const { t } = useI18n();
      const concatMetaDataValue = (input: Maybe<Metadata>[]): string => {
        let result = '';
        input.forEach((data: Maybe<Metadata>) => {
          if (result !== '' && data && data.value) {
            result = `${result}, ${data.value}`;
          }
          if (result === '' && data && data.value) {
            result = data.value;
          }
        });

        return result;
      };

      return {
        t,
        router,
        concatMetaDataValue,
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
