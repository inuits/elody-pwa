<template>
  <div class="flex flex-row items-center menu-item fixed bottom-8">
    <unicon
      v-if="auth.isAuthenticated.value === false"
      @click="auth.redirectToLogin()"
      :name="Unicons.UserCircle.name"
      height="21"
      class="mt-1 menu-btn ml-4"
    />
    <span
      v-if="auth.isAuthenticated.value === false"
      @click="auth.redirectToLogin()"
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
    >
      {{ $t("navigation.log-in") }}
    </span>
  </div>

  <div class="flex flex-row items-center menu-item fixed bottom-8 left-3">
    <unicon
      v-if="auth.isAuthenticated.value === true"
      @click="auth.logout()"
      :name="Unicons.SignOut.name"
      height="20"
      class="mt-1 menu-btn ml-4"
    />
    <span
      v-if="auth.isAuthenticated.value === true"
      @click="auth.logout()"
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
    >
      {{ $t("navigation.log-out") }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from "session-vue-3-oidc-library";
import { usePermissions } from "@/composables/usePermissions";
import { Unicons } from "@/types";
const auth = useAuth();
const { determinePermission, loading } = usePermissions();
</script>

<style>
</style>