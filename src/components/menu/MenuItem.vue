<template>
  <div>
    <div
      v-show="
        (menuitem?.isLoggedIn ? auth.isAuthenticated.value : true) &&
        hasPermissionForMenuItem
      "
      @click="
        isLink
          ? router.push(menuAction.action)
          : (menuAction?.action as Function)()
      "
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
    <transition-group v-if="isExpanded">
      <div v-for="submenuItem in menuSubitem" :key="submenuItem.label">
        <MenuSubItem
          v-if="hasPermissionForMenuItem"
          @click="setSelectedMenuItem(menuitem)"
          :subMenuItem="submenuItem"
          :show="(isBeingHovered as boolean)"
        />
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref, watch } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import MenuSubItem from "@/components/menu/MenuSubItem.vue";
import { Unicons } from "@/types";
import { Permission } from "@/generated-types/queries";
import type { DamsIcons, MenuItem } from "@/generated-types/queries";
import useMenuHelper, { MenuItemType } from "@/composables/useMenuHelper";
import CustomIcon from "../CustomIcon.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  usePermissions,
  permissionsMappings,
} from "@/composables/usePermissions";

const { checkIfRouteOrModal, setSelectedMenuItem, selectedMenuItem } =
  useMenuHelper();
const { t } = useI18n();
const router = useRouter();
const { can } = usePermissions();

const auth = useAuth();
const menuSubitem = ref<Array<MenuItem>>([]);
const menuAction = computed(() => checkIfRouteOrModal(props.menuitem));
const isLink = computed(
  () => menuAction.value?.menuItemType === MenuItemType.link
);
const hasPermissionForMenuItem = ref<boolean>();

const props = defineProps<{
  menuitem: MenuItem;
  icon: DamsIcons;
  isExpanded: Boolean;
  isBeingHovered: Boolean;
}>();

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

watch(
  () => permissionsMappings.value.size,
  () => {
    if (props.menuitem.icon === "Create") {
      hasPermissionForMenuItem.value = can(Permission.Cancreate, undefined);
      return;
    }
    let allowed = false;
    menuSubitem.value.forEach((item) => {
      allowed = allowed || !!can(Permission.Canread, item.entityType);
    });
    hasPermissionForMenuItem.value = allowed;
  }
);
</script>

<style></style>
