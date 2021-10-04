<template>
  <div v-if="metadata.length != 0" class="p-6 bg-neutral-0">    
    <div v-for="item in metadata" :key="item.key" class="flex flex-col mb-2 mt-2 ">
      <span class="label" :class="{ loading }" data-test="meta-label">
        {{ item.value }}
      </span>
      <div>
        <InputField
          :isDisabled="!editMode"
          v-model="Empty"
          :debounce="true"
          placeholder=""
          :bgColor="'neutral-20'"
      />
      </div>
    </div>
  </div>
  <div v-if="metadata.length == 0" class="justify-center items-center flex mt-4 text-neutral-700 font-bold"> No metadata available</div>
</template>

<script lang="ts">
  import { GetEnumsByNameDocument, Metadata } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { computed, defineComponent, PropType } from 'vue';
  import InputField from '@/components/base/InputField.vue';


  export default defineComponent({
    name: 'MetaView',
    components:{ InputField },
    props: {
      loading: { type: Boolean, default: false },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
      editMode: { type: true || false, default: false },
    },
    setup(props){
      const { result, error, loading, refetch } = useQuery(GetEnumsByNameDocument, { enumName: "MetaKey" });
      return { labels: computed(() => result.value?.__type?.enumValues || []), props};
    }
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
