<template>
  <div v-if="!showSplashScreen && route.name === 'EmbeddedViewer'">
    <router-view />
  </div>
  <div v-else-if="!showSplashScreen">
    <notifications class="pt-2" />
    <div v-if="!someModalIsOpened">
      <notifications
        class="pt-2 cursor-pointer"
        group="serviceVersionManager"
        @click="refreshPage()"
      />
      <div class="pt-2" v-if="config.features?.globalNotification">
        <notifications class="pt-2" group="globalNotification" width="700" />
      </div>
    </div>
    <the-navigation class="navbar" />
    <div>
      <div class="bg-background-normal pl-24 h-screen flex flex-col">
        <the-header />
        <div :class="['grow overflow-hidden min-h-0', { 'h-0': isSingle }]">
          <router-view />
        </div>
      </div>
      <AppModals />
    </div>
  </div>
  <div
    v-else
    class="w-full h-screen flex justify-center items-center animate-pulse"
  >
    <img src="/logo.svg" alt="Elody logo" class="h-48" />
  </div>
</template>

<script setup lang="ts">
import AppModals from "@/components/AppModals.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheNavigation from "@/components/menu/MenuNav.vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import { useApp } from "@/composables/useApp";
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { useCrossTabAuthSync } from "@/composables/useCrossTabAuthSync";
import { useGlobalNotification } from "./composables/useGlobalNotification";
import { inject, onMounted } from "vue";

const route = useRoute();
const { showSplashScreen } = useApp();
const { isSingle } = useRouteHelpers();
const { someModalIsOpened } = useBaseModal();
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
