<template>
  <div
    class="
      w-6
      h-6
      rounded
      cursor-pointer
      top-0
      right-0
      absolute
      m-1
      bg-neutral-30
      hover:bg-red-default
      border-2 border-neutral-900
    "
  >
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
