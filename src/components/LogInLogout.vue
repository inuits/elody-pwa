<template>
  <div>
    <div
      class="flex flex-row items-center fixed bottom-8 left-4 hover:text-accent-accent cursor-pointer"
    >
      <unicon
        v-if="auth.isAuthenticated.value === false"
        @click="auth.redirectToLogin()"
        :name="Unicons.UserCircle.name"
        height="21"
        class="mt-1 ml-4"
      />
      <transition v-if="isExpanded">
        <span
          v-if="auth.isAuthenticated.value === false"
          @click="auth.redirectToLogin()"
          class="overflow-hidden px-4 font-bold"
          ss
        >
          {{ t("navigation.log-in") }}
        </span>
      </transition>
    </div>

    <div
      class="flex flex-row items-center fixed bottom-8 left-4 hover:text-accent-accent cursor-pointer"
    >
      <unicon
        v-if="auth.isAuthenticated.value === true"
        @click="performLogout"
        :name="Unicons.SignOut.name"
        height="20"
        class="mt-1 ml-4"
      />
      <transition v-if="isExpanded">
        <span
          v-if="auth.isAuthenticated.value === true"
          @click="performLogout"
          class="overflow-hidden px-4 font-bold"
        >
          {{ t("navigation.log-out") }}
        </span>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useAuth } from "session-vue-3-oidc-library";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

defineProps({
  isExpanded: Boolean,
});

const { t } = useI18n();
const route = useRoute();
const auth = useAuth();

const performLogout = () => {
  auth.logout();
  setTimeout(() => {
    if (route.meta.requiresAuth === true) {
      auth.redirectToLogin();
    }
  }, 100);
};
</script>

<style></style>
