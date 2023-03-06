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
    <LogInLogout/>
  </nav>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import {GetMenuDocument,GetMenuQuery,GetMenuQueryVariables,MenuLinkType,type menuItem} from "@/generated-types/queries";
import Menuitem from "@/components/menu/MenuItem.vue";
import { useQuery } from "@vue/apollo-composable";
import LogInLogout from "@/components/LogInLogout.vue";

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
  const menu = value.data.Menu?.menu;
  for (const key in menu) {
    if (menu.hasOwnProperty(key)) {
      if (
        menu[key].linkType === MenuLinkType.Route ||
        menu[key].linkType === MenuLinkType.Modal
      ) {
        menuItems.value.push(menu[key]);
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
