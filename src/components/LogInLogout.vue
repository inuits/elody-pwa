<template>
      <div class="flex flex-row items-center menu-item fixed bottom-4">
      <BaseButtonNew
          v-if="auth.isAuthenticated.value === false"
          class="w-full"
          :label="$t('navigation.log-in')"
          icon="User"
          button-style="default"
          @click="auth.redirectToLogin()"
          :height=17
        />
    </div>

    <div class="flex flex-row items-center menu-item fixed bottom-4 left-3">
      <BaseButtonNew
          v-if="auth.isAuthenticated.value === true"
          class="w-full"
          :label="$t('navigation.log-out')"
          icon="SignOut"
          button-style="default"
          :height=17
          @click="auth.logout()"
        />
    </div>
</template>

<script lang="ts" setup>
    import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
    import { Unicons } from "../types";
    import { useAuth } from "session-vue-3-oidc-library";
import { usePermissions } from "@/composables/usePermissions";
    const auth = useAuth();
const { determinePermission, loading } = usePermissions();
</script>

<style>

</style>