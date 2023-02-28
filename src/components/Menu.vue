<template>
  <nav
    class="navbar fixed left-0 top-0 w-24 h-screen flex flex-col justify-start align-center pt-10 bg-neutral-20 px-5 z-50"
    v-show="!loading">
    <router-link
      :to="{ name: 'Home' }"
      class="logo router-link text-base text-neutral-700 font-semibold flex justify-center items-center mb-8 text-xl"
      @click="forceDisableEditModalHome">
      {{ $t("navigation.title") }}
    </router-link> 
    <div v-for="menuItem in menuItems" :key="menuItem.label">
      <MenuitemS
       :linkType="menuItem.linkType"
       :destination="menuItem.destination"
       :labelname="menuItem.label"
       :icon="menuItem.icon"
       :subMenu="menuItem.subMenu"/>
    </div>
    <div class="flex flex-row items-center menu-item login-out">
      <BaseButton
        v-if="auth.isAuthenticated.value === false"
        :icon="Unicons.User.name"
        class="mt-1 menu-btn"
        @click="auth.redirectToLogin()"
        :icon-height="20"
        bg-color="var(--color-neutral)"/>
      <span
        v-if="auth.isAuthenticated.value === false"
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
        @click="auth.redirectToLogin()">
        {{ $t("navigation.log-in") }}
      </span>
    </div>
    
    <!-- Loguit -->
    <div class="flex flex-row items-center menu-item login-out">
      <BaseButton
        v-if="auth.isAuthenticated.value === true"
        :icon="Unicons.SignOut.name"
        :icon-height="20"
        class="mt-1 menu-btn"
        bg-color="var(--color-neutral)"
        @click="logout()"
      />
      <span
        v-if="auth.isAuthenticated.value === true"
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
        @click="auth.logout()"
      >
        {{ $t("navigation.log-out") }}</span>
    </div>
  </nav>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import BaseButton from "./base/BaseButton.vue";
import { Unicons } from "../types";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "session-vue-3-oidc-library";
import { usePermissions } from "../composables/usePermissions";
import {GetMenuDocument,GetMenuQuery,GetMenuQueryVariables,type MenuItem} from "../generated-types/queries";
import MenuitemS from "./MenuItem.vue";
import { useQuery } from "@vue/apollo-composable";
const auth = useAuth();
const { determinePermission, loading } = usePermissions();
const router = useRouter();
const showDropdown = ref(false);
const menuItems = ref<Array<MenuItem>>([]);
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
      //@ts-ignore
      console.log(
        `${key} LINK TYPE: ${JSON.stringify(value.data.Menu?.menu[key])}`
      );
      //@ts-ignore
      if (
        value.data.Menu?.menu[key].linkType === "route" ||
        value.data.Menu?.menu[key].linkType === "modal"
      ) {
        menuItems.value.push(value.data.Menu?.menu[key]);
        console.log(value.data.Menu?.menu.entities.subMenu);
      }
    }
  }
});
const forceDisableEditModalHome = () => {
  router.push({ name: "Home" });
  disableEditMode();
};
const logout = async () => {
  await auth.logout();
  showDropdown.value = false;
  console.log("Clicked on entities");
  router.push({ name: "Home" });
};
const toggleDropDown = () => {
  showDropdown.value = !showDropdown.value;
  console.log(showDropdown.value);
};
</script>
<style>
.navbar {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  overflow-x: hidden;
}
.navbar + .menu-item {
  background-color: none;
}
.navbar:hover {
  width: 20rem;
}
.navbar:hover .router-link {
  justify-content: flex-start;
}
.login-out {
  position: fixed;
  bottom: 3%;
  left: 1%;
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
