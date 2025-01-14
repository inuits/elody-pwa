<template>
  <ul
    v-if="item"
    class="border-neutral-700"
  >
    <li
      data-test="li-tree"
      class="text-neutral-700 font-bold flex items-center relative flex-grow justify-between border-neutral-50 hover:border-blue-500 border-r-4"
      :class="{
        'bg-blue-75':
          selectedItem && selectedItem === item
      }"
    >
      <div
        class="py-4 flex items-center flex-grow mr-10 group cursor-pointer"
        @click="emit('updateSelectedItem', item)"
      >
        <span
          class="inline-block h-1px bg-neutral-700 group=hover:bg-blue-500"
        />
        <span
          class="rounded-full bg-neutral-700 circle inline-block mr-4 -ml-1 z-10 group-hover:bg-blue-500"
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

<style scoped>
.h-1px {
  height: 1px;
}

.last-ul li {
  position: relative;
}

.last-ul > li:before {
  content: "";
  position: absolute;
  height: 50%;
  top: 0;
  left: 0px;
}

.last-ul > li:after {
  content: "";
  position: absolute;
  height: 2rem;
  top: -2rem;
  left: 0px;
}

.circle {
  width: 10px;
  flex-basis: 10px;
  height: 10px;
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
