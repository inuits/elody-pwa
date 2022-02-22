<template>
  <div class="bg-neutral-10">
    <button
      class="
        flex
        items-center
        space-x-3
        border-solid border-b-2 border-neutral-30 border-r-0
        w-full
        justify-between
        px-3
        py-5
      "
      @click="toggleAccordion"
    >
      <slot name="title" />
      <p>
        <span v-show="isOpen"
          ><unicon
            :name="Unicons.Minus.name"
            height="20"
            :fill="loading ? 'var(--color-neutral-20)' : `${iconColor}`"
        /></span>
        <span v-show="!isOpen"
          ><unicon
            :name="Unicons.Plus.name"
            height="20"
            :fill="loading ? 'var(--color-neutral-20)' : `${iconColor}`"
        /></span>
      </p>
    </button>

    <div v-show="isOpen" class="border-solid border-b-2 border-neutral-30 px-3 py-5">
      <slot name="content" />
    </div>
  </div>
</template>
<script>
  import { defineComponent, ref } from 'vue';
  import { Unicons } from '@/types';
  export default defineComponent({
    name: 'FilterAccordion',
    setup() {
      const isOpen = ref(false);
      const toggleAccordion = () => {
        isOpen.value = !isOpen.value;
      };
      return { isOpen, toggleAccordion, Unicons };
    },
  });
</script>
