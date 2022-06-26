<template>
  <div class="p-6 bg-neutral-0 pb-20">
    <div>
      <label for="entities">Choose an entity to create...</label><br />
      <Dropdown v-model="selected" :options="Entitytyping" label="Type" />
    </div>
    <div>{{ selected }}</div>
    <CreateEntityForm v-if="selected" :entity-type="selected" />
  </div>
</template>
<script lang="ts">
  import Dropdown from '@/components/base/Dropdown.vue';
  import { Entitytyping } from '@/queries';
  import { defineComponent, ref } from 'vue';
  import CreateEntityForm from '../components/CreateEntityForm.vue';
  export default defineComponent({
    name: 'CreateEntity',
    components: { CreateEntityForm, Dropdown },
    setup() {
      const selected = ref<Entitytyping>(Entitytyping.Story);
      return {
        selected,
        Entitytyping,
      };
    },
  });
</script>
