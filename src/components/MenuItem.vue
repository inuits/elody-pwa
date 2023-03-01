<template>
  <div>
<div
  v-show="props.menuitem?.isLoggedIn ? auth.isAuthenticated.value : true"
    @click="handleClick"
    class="flex flex-row items-center menu-item ml-3"
    :class="{ IsActive: menuitem && isMenuItemActive(menuitem) }">
    <unicon v-if="icon" :name="Unicons[icon].name" height="18"/>
    <span class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold">
      {{ props.menuitem?.label }}
    </span>
  </div>
  <div v-for="(submenuItem) in submenu" :key="submenuItem.label" class="dropdownMenu-item">
    <MenuSubItem
      :linkType="submenuItem.linkType"
      :labelName="submenuItem.label"
      :destination="submenuItem.destination"
      :show="showdropdown"
    />
  </div>
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
import { uploadModalState } from "@/composables/useUploadModal";
import { useCreateModal } from "@/components/CreateModal.vue";
const { checkIfRouteOrModal, showdropdown, toggleDropDown, isMenuItemActive, selectedMenuItem, resetSelectedMenuItem } = useMenuHelper();
const router = useRouter();
const auth = useAuth();
const submenu = ref<Array<MenuItem>>([]);
const { openCreateModal, closeCreateModal,createModalState } = useCreateModal();
const props = defineProps({
  menuitem: Object as PropType<MenuItem>,
  subMenu: { type: Object, default: null },
  icon: { type: Object as PropType<DamsIcons> },
});

const handleClick = () => {
  checkIfRouteOrModal(props.menuitem);
  toggleDropDown();
  if(props.menuitem){
    selectedMenuItem.value = props.menuitem?.destination;
  }
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
  () => uploadModalState.value.state,
  (newValue) => {
    if (newValue === `hide`) {
      resetSelectedMenuItem()
    } 
  }
);

watch(
  () => createModalState.value.state,
  (newValue) => {
    if (newValue === 'hide') {
      resetSelectedMenuItem()
    } 
  }
);

handleSubMenu();
</script>
<style>
.IsActive {
  fill: #02c6f2;
  color: #02c6f2;
  
  border-radius: 8px;
  height: 2.3rem;
}
.navbar:hover .IsActive{
  background-color: var(--color-neutral-40);
}
</style>