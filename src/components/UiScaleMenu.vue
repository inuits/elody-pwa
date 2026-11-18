<template>
  <div>
    <BaseTooltip position="bottom" :tooltip-offset="8" :show-delay="0">
      <template #activator="{ on, describedBy }">
        <button
          v-on="on"
          type="button"
          data-cy="ui-scale"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
          :aria-describedby="describedBy"
          :aria-label="isExpanded ? undefined : t('navigation.display-size')"
          :class="buttonClasses"
          @click.stop.prevent="toggle"
          @keydown.down.prevent="open"
        >
          <unicon
            name="font"
            :height="isExpanded ? 20 : 18"
            aria-hidden="true"
          />
          <span v-if="isExpanded">{{ t("navigation.display-size") }}</span>
        </button>
      </template>
      <template v-if="!isExpanded" #default>
        {{ t("navigation.display-size") }}
      </template>
    </BaseTooltip>
    <BaseContextMenu :context-menu="menu.getContextMenu()">
      <BaseContextMenuItem
        :label="
          t('navigation.display-size-auto', { percent: percent(autoScale()) })
        "
        :highlight="choice === null"
        @clicked="choose(null)"
      />
      <BaseContextMenuItem
        v-for="scale in UI_SCALES"
        :key="scale"
        :label="percent(scale)"
        :highlight="choice === scale"
        @clicked="choose(scale)"
      />
    </BaseContextMenu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import { UI_SCALES, useUiScale } from "@/composables/useUiScale";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";

const props = defineProps<{ isExpanded?: boolean }>();

const { t } = useI18n();
const { choice, autoScale, setUiScale } = useUiScale();
const menu = ref(new ContextMenuHandler());
const isOpen = computed(() => menu.value.getContextMenu()?.isVisible ?? false);

const buttonClasses = computed(() => [
  "flex items-center rounded-(--nav-rail-item-radius) text-text-muted cursor-pointer hover:bg-accent-highlight",
  props.isExpanded
    ? "w-full min-h-(--nav-rail-item-height) px-2 gap-2 text-table"
    : "justify-center shrink-0 size-(--control-height)",
]);

const percent = (scale: number) => `${Math.round(scale * 100)}%`;

const open = (event: Event) =>
  menu.value.openContextMenu(
    { x: 0, y: 0 },
    event.currentTarget as HTMLElement,
  );

const toggle = (event: Event) => {
  if (isOpen.value) menu.value.closeContextMenu();
  else open(event);
};

const choose = (scale: number | null) => {
  setUiScale(scale);
  menu.value.closeContextMenu();
};
</script>
