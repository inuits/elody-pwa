<template>
  <div>
    <Icon :name="Unicons.Trash.name" />
  </div>
</template>
<script>
  import { defineComponent } from 'vue';
  import { Unicons } from '@/types';
  import Icon from '@/components/base/Icon.vue';

  export default defineComponent({
    name: 'TrashIcon',
    components: {
      Icon,
    },
    setup() {
      return { Unicons };
    },
  });
</script>
