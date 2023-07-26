<template>
  <div>
    <div
      v-show="menuitem?.isLoggedIn ? auth.isAuthenticated.value : true"
      @click="handleClick"
      class="flex flex-row items-center pl-3 h-9 mt-3 cursor-pointer"
      :class="[{ 'bg-neutral-40 rounded-lg': isBeingHovered }]"
    >
      <unicon
        v-if="icon && Unicons[icon]"
        :name="Unicons[icon].name"
        height="18"
      />
      <CustomIcon v-else :icon="icon" :size="24" :color="iconColor" />
      <span class="nav-item-label w-0 h-0 overflow-hidden px-4 font-bold">
        {{ menuitem?.label }}
      </span>
      <div class="w-full flex justify-end align-center" v-if="menuitem.subMenu">
        <unicon
          v-if="showdropdown"
          @click="handleClick"
          :name="Unicons.AngleDown.name"
          height="20"
        />
        <unicon
          v-if="!showdropdown"
          @click="handleClick"
          :name="Unicons.AngleRight.name"
          height="20"
        />
      </div>
    </div>
    <div
      v-for="submenuItem in menuSubitem"
      :key="submenuItem.label"
      :class="{ dropdownMenuItem: showdropdown }"
    >
      <MenuSubItem
        @click="setSelectedMenuItem(menuitem)"
        :typeLink="submenuItem?.typeLink?.route?.destination"
        :labelName="submenuItem.label"
        :destination="submenuItem?.typeLink?.route?.destination"
        :show="showdropdown"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, watch, computed } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import MenuSubItem from "@/components/menu/MenuSubItem.vue";
import { Unicons } from "@/types";
import {
  type MenuItem,
  ModalState,
  DamsIcons,
} from "@/generated-types/queries";
import useMenuHelper from "@/composables/useMenuHelper";
import { useAvailableModals } from "@/composables/useAvailableModals";
import CustomIcon from "../CustomIcon.vue";
const {
  checkIfRouteOrModal,
  showdropdown,
  toggleDropDown,
  resetSelectedMenuItem,
  setSelectedMenuItem,
  selectedMenuItem,
} = useMenuHelper();

const auth = useAuth();
const menuSubitem = ref<Array<MenuItem>>([]);
const { getModal } = useAvailableModals();

const props = defineProps<{
  menuitem: MenuItem;
  icon: DamsIcons;
  isExpanded: Boolean;
  isBeingHovered: Boolean;
}>();

const handleClick = () => {
  setSelectedMenuItem(props.menuitem);
  checkIfRouteOrModal(props.menuitem);
  toggleDropDown();
};

const isActive = computed(() => props.menuitem === selectedMenuItem.value);
const iconColor = computed(() =>
  isActive.value ? "accent-normal" : "text-body"
);

const handleSubMenu = () => {
  const submenu = props.menuitem.subMenu;
  if (submenu) {
    menuSubitem.value = Object.values(submenu).filter(
      (menu: MenuItem) => menu.typeLink
    );
  }
};

watch(
  () => {
    const typeModal = props.menuitem.typeLink?.modal?.typeModal;
    if (!typeModal) return undefined;
    return getModal(typeModal).modalState.value.state;
  },
  (state) => {
    if (state === ModalState.Hide) {
      resetSelectedMenuItem();
    }
  }
);
handleSubMenu();
</script>
<style>
.dropdownMenuItem {
  animation-name: dropdown;
  animation-duration: 1s;
  animation-timing-function: ease-out;
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
