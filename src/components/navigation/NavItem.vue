<template>
  <li
    data-cy="menu-item"
    :data-flyout-open="(isGroup && open && !expanded) || undefined"
  >
    <BaseTooltip position="right" :tooltip-offset="24" :show-delay="0">
      <template #activator="{ on }">
        <component
          ref="triggerRef"
          v-on="on"
          :is="isLink ? 'router-link' : 'button'"
          :to="isLink ? action!.action : undefined"
          :type="isLink ? undefined : 'button'"
          :aria-current="isLink && current ? 'page' : undefined"
          :aria-expanded="isGroup ? open : undefined"
          :aria-controls="isGroup ? listId : undefined"
          :class="rowClass"
          @click="onClick"
        >
          <unicon
            v-if="uniconIcon"
            :name="uniconIcon.name"
            height="18"
            aria-hidden="true"
          />
          <CustomIcon
            v-else
            :icon="item.icon"
            :size="24"
            color="current"
            aria-hidden="true"
          />
          <span
            data-test="nav-label"
            :class="expanded ? 'flex-1 truncate' : 'sr-only'"
          >
            {{ label }}
          </span>
          <MenuBadge
            :count="badgeCount"
            :class="{ 'absolute -top-1 -right-2': !expanded }"
          />
          <unicon
            v-if="isGroup && expanded"
            :name="open ? Unicons.AngleDown.name : Unicons.AngleRight.name"
            height="20"
            aria-hidden="true"
          />
        </component>
      </template>
      <template v-if="!expanded && !open" #default>{{ label }}</template>
    </BaseTooltip>
    <ul
      v-if="isGroup && open && expanded"
      :id="listId"
      class="flex flex-col gap-1 mt-1 ml-(--nav-sub-item-indent)"
    >
      <NavSubItem
        v-for="subItem in subItems"
        :key="subItem.label"
        :item="subItem"
      />
    </ul>
    <div
      v-if="isGroup && open && !expanded"
      ref="flyoutRef"
      data-cy="nav-flyout"
      :id="listId"
      :style="floatingStyles"
      class="w-max min-w-(--menu-min-width) p-(--menu-padding) bg-surface border border-border-subtle rounded-card shadow-overlay z-context-menu"
    >
      <component
        :is="groupUrl ? 'router-link' : 'p'"
        data-test="nav-flyout-title"
        :to="groupUrl"
        :class="[
          'block px-2 pt-1 pb-2 text-hint font-semibold text-text-secondary',
          { 'hover:text-text-link hover:no-underline': groupUrl },
        ]"
        @click="groupUrl && emit('close')"
      >
        {{ label }}
      </component>
      <ul class="flex flex-col gap-1" @click="emit('close')">
        <NavSubItem
          v-for="subItem in subItems"
          :key="subItem.label"
          :item="subItem"
        />
      </ul>
    </div>
  </li>
</template>

<script lang="ts" setup>
import { computed, useId, useTemplateRef } from "vue";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { MenuItem } from "@/generated-types/queries";
import useMenuHelper, { MenuItemType } from "@/composables/useMenuHelper";
import { useMenuBadges } from "@/composables/useMenuBadges";
import { useNavMenu } from "@/composables/useNavMenu";
import { Unicons } from "@/types";
import { readCssToken } from "@/utils/cssToken";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import CustomIcon from "@/components/CustomIcon.vue";
import MenuBadge from "@/components/menu/MenuBadge.vue";
import NavSubItem from "@/components/navigation/NavSubItem.vue";

const props = defineProps<{
  item: MenuItem;
  expanded: boolean;
  open: boolean;
}>();
const emit = defineEmits<{ toggle: []; close: [] }>();

const { t } = useI18n();
const router = useRouter();
const { checkIfRouteOrModal, getUrlForMenuItem } = useMenuHelper();
const { totalBadgeCountOf } = useMenuBadges();
const { isCurrent, subItemsOf } = useNavMenu();
const tokenPx = (name: string) => parseFloat(readCssToken(name, "0"));
const listId = useId();
const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const flyoutRef = useTemplateRef<HTMLElement>("flyoutRef");
const { floatingStyles } = useFloating(triggerRef, flyoutRef, {
  placement: "right-start",
  strategy: "fixed",
  middleware: [
    offset(
      () =>
        (tokenPx("--nav-rail-width") - tokenPx("--nav-rail-item-width")) / 2 +
        tokenPx("--nav-flyout-gap"),
    ),
    flip(),
    shift(() => ({ padding: tokenPx("--nav-flyout-viewport-margin") })),
  ],
  whileElementsMounted: autoUpdate,
});

const label = computed(() => t(props.item.label ?? ""));
const subItems = computed(() => subItemsOf(props.item));
const isGroup = computed(() => !!props.item.subMenu);
const action = computed(() =>
  isGroup.value ? undefined : checkIfRouteOrModal(props.item),
);
const groupUrl = computed(() => {
  const destination = props.item.typeLink?.route?.destination;
  const isSubItemPage = subItems.value.some(
    (subItem) => subItem.typeLink?.route?.destination === destination,
  );
  return isGroup.value && destination && !isSubItemPage
    ? getUrlForMenuItem(destination)
    : undefined;
});
const isLink = computed(() => action.value?.menuItemType === MenuItemType.link);
const current = computed(() => isCurrent(props.item));
const badgeCount = computed(() => totalBadgeCountOf(props.item));
const uniconIcon = computed(() =>
  props.item.icon ? Unicons[props.item.icon] : undefined,
);

const onClick = () => {
  if (isGroup.value) {
    if (props.expanded && !props.open && groupUrl.value)
      router.push(groupUrl.value);
    emit("toggle");
  }
  else if (!isLink.value) action.value?.action();
};

const rowClass = computed(() => [
  "relative flex items-center rounded-(--nav-rail-item-radius) text-left text-table hover:no-underline",
  props.expanded
    ? "w-full min-h-(--nav-rail-item-height) px-2 gap-2"
    : "justify-center w-(--nav-rail-item-width) h-(--nav-rail-item-height)",
  current.value
    ? "bg-accent-light text-accent-ink"
    : "text-text-muted hover:bg-accent-highlight",
]);
</script>
