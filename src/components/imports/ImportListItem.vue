<template>
  <ul v-if="item" class="border-neutral-700">
    <li
      data-test="li-tree"
      class="text-neutral-700 font-bold flex items-center relative grow justify-between border-neutral-50 hover:border-accent border-r-4"
      :class="{
        'bg-accent-light': selectedItem && selectedItem === item,
      }"
    >
      <div
        class="py-4 flex items-center grow mr-10 group cursor-pointer"
        @click="emit('updateSelectedItem', item)"
      >
        <span
          class="inline-block h-px bg-neutral-700 group=hover:bg-accent"
        />
        <span
          class="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block mr-4 -ml-1 z-10 group-hover:bg-accent"
        />
        <span class="inline-block mr-3 group-hover:text-accent">
          {{ item }}
        </span>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  item: any;
  selectedItem: any;
}>();

const emit = defineEmits<{
  (event: "updateSelectedItem", selectedItem: any): void;
}>();
</script>

<style scoped></style>
