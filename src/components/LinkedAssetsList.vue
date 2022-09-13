<template>
    <div v-if="linkedAssets.length > 0" :class="'w-2/6'">
      <div class="p-2 pt-3">
          <ListItem
            v-for="entity in linkedAssets"
            :key="entity.id"
            :meta="entity.teaserMetadata"
            :media="entity.media ? entity.media.primaryMediafile : null"
            :thumb-icon="Unicons.NoImage.name"
            @click="
              !enableSelection &&
                router.push({ name: 'SingleEntity', params: { id: entity.id } })
            "
          >
            <template #actions>
              <BaseButton
                class="ml-2"
                :icon="Unicons.Eye.name"
                @click="router.push({ name: 'SingleEntity', params: { id: entity.id } })"
              />
            </template>
          </ListItem>
        </div>
    </div>
</template>

<script lang="ts">
  import BaseButton from '@/components/base/BaseButton.vue';
  import ListItem from '@/components/ListItem.vue';
  import { Entity } from '@/queries';
  import { Unicons } from '@/types';
  import { defineComponent, PropType } from 'vue';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'LinkedAssetsList',
    components: {
      BaseButton,
      ListItem
    },
    props: {
      linkedAssets: {
        type: Array as PropType<Entity[]>,
        required: true
      }
    },
    setup() {
      const router = useRouter();
      return {
        Unicons,
        router
      };
    },
  });
</script>
