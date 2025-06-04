<template>
  <ul v-if="item" class="border-neutral-700">
    <li
      data-test="li-tree"
      class="text-neutral-700 font-bold flex items-center relative grow justify-between border-neutral-50 hover:border-blue-500 border-r-4"
      :class="{
        'bg-blue-75': selectedItem && selectedItem === item,
      }"
    >
      <div
        class="py-4 flex items-center grow mr-10 group cursor-pointer"
        @click="emit('updateSelectedItem', item)"
      >
        <span
          class="inline-block h-[1px] bg-neutral-700 group=hover:bg-blue-500"
        />
        <span
          class="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block mr-4 -ml-1 z-10 group-hover:bg-blue-500"
        />
        <span class="inline-block mr-3 group-hover:text-blue-500">
          {{ item }}
        </span>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: any;
  selectedItem: any;
}>();

const emit = defineEmits<{
  (event: "updateSelectedItem", selectedItem: any): void;
}>();
</script>

<style scoped></style>
