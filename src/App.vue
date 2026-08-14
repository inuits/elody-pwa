<template>
  <div v-if="!showSplashScreen && route.name === 'EmbeddedViewer'">
    <router-view />
  </div>
  <div v-else-if="!showSplashScreen">
    <!-- Design-system toasts: status toasts announce politely, errors
         assertively and never auto-dismiss; hover pauses; max 3 stack. -->
    <notifications class="pb-2" position="bottom left" :max="3" pause-on-hover>
      <template #body="{ item, close }">
        <div
          class="vue-notification"
          :class="item.type"
          :role="item.type === 'error' ? 'alert' : 'status'"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div v-if="item.title" class="notification-title">
                {{ item.title }}
              </div>
              <div v-if="item.text">{{ item.text }}</div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <button
                v-if="item.data?.undoAction"
                type="button"
                class="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-[#7DE3EA] underline decoration-dotted hover:text-neutral-white focus-visible:outline-2 focus-visible:outline-accent-accent"
                @click="
                  () => {
                    item.data.undoAction();
                    close();
                  }
                "
              >
                {{ t("inline-edit.undo") }}
              </button>
              <button
                type="button"
                class="cursor-pointer border-none bg-transparent p-0 text-neutral-white/70 hover:text-neutral-white focus-visible:outline-2 focus-visible:outline-accent-accent"
                :aria-label="t('preview-component.close')"
                @click="close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </template>
    </notifications>
    <div v-if="!someModalIsOpened">
      <notifications
        class="pb-2 cursor-pointer"
        position="bottom left"
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();
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
