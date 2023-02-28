<template>

<div
  v-show="props.menuitem?.isLoggedIn ? auth.isAuthenticated.value : true"
    @click="handleClick"
    class="flex flex-row items-center menu-item ml-3"
    :class="{ IsActive: isActive }">
    <unicon v-if="icon" :name="Unicons[icon].name" height="18"/>
    <span class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold">
      {{ props.menuitem?.label }}
    </span>
  </div>
  <div v-for="submenuItem in submenu" :key="submenuItem.label"> 
    <MenuSubItem :linkType="submenuItem.linkType" :labelName="submenuItem.label" :destination="submenuItem.destination" :show="showdropdown"/>
  </div>

</template>

<script lang="ts" setup>
import { ref, defineProps, PropType, watch } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useRouter } from "vue-router";
import MenuSubItem from "./MenuSubItem.vue";
import { Unicons } from "@/types";
import type { DamsIcons } from "../types";
import { MenuLinkType, MenuItem } from "@/generated-types/queries";
import useMenuHelper from "@/composables/useMenuHelper";
const { checkIfRouteOrModal, showdropdown, isActive, toggleDropDown } =
  useMenuHelper();
const router = useRouter();
const auth = useAuth();
const submenu = ref<Array<MenuItem>>([]);
const props = defineProps({
  menuitem: Object as PropType<MenuItem>,
  subMenu: { type: Object, default: null },
  icon: { type: Object as PropType<DamsIcons> },
});

const handleClick = () => {
  // Set isActive to true when the menu item is clicked
  isActive.value = true;
  // Set isActive to false for other menu items
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    if (item !== event.currentTarget) {
      item.classList.remove('IsActive');
    }
  });
  checkIfRouteOrModal(props.menuitem);
  toggleDropDown();
};

const handleSubMenu = () => {
  if (props.subMenu) {
    for (const key in props.subMenu) {
      if (
        props.subMenu[key].linkType === MenuLinkType.Route ||
        props.subMenu[key].linkType === MenuLinkType.Modal
      ) {
        submenu.value.push(props.subMenu[key]);
      }
    }
  }
}
watch(
  () => router.currentRoute.value.path,
  (newValue) => {
    if (newValue === `/${props.menuitem?.destination}`) {
      isActive.value = true;
    } else {
      isActive.value = false;
    }
  },
  { immediate: true }
);
handleSubMenu();

</script>

<style>
</style>