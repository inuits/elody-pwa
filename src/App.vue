<template>
  <div v-if="!showSplashScreen && route.name === 'EmbeddedViewer'">
    <router-view />
  </div>
  <div v-else-if="!showSplashScreen">
    <Teleport :to="topmostOpenDialog ?? 'body'" :disabled="!topmostOpenDialog">
      <notifications class="pt-2" />
    </Teleport>
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
    <the-navigation />
    <div>
      <div
        :inert="(isCompact && isDrawerOpen) || undefined"
        class="bg-background-normal h-screen flex flex-col transition-[padding] duration-(--transition-duration-ui) ease-(--ease-ui) motion-reduce:transition-none"
        :class="contentOffset"
      >
        <MobileTopBar v-if="isCompact" />
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
import AppModals from "@/components/AppModals.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheNavigation from "@/components/navigation/NavRail.vue";
import MobileTopBar from "@/components/navigation/MobileTopBar.vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import { useApp } from "@/composables/useApp";
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { useNavMenu } from "@/composables/useNavMenu";
import BlockingOverlay from "@/components/base/BlockingOverlay.vue";
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import { useCrossTabAuthSync } from "@/composables/useCrossTabAuthSync";
import { useGlobalNotification } from "./composables/useGlobalNotification";
import { computed, inject, onMounted } from "vue";

const route = useRoute();
const { showSplashScreen } = useApp();
const { isSingle } = useRouteHelpers();
const { someModalIsOpened, topmostOpenDialog } = useBaseModal();
const { isBlocking } = useBlockingLoader();
const { isOpen: isMenuOpen, isCompact, isDrawerOpen } = useNavMenu();
const contentOffset = computed(() => {
  const styles = {
    drawer: "",
    rail: isMenuOpen.value ? "pl-(--nav-flyout-width)" : "pl-(--nav-rail-width)",
  };
  return isCompact.value ? styles.drawer : styles.rail;
});
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
