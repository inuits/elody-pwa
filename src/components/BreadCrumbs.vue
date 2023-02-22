<!--<template>
  <h1 class="text-lg font-semibold text-neutral-800 float-left">
    <ol class="flex text-gray-700 bg-gray-300 rounded py-2 px-2">
      <li class="px-2">
        <a href="/" class="hover:underline">{{ pageInfo.routerTitle }}</a>
      </li>
      <li class="text-gray-500 select-none">&rsaquo;</li>
      <li class="px-2">
        <a href="#" class="hover:underline"
          ><span
            v-if="pageInfo.entityTitle !== '' && route.meta.showEntityTitle"
            class="text-neutral-400"
          >
            {{ pageInfo.entityTitle }}</span
          ></a
        >
      </li>
    </ol>
  </h1>
  <EditToggle v-if="auth.isAuthenticated.value === true" />
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePageInfo } from "../composables/usePageInfo";
import { useAuth } from "session-vue-3-oidc-library";

const { pageInfo } = usePageInfo();
const auth = useAuth();
const route = useRoute();
const router = useRouter();

watch(
  pageInfo,
  () => {
    if (pageInfo.value.entityTitle !== "") {
      document.title = pageInfo.value.entityTitle;
      return;
    }
    document.title = pageInfo.value.routerTitle;
  },
  { deep: true }
);
</script> -->
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
