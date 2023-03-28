<template>
  <div>
    <div
      v-show="menuitem?.isLoggedIn ? auth.isAuthenticated.value : true"
      @click="handleClick"
      class="flex flex-row items-center ml-3 h-9 hover:text-accent-normal mt-3"
      :class="{
        'IsActive text-accent-normal rounded-lg':
          menuitem && isMenuItemActive(menuitem),
      }"
    >
      <unicon v-if="icon" :name="Unicons[icon].name" height="18" />
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
      >
        {{ menuitem?.label }}
      </span>
      <div v-if="menuitem.subMenu">
        <unicon
          v-if="showdropdown"
          @click="handleClick"
          :name="Unicons.AngleDown.name"
          height="20"
          class="ml-[7rem] mt-1"
        />
        <unicon
          v-if="showdropdown === false"
          @click="handleClick"
          :name="Unicons.AngleDown.name"
          height="20"
          class="rotate-180 ml-[7rem] mt-1"
        />
      </div>
    </div>
    <div
      v-for="submenuItem in menuSubitem"
      :key="submenuItem.label"
      :class="{ dropdownMenuItem: showdropdown }"
    >
      <MenuSubItem
        :typeLink="submenuItem.typeLink.route.destination"
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
import MenuSubItem from "@/components/menu/MenuSubItem.vue";
import { Unicons, DamsIcons } from "@/types";
import { MenuItem, TypeModals, ModalState } from "@/generated-types/queries";
import useMenuHelper from "@/composables/useMenuHelper";
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
const { getModal } = useAvailableModals();

const props = defineProps<{
  menuitem: MenuItem;
  subMenu: MenuItem;
  icon: DamsIcons;
}>();

const handleClick = () => {
  checkIfRouteOrModal(props.menuitem);
  toggleDropDown();
  if (props.menuitem) {
    const menu = props.menuitem;
    selectedMenuItem.value =
      menu.typeLink.route?.destination || menu.typeLink.modal?.typeModal;
  }
};

const handleSubMenu = () => {
  const submenu = props.subMenu;
  if (props.subMenu) {
    menuSubitem.value = Object.values(submenu).filter(
      (menu: MenuItem) => menu.typeLink
    );
  }
};

watch(
  () =>
    getModal(props.menuitem.typeLink.modal?.typeModal as TypeModals).modalState
      .value.state,
  (state) => {
    if (state === ModalState.Hide) {
      resetSelectedMenuItem();
    }
  }
);
handleSubMenu();
</script>
<style>
.navbar:hover .IsActive {
  background-color: var(--color-neutral-40);
}
.dropdownMenuItem {
  animation-name: dropdown;
  animation-duration: 1s;
  animation-timing-function: ease-in;
}
@keyframes dropdown {
  25% {
    margin-top: -0.25rem;
    opacity: 0.25;
  }
  50% {
    margin-top: 0rem;
    opacity: 0.5;
  }
  75% {
    margin-top: 0.16rem;
    opacity: 0.75;
  }
  100% {
    margin-top: 0.25rem;
    opacity: 1;
  }
}
</style>
