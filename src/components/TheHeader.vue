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
    <div class="float-right">
      <form>
        <div class="flex">
          <div class="relative w-full">
            <input
              type="search"
              id="search"
              class="rounded-lg"
              placeholder=""
              required
            />
            <button
              type="submit"
              class="absolute top-0 right-0 p-2.5 text-sm font-medium text-white bg-#052737 rounded-lg border"
              style="background-color: #052737"
            >
              <svg
                aria-hidden="true"
                class="w-5 h-5"
                fill="none"
                stroke="#ffffff"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePageInfo } from "../composables/usePageInfo";
import { useAuth } from "session-vue-3-oidc-library";
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import InputField from "./base/InputField.vue";
import EditToggle from "./EditButtons.vue";

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
