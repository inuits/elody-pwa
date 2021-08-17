<template>
  <!-- eslint-disable vue/no-v-html -->
  <svg xmlns="http://www.w3.org/2000/svg" :viewBox.camel="viewBox" v-html="icon" />
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { Unicon } from 'vue-unicons';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'Unicon',
    props: {
      name: { type: String as PropType<keyof Unicons>, required: true },
      iconStyle: { type: String, default: 'line' },
      viewBox: { type: String, default: '0 0 24 24' },
    },
    setup(props) {
      return {
        icon: Unicon.lib.find(
          (i: any) => i.name === props.name && i.style === props.iconStyle,
        ).path,
      };
    },
  });
</script>
