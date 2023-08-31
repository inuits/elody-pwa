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
      <div v-if="isExpanded" class="w-full flex">
        <span class="px-4 font-bold">
          {{ t(menuitem?.label) }}
        </span>
        <div
          class="w-full flex justify-end align-center"
          v-if="menuitem.subMenu"
        >
          <unicon
            v-if="isBeingHovered"
            :name="Unicons.AngleDown.name"
            height="20"
          />
          <unicon v-else :name="Unicons.AngleRight.name" height="20" />
        </div>
      </div>
    </div>
    <div
      v-for="submenuItem in menuSubitem"
      :key="submenuItem.label"
      :class="{ dropdownMenuItem: isBeingHovered }"
    >
      <MenuSubItem
        @click="setSelectedMenuItem(menuitem)"
        :subMenuItem="submenuItem"
        :show="(isBeingHovered as boolean)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, computed } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import MenuSubItem from "@/components/menu/MenuSubItem.vue";
import { Unicons } from "@/types";
import type { MenuItem, DamsIcons } from "@/generated-types/queries";
import useMenuHelper from "@/composables/useMenuHelper";
import CustomIcon from "../CustomIcon.vue";
import { useI18n } from "vue-i18n";

const { checkIfRouteOrModal, setSelectedMenuItem, selectedMenuItem } =
  useMenuHelper();
const { t } = useI18n();

const auth = useAuth();
const menuSubitem = ref<Array<MenuItem>>([]);

const props = defineProps<{
  menuitem: MenuItem;
  icon: DamsIcons;
  isExpanded: Boolean;
  isBeingHovered: Boolean;
}>();

const handleClick = () => {
  if (props.menuitem.typeLink?.route) {
    setSelectedMenuItem(props.menuitem);
  }
  checkIfRouteOrModal(props.menuitem);
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
    opacity: 0.25;
  }
  50% {
    opacity: 0.5;
  }
  75% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
}
</style>
