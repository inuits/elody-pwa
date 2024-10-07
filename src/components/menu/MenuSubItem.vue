<template>
  <component
    data-cy="menu-sub-item"
    v-if="isPermitted && show"
    :is="linkTag"
    :class="[
      'flex flex-column justify-between items-center cursor-pointer ml-9 mt-1 origin-top-center hover:text-accent-accent',
      { 'text-accent-accent': isActive },
    ]"
    :to="isLink ? menuAction.action : undefined"
    @click="((event: Event) => handleClick(event, menuAction))"
  >
    <p class="overflow-hidden px-4 cursor-pointer">
      {{ t(subMenuItem.label || "") }}
    </p>
    <unicon v-if="!isLink" :name="Unicons.Plus.name" height="10" />
  </component>
</template>

<script lang="ts" setup>
import { computed, type PropType } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import useMenuHelper, { MenuItemType } from "@/composables/useMenuHelper";
import { usePermissions } from "@/composables/usePermissions";
import { Permission, type MenuItem } from "@/generated-types/queries";
import { ref, onMounted } from "vue";
import { Unicons } from "@/types";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  subMenuItem: { type: Object as PropType<MenuItem>, required: true },
});
const { t } = useI18n();
const route = useRoute();
const { can, fetchAdvancedPermission } = usePermissions();
const isActive = computed(
  () =>
    route.path.replace("/", "") ===
    (props.subMenuItem?.typeLink?.route?.destination as string)
);
const { checkIfRouteOrModal } = useMenuHelper();
const menuAction = computed(() => checkIfRouteOrModal(props.subMenuItem));
const isLink = computed(
  () => menuAction.value?.menuItemType === MenuItemType.link
);
const linkTag = computed(() => (isLink.value ? "router-link" : "div"));
const isPermitted = ref<boolean>(false);

onMounted(async () => {
  await checkPermissions();
});

const checkAdvancedPermission = async () => {
  if (!props.subMenuItem.can || props.subMenuItem.can.length === 0)
    return false;
  const result = await fetchAdvancedPermission(props.subMenuItem.can);
  return result;
};

const handleClick = (event: Event, menuAction: any) => {
  if (!isLink.value && menuAction?.action) {
    event.stopPropagation();
    menuAction.action();
  }
};

const checkPermissions = async () => {
  let canDoAction = false;

  if (props.subMenuItem.requiresAuth === false) {
    canDoAction = true;
  }
  if (props.subMenuItem.can) {
    canDoAction = await checkAdvancedPermission();
  } else {
    canDoAction =
      can(
        props.subMenuItem.typeLink?.modal?.neededPermission ||
          Permission.Canread,
        props.subMenuItem.entityType
      ) || false;
  }

  isPermitted.value = canDoAction;
};
</script>
<style></style>
