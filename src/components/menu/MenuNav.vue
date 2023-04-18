<template>
  <nav
    class="navbar fixed left-0 top-0 w-24 h-screen flex flex-col justify-start align-center pt-10 bg-neutral-white px-5 z-50"
  >
    <router-link
      :to="{ name: 'Home' }"
      class="logo h-12 ml-3 mt-4 text-neutral-700 font-semibold mb-8 text-xl"
    >
      {{ $t("navigation.title") }}
    </router-link>

    <div v-for="menuItem in menuItems" :key="menuItem.label">
      <Menuitem
        :icon="menuItem.icon"
        :menuitem="menuItem"
        :subMenu="menuItem.subMenu"
      />
    </div>
    <LogInLogout />
  </nav>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import {
  GetMenuDocument,
  type GetMenuQuery,
  type GetMenuQueryVariables,
  type MenuItem,
} from "@/generated-types/queries";
import Menuitem from "@/components/menu/MenuItem.vue";
import { useQuery } from "@vue/apollo-composable";
import LogInLogout from "@/components/LogInLogout.vue";

const router = useRouter();
const menuItems = ref<Array<MenuItem>>([]);
const queryVariables = reactive<GetMenuQueryVariables>({ name: "main-menu" });
const { result: menuQueryResult, onResult } = useQuery<GetMenuQuery>(
  GetMenuDocument,
  queryVariables
);
onResult((value) => {
  menuItems.value = Object.values(value.data.Menu?.menu || {}).filter(
    (menu) => menu.typeLink
  );
});
</script>

<style>
.navbar {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  overflow-x: hidden;
}
.navbar:hover {
  width: 20rem;
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
