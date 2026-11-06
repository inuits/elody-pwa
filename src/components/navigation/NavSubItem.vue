<template>
  <li data-cy="menu-sub-item">
    <RouterLink
      v-if="action?.menuItemType === MenuItemType.link"
      :to="action.action as string"
      :aria-current="current ? 'page' : undefined"
      :class="rowClass"
    >
      <span class="flex-1">{{ t(item.label ?? "") }}</span>
      <MenuBadge :count="badgeCount" />
    </RouterLink>
    <button
      v-else-if="action"
      type="button"
      :class="rowClass"
      @click="action.action()"
    >
      <span class="flex-1">{{ t(item.label ?? "") }}</span>
      <MenuBadge :count="badgeCount" />
      <unicon :name="Unicons.Plus.name" height="12" aria-hidden="true" />
    </button>
  </li>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { MenuItem } from "@/generated-types/queries";
import useMenuHelper, { MenuItemType } from "@/composables/useMenuHelper";
import { useMenuBadges } from "@/composables/useMenuBadges";
import { useNavMenu } from "@/composables/useNavMenu";
import { Unicons } from "@/types";
import MenuBadge from "@/components/menu/MenuBadge.vue";

const props = defineProps<{ item: MenuItem }>();

const { t } = useI18n();
const { checkIfRouteOrModal } = useMenuHelper();
const { badgeCountOf } = useMenuBadges();
const { isCurrent } = useNavMenu();

const action = computed(() => checkIfRouteOrModal(props.item));
const current = computed(() => isCurrent(props.item));
const badgeCount = computed(() => badgeCountOf(props.item));

const rowClass = computed(() => [
  "flex w-full items-center gap-2 min-h-(--nav-rail-item-height) px-2 rounded-(--nav-rail-item-radius) text-left text-table hover:no-underline",
  current.value
    ? "bg-accent-light text-accent-ink"
    : "text-text-muted hover:bg-accent-highlight",
]);
</script>
