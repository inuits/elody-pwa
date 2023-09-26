<template>
  <div>
    <div
      class="flex flex-row items-center hover:text-accent-accent cursor-pointer"
    >
      <unicon
        v-if="auth.isAuthenticated.value === false"
        @click="auth.redirectToLogin()"
        :name="Unicons.UserCircle.name"
        height="21"
        class="mt-1"
      />
      <span
        v-if="auth.isAuthenticated.value === false"
        @click="auth.redirectToLogin()"
        class="nav-item-label w-0 h-0 overflow-hidden px-4 font-bold"
      >
        {{ $t("navigation.log-in") }}
      </span>
    </div>

    <div
      class="flex flex-row items-center hover:text-accent-accent cursor-pointer"
    >
      <unicon
        v-if="auth.isAuthenticated.value === true"
        @click="performLogout"
        :name="Unicons.SignOut.name"
        height="20"
        class="mt-1"
      />
      <span
        v-if="auth.isAuthenticated.value === true"
        @click="performLogout"
        class="nav-item-label w-0 h-0 overflow-hidden px-4 font-bold"
      >
        {{ $t("navigation.log-out") }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from "session-vue-3-oidc-library";
import { Unicons } from "@/types";
import { useRoute } from "vue-router";
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
