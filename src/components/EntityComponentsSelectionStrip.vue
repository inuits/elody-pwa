<template>
  <div
    v-for="(entity, arrayKey) in entities"
    :key="entity.id"
    :class="[' px-5 py-2 flex flex-col justify-end']"
  >
    <img
      v-if="entity.mediafiles.length > 0"
      :class="[
        'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full',
      ]"
      :src="entity.mediafiles[0].thumbnail_file_location"
      @click="router.push({ name: 'SingleEntity', params: { id: entity.id } })"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { MinimalEntityFragment } from '@/queries';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'EntityComponentSelectionStrip',
    props: {
      entities: { type: Array as PropType<MinimalEntityFragment[]>, required: true },
      selectedId: {
        type: String,
        required: true,
      },
    },
    setup() {
      return {
        router: useRouter(),
      };
    },
  });
</script>
