<template>
   <router-link
      :to="{ name: 'Mediafiles' }"
      activeClass="IsActive"
      v-show="show"
      class="flex flex-row items-center menu-item"
    >
      <BaseButton
        :icon="icon"
        class="menu-btn"
        :icon-height="iconHeight"
        bg-color="var(--color-neutral)"
      />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold">
        {{ name }}
      </span>
    </router-link>
  </template>
  
  <script lang="ts" setup>
    const props = defineProps({
    icon:String,
    clickFunc:Function,
    iconHeight:Number,
    bgColor:String,
    show:Boolean,
    name:String

    })

  
  </script>
  
  <style scoped>
  
  </style>
  