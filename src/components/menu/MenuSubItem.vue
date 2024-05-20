<template>
  <component
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
import { computed, defineProps, type PropType } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import useMenuHelper, { MenuItemType } from "@/composables/useMenuHelper";
import { usePermissions } from "@/composables/usePermissions";
import { Permission, type MenuItem } from "@/generated-types/queries";
import { ref } from "vue";
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
const { can } = usePermissions();
const isActive = computed(
  () =>
    route.path.replace("/", "") ===
    (props.subMenuItem.typeLink?.route?.destination as string)
);
const { checkIfRouteOrModal } = useMenuHelper();
const menuAction = computed(() => checkIfRouteOrModal(props.subMenuItem));
const isLink = computed(
  () => menuAction.value?.menuItemType === MenuItemType.link
);
const linkTag = computed(() => (isLink.value ? "router-link" : "div"));
const isPermitted = ref<boolean>();

if (props.subMenuItem.requiresAuth === false) isPermitted.value = true;
else isPermitted.value = can(Permission.Canread, props.subMenuItem.entityType);

const handleClick = (event: Event, menuAction: any) => {
  if (!isLink.value && menuAction?.action) {
    event.stopPropagation();
    menuAction.action();
  }
};
</script>
<style></style>
