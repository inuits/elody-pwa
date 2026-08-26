<template>
  <div v-if="!showSplashScreen && route.name === 'EmbeddedViewer'">
    <router-view />
  </div>
  <div v-else-if="!showSplashScreen">
    <notifications position="bottom left" :pause-on-hover="true">
      <template #body="{ item, close }">
        <BaseToast
          :type="item.type"
          :title="item.title"
          :text="item.text"
          :action-label="item.data?.actionLabel"
          @action="
            () => {
              item.data?.onAction?.();
              close();
            }
          "
          @close="close"
        />
      </template>
    </notifications>
    <div v-if="!someModalIsOpened">
      <!-- The one sanctioned global toast: top-centre, whole-clickable,
           never auto-dismisses (feedback.md §Round 2). -->
      <notifications
        class="pt-2 cursor-pointer"
        position="top center"
        group="serviceVersionManager"
        @click="refreshPage()"
      />
      <div class="pt-2" v-if="config.features?.globalNotification">
        <notifications class="pt-2" group="globalNotification" width="700" />
      </div>
    </div>
    <the-navigation class="navbar" />
    <div>
      <div class="bg-background-normal pl-[52px] h-screen flex flex-col">
        <the-header />
        <div :class="['grow overflow-hidden min-h-0', { 'h-0': isSingle }]">
          <router-view />
        </div>
      </div>
      <AppModals />
    </div>
    <BlockingOverlay :is-blocking="isBlocking && !someModalIsOpened" fixed />
  </div>
  <div
    v-else
    class="w-full h-screen flex justify-center items-center animate-pulse"
  >
    <img src="/logo.svg" alt="Elody logo" class="h-48" />
  </div>
</template>

<script setup lang="ts">
import BaseToast from "@/components/base/BaseToast.vue";
import AppModals from "@/components/AppModals.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheNavigation from "@/components/menu/MenuNav.vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import { useApp } from "@/composables/useApp";
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import BlockingOverlay from "@/components/base/BlockingOverlay.vue";
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import { useCrossTabAuthSync } from "@/composables/useCrossTabAuthSync";
import { useGlobalNotification } from "./composables/useGlobalNotification";
import { inject, onMounted } from "vue";

const route = useRoute();
const { showSplashScreen } = useApp();
const { isSingle } = useRouteHelpers();
const { someModalIsOpened } = useBaseModal();
const { isBlocking } = useBlockingLoader();
const config: any = inject("config");

useHead({
  meta: [
    {
      name: "ROBOTS",
      content: "NOINDEX, NOFOLLOW",
    },
  ],
});

const refreshPage = (): void => {
  window.location.reload();
};

useCrossTabAuthSync();
onMounted(() => {
  useGlobalNotification(config);
});
</script>

<style>
@import "@/assets/main.css";

.navbar:hover ~ .move-by-nav,
.navbar:hover + .move-by-nav .move-by-nav {
  -webkit-transition: padding-left 300ms ease-in-out;
  -moz-transition: padding-left 300ms ease-in-out;
  -o-transition: padding-left 300ms ease-in-out;
  transition: padding-left 300ms ease-in-out;
  padding-left: 20rem;
}

.notification-title {
  @apply text-xl;
}

.notification-content {
  @apply text-base;
}

@keyframes logo-animation {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(90deg);
  }
}
</style>
