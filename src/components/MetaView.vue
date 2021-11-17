<template>
  <div v-if="metadata.length != 0" class="p-6 bg-neutral-0">
    <div v-for="item in metadata" :key="item.value" class="flex flex-col mb-2 mt-2">
      <span class="label" :class="{ loading }" data-test="meta-label">
        {{ item.key }}
      </span>
      <span class="value" :class="{ loading }" data-test="meta-info">
        {{ item.value }}
      </span>
    </div>
  </div>
  <div
    v-if="metadata.length == 0"
    class="justify-center items-center flex mt-4 text-neutral-700 font-bold"
  >
    No metadata available
  </div>

  <div v-if="relations.length != 0" class="p-6 bg-neutral-0 flex flex-row flex-wrap w-max">
    <div v-for="relation in relations" :key="relation.key">
    <relation-tag v-if="relation.label != null"
      :id="relation.key"
      :label="relation.label"
      class="bg-tag-neutral m-2 ml-0"
    />
    </div>
  </div>
  <div
    v-if="relations.length == 0"
    class="justify-center items-center flex mt-4 text-neutral-700 font-bold"
  >
    No relations available
  </div>
</template>

<script lang="ts">
  import { GetEnumsByNameDocument, Metadata, Relation } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { computed, defineComponent, PropType, watch } from 'vue';
  import RelationTag from './RelationTag.vue';

  export default defineComponent({
    name: 'MetaView',
    props: {
      loading: { type: Boolean, default: false },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
      relations: { type: Array as PropType<Relation[]> },
    },
    components: {
      RelationTag,
    },
    setup(props) {
      const { result, error, loading, refetch } = useQuery(GetEnumsByNameDocument, {
        enumName: 'MetaKey',
      });

      watch(
        () => props.relations,
        () => {
          console.log('RELATIONS', props.relations);
        },
        { immediate: true },
      );

      return { labels: computed(() => result.value?.__type?.enumValues || []), props };
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
