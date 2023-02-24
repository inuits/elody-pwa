<template>
  <div class="relative">
    <h1 class="text-lg font-semibold text-neutral-800 float-left">
      <a href="/" class="hover:underline">{{ routerTitle }}</a>
      <span v-if="showEntityTitle" class="text-gray-500">&rsaquo;</span>
      <span v-if="showEntityTitle" class="dropdown inline-block relative">
        <a href="#" class="hover:underline">
          {{ entityTitle }}
        </a>
        <ul class="dropdown-menu absolute hidden z-10">
          <li v-for="(page, index) in visitedPages" :key="index">
            <a :href="page.path" class="hover:underline">{{ page.title }}</a>
          </li>
        </ul>
      </span>
    </h1>
    <EditToggle v-if="isAuthenticated" />
  </div>
</template>

<script lang="ts" setup>
import useBreadcrumb from '../composables/useBreadcrumb';
const { routerTitle, entityTitle, showEntityTitle, isAuthenticated, visitedPages } = useBreadcrumb();
</script>
