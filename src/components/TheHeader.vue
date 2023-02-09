<template>
  <div
    class="w-full px-6 py-8 border-b border-neutral-50 z-10 flex items-center justify-between bg-neutral-0"
  >
    <div class="flex w-full items-center">
      <h1 class="text-lg font-semibold text-neutral-800 float-left">
        {{ pageInfo.routerTitle
        }}<span
          v-if="pageInfo.entityTitle !== '' && route.meta.showEntityTitle"
          class="text-neutral-400"
        >
          / {{ pageInfo.entityTitle }}</span
        >
      </h1>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePageInfo } from "../composables/usePageInfo";
import BaseButton from "../components/base/BaseButton.vue";
import EditToggle from "./EditButtons.vue";

const { pageInfo } = usePageInfo();
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

const logout = async () => {
  await auth.logout();
  router.push({ name: "Home" });
};
</script>
