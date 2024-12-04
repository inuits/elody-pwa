<template>
  <div data-cy="menu-item">
    <component
      v-show="showMenuItem"
      data-test="menu-item-component"
      :is="linkTag"
      :to="isLink ? menuAction.action : undefined"
      @click="!isLink && menuAction?.action ? menuAction.action() : undefined"
      class="flex flex-row items-center pl-4 min-h-9 mt-3 cursor-pointer hover:bg-neutral-40 hover:rounded-lg"
      :class="[
        {
          'bg-neutral-40 rounded-lg': isBeingHovered,
          'text-accent-accent': isActiveParentOrSubmenu,
        },
      ]"
    >
      <base-tooltip v-if="!isExpanded" position="right" :tooltip-offset="24">
        <template #activator="{ on }">
          <div
            v-on="on"
            :class="icon && Unicons[icon] ? 'h-[18px]' : 'h-[24px]'"
          >
            <unicon
              v-if="icon && Unicons[icon]"
              v-on="on"
              :name="Unicons[icon].name"
              height="18"
            />
            <CustomIcon v-else :icon="icon" :size="24" :color="iconColor" />
          </div>
        </template>
        <template #default>
          <span class="text-sm w-max font-bold">
            <div class="w-max">
              {{ t(menuitem?.label) }}
            </div>
          </span>
        </template>
      </base-tooltip>

      <unicon
        v-if="icon && Unicons[icon] && isExpanded"
        :name="Unicons[icon].name"
        height="18"
      />
      <CustomIcon
        v-if="icon && !Unicons[icon] && isExpanded"
        :icon="icon"
        :size="24"
        :color="iconColor"
      />
      <div
        v-show="isExpanded"
        class="w-full grid grid-cols-[1fr_auto] items-center"
      >
        <span class="w-100 px-4 font-bold">
          {{ t(menuitem?.label) }}
        </span>
        <div
          class="w-full flex justify-end align-center"
          v-show="menuitem.subMenu"
        >
          <unicon
            v-if="isBeingHovered"
            :name="Unicons.AngleDown.name"
            height="20"
          />
          <unicon v-else :name="Unicons.AngleRight.name" height="20" />
        </div>
      </div>
    </component>
    <transition-group v-show="isExpanded && showMenuItem">
      <div v-for="submenuItem in menuSubitem" :key="submenuItem.label">
        <MenuSubItem
          @click="setSelectedMenuItem(menuitem)"
          :subMenuItem="submenuItem"
          :show="isBeingHovered as boolean"
          @isActive="(isActiveChild: boolean) => isActiveChild = isActiveChild"
        />
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import {
  Entitytyping,
  type DamsIcons,
  type MenuItem,
} from "@/generated-types/queries";
import CustomIcon from "../CustomIcon.vue";
import MenuSubItem from "@/components/menu/MenuSubItem.vue";
import useMenuHelper, { MenuItemType } from "@/composables/useMenuHelper";
import { computed, onMounted, ref } from "vue";
import { Permission } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { auth } from "@/main";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  ignorePermissions,
  permittedEntitiesToCreate,
  usePermissions,
} from "@/composables/usePermissions";
import BaseTooltip from "@/components/base/BaseTooltip.vue";

const { checkIfRouteOrModal, setSelectedMenuItem, selectedMenuItem } =
  useMenuHelper();
const { t } = useI18n();
const { can, fetchAdvancedPermission } = usePermissions();

const menuSubitem = ref<Array<MenuItem>>([]);
const menuAction = computed(() => checkIfRouteOrModal(props.menuitem));
const isLink = computed(
  () => menuAction.value?.menuItemType === MenuItemType.link
);
const hasPermissionForMenuItem = ref<boolean>(ignorePermissions.value);
const linkTag = computed(() => (isLink.value ? "router-link" : "div"));
const route = useRoute();

const props = defineProps<{
  menuitem: MenuItem;
  icon: DamsIcons;
  isExpanded: Boolean;
  isBeingHovered: Boolean;
}>();

const isActive = computed(() => props.menuitem === selectedMenuItem.value);
const showMenuItem = computed(() => {
  return (
    (props.menuitem?.isLoggedIn ? auth.isAuthenticated.value : true) &&
    hasPermissionForMenuItem.value
  );
});
const iconColor = computed(() =>
  isActive.value ? "accent-normal" : "text-body"
);
const isActiveParentOrSubmenu = computed(() => {
  const routePath = route.path.substring(route.path.lastIndexOf("/") + 1);
  const isMenuActive =
    routePath === (props.menuitem.typeLink?.route?.destination as string);
  const isSubmenuActive = menuSubitem.value.some((subMenuItem: MenuItem) => {
    return routePath === (subMenuItem.typeLink?.route?.destination as string);
  });

  return isMenuActive || isSubmenuActive;
});

const handleSubMenu = () => {
  const submenu = props.menuitem.subMenu;
  if (submenu) {
    menuSubitem.value = Object.values(submenu).filter(
      (menu: MenuItem) => menu.typeLink
    );
  }
};
handleSubMenu();

onMounted(async () => {
  let allowed = false;
  const neededPermission = props.menuitem.typeLink.modal
    ?.neededPermission as Permission;

  if (props.menuitem.requiresAuth === false) allowed = true;
  else if (neededPermission === Permission.Cancreate) {
    permittedEntitiesToCreate.value = [];
    Object.values(Entitytyping).forEach((entityType) => {
      if (can(Permission.Cancreate, entityType)) {
        allowed = true;
        permittedEntitiesToCreate.value.push(entityType);
      }
    });
  } else if (props.menuitem.entityType)
    allowed = allowed || can(Permission.Canread, props.menuitem.entityType);

  for (const item of menuSubitem.value) {
    if (item.requiresAuth === false) allowed = true;
    else if (item.typeLink?.modal?.neededPermission === Permission.Cancreate) {
      permittedEntitiesToCreate.value = [];
      Object.values(Entitytyping).forEach((entityType) => {
        if (can(Permission.Cancreate, entityType)) {
          allowed = true;
          permittedEntitiesToCreate.value.push(entityType);
        }
      });
    } else if (item.entityType)
      allowed = allowed || can(Permission.Canread, item.entityType);

    if (item.can && item.can?.length > 0) {
      allowed = await fetchAdvancedPermission(item.can);
    }

    if (allowed) break;
  }

  if (props.menuitem.can && props.menuitem.can?.length > 0) {
    allowed = await fetchAdvancedPermission(props.menuitem.can);
  }

  hasPermissionForMenuItem.value = allowed;
});
</script>

<style></style>
