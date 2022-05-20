<template>
  <div class="p-6 bg-neutral-0 pb-20">
    <div>
      <label for="entities">Choose an entity to create...</label><br />
      <select id="entity" v-model="selected" name="entity">
        <option disabled value="">Choose an entity...</option>
        <option value="story">Story</option>
        <option value="frame">Frame</option>
        <option value="asset">Asset</option>
      </select>
    </div>
    <div>{{ selected }}</div>
    <CreateStory v-if="selected == 'story'" />
    <CreateFrame v-if="selected == 'frame'" />
    <CreateAsset v-if="selected == 'asset'" />
  </div>
</template>
<script lang="ts">
  import { GetFormsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { defineComponent, ref } from 'vue';
  import { watch } from 'vue-demi';
  import CreateStory from '../components/CreateStory.vue';
  import CreateFrame from '../components/CreateFrame.vue';
  import CreateAsset from '@/components/CreateAsset.vue';
  export default defineComponent({
    name: 'CreateEntity',
    components: { CreateStory, CreateFrame, CreateAsset },
    setup() {
      const selected = ref<String>('');
      return {
        selected,
      };
    },
  });
</script>
