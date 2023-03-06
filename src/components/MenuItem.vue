<template>
  <div>
    <div
      v-show="menuitem?.isLoggedIn ? auth.isAuthenticated.value : true"
      @click="handleClick"
      class="flex flex-row items-center menu-item ml-3"
      :class="{ IsActive: menuitem && isMenuItemActive(menuitem) }"
    >
      <unicon v-if="icon" :name="Unicons[icon].name" height="18" />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
      >
        {{ menuitem?.label }}
      </span>
    </div>
    <div
      v-for="submenuItem in menuSubitem"
      :key="submenuItem.label"
      class="dropdownMenu-item"
    >
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
import { ref, defineProps, watch } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useRouter } from "vue-router";
import MenuSubItem from "@/components/MenuSubItem.vue";
import { Unicons, DamsIcons } from "@/types";
import { MenuLinkType, MenuItem } from "@/generated-types/queries";
import useMenuHelper from "@/composables/useMenuHelper";
import { uploadModalState } from "@/composables/useUploadModal";
import { useAvailableModals } from "@/composables/useAvailableModals";

const {
  checkIfRouteOrModal,
  showdropdown,
  toggleDropDown,
  isMenuItemActive,
  selectedMenuItem,
  resetSelectedMenuItem,
} = useMenuHelper();
const router = useRouter();
const auth = useAuth();
const menuSubitem = ref<Array<MenuItem>>([]);
const { openModal, closeModal, modalState } =
  useAvailableModals();
const props = defineProps<{
  menuitem: MenuItem;
  subMenu: MenuItem;
  icon: DamsIcon;
}>();

const handleClick = () => {
  checkIfRouteOrModal(props.menuitem);
  toggleDropDown();
  if (props.menuitem) {
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
        menuSubitem.value.push(props.subMenu[key]);
      }
    }
  }
};
watch(
  () => uploadModalState.value.state,
  (state) => {
    if (state === `hide`) {
      resetSelectedMenuItem();
    }
  }
);

watch(
  () => modalState.value.state,
  (state) => {
    if (state === modalState.value.state) {
      resetSelectedMenuItem();
    }
  }
);

handleSubMenu();
</script>
<style>
.dropdownMenu-item {
  animation: dropdown 1ms ease-in-out forwards;
}
@keyframes dropdown {
  0% {
    margin-top: 0;
  }
  80% {
    margin-top: 0.1rem;
  }
  100% {
    margin-top: 0.3rem;
  }
}
.IsActive {
  fill: #02c6f2;
  color: #02c6f2;
  border-radius: 8px;
  height: 2.3rem;
}
.navbar:hover .IsActive {
  background-color: var(--color-neutral-40);
}
</style>