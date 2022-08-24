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
      :class="props.active == true ? 'bg-blue-50' : ''"
      @click="toggleAccordion"
    >
      <Label
        :name="props.label"
        :color="props.active == true ? 'blue-50' : 'bg-neutral-10'"
        class="text-neutral-900"
      />
      <p>
        <span v-show="isOpen"
          ><unicon :name="Unicons.Minus.name" height="20" fill="var(--neutral-900)"
        /></span>
        <span v-show="!isOpen"
          ><unicon :name="Unicons.Plus.name" height="20" fill="var(--neutral-900)"
        /></span>
      </p>
    </button>
    <div v-show="isOpen" class="border-solid border-b-2 border-neutral-30 px-3 py-5">
      <slot name="content" />
    </div>
  </div>
</template>
<script>
  import { defineComponent, ref, computed } from 'vue';
  import { Unicons } from '@/types';
  import Label from '@/components/base/Label.vue';
  export default defineComponent({
    name: 'FilterAccordion',
    components: {
      Label,
    },
    props: {
      active: {
        type: Boolean,
        required: true,
        default: false,
      },
      label: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const isOpen = ref(false);
      const toggleAccordion = () => {
        isOpen.value = !isOpen.value;
      };

      return { isOpen, toggleAccordion, Unicons, props };
    },
  });
</script>
