<template>
  <nav
    class="navbar fixed left-0 top-0 w-24 h-screen flex flex-col justify-start align-center pt-10 bg-neutral-20 px-5 z-50"
    v-show="!loading">

    <router-link
      :to="{ name: 'Home' }"
      class="logo router-link text-base text-neutral-700 font-semibold flex justify-center items-center mb-8 text-xl">
      {{ $t("navigation.title") }}
    </router-link>

    <div v-for="menuItem in menuItems" :key="menuItem.label">
      <Menuitem :icon="menuItem.icon" :menuitem="menuItem" :subMenu="menuItem.subMenu"/>
    </div>

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
  </nav>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { Unicons } from "../types";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "session-vue-3-oidc-library";
import { usePermissions } from "../composables/usePermissions";
import {GetMenuDocument,GetMenuQuery,GetMenuQueryVariables,MenuLinkType,type menuItem} from "../generated-types/queries";
import Menuitem from "./MenuItem.vue";
import { useQuery } from "@vue/apollo-composable";


const auth = useAuth();
const { determinePermission, loading } = usePermissions();
const router = useRouter();
const menuItems = ref<Array<menuItem>>([]);
const queryVariables = reactive<GetMenuQueryVariables>({
  name: "main-menu",
});
const { result: menuQueryResult, onResult } = useQuery<GetMenuQuery>(
  GetMenuDocument,
  queryVariables
);

onResult((value) => {
  menuItems.value = [];
  for (const key in value.data.Menu?.menu) {
    if (value.data.Menu?.menu.hasOwnProperty(key)) {
      if (
        value.data.Menu?.menu[key].linkType === MenuLinkType.Route ||
        value.data.Menu?.menu[key].linkType === MenuLinkType.Modal
      ) {
        menuItems.value.push(value.data.Menu?.menu[key]);
      }
    }
  }
});
</script>
<style>
.navbar {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  overflow-x: hidden;
}
.navbar .menu-item {
  color: none;
}
.navbar:hover {
  width: 20rem;
}
.navbar:hover .menu-item {
}
.navbar:hover .router-link {
  justify-content: flex-start;
}
.navbar:hover .nav-item-label {
  animation: showText 0.1s ease-in 0.2s forwards;
  -moz-animation: showText 0.1s ease-in 0.2s forwards;
  -webkit-animation: showText 0.1s ease-in 0.2s forwards;
  -o-animation: showText 0.1s ease-in 0.2s forwards;
  animation-fill-mode: forwards;
}
@keyframes showText {
  100% {
    width: auto;
    height: auto;
  }
}
@-webkit-keyframes showText {
  100% {
    width: auto;
    height: auto;
  }
}
</style>
