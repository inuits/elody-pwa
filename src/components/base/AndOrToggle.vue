<template>
  <div class="flex bg-neutral-30 w-max p-1 justify-between rounded-md">
    <div
      id="on"
      class="cursor-pointer p-2 rounded-md"
      :class="AndOrState == true ? 'bg-neutral-0 text-blue-400' : ' '"
      @click="switched(true)"
    >
      {{ texton }}
    </div>
    <div
      id="off"
      class="cursor-pointer p-2 rounded-md"
      :class="AndOrState == false ? 'bg-neutral-0 text-blue-400 ' : ' '"
      @click="switched(false)"
    >
      {{ textoff }}
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';

  export default defineComponent({
    name: 'AndOrToggle',
    props: {
      texton: {
        type: String,
        default: '',
        required: true,
      },
      textoff: {
        type: String,
        default: '',
        required: true,
      },
    },
    emits: ['update:AndOrValue'],
    setup: (props, { emit }) => {
      const AndOrState = ref<boolean>(true);
      const switched = (value: boolean) => {
        // console.log('boollog', value);
        AndOrState.value = value;
        emit('update:AndOrValue', value);
      };

      return { switched, AndOrState };
    },
  });
</script>
