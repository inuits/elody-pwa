<template>
  <div
    class="w-full px-6 py-8 border-b border-neutral-50 z-10 flex items-center justify-between bg-neutral-0"
  >
    <div class="flex w-full items-center">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePageInfo } from "../composables/usePageInfo";
import EditToggle from "./EditButtons.vue";
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
</script>
