<template>
  <div class="flex justify-between items-center">
    <a
      @click="clicked()"
      :class="
        (disable
          ? 'opacity-40 cursor-default'
          : 'hover:bg-neutral-50 cursor-pointer') +
        (highlight ? 'text-neutral-900 bg-blue-50' : '')
      "
      class="text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
      role="menuitem"
      tabindex="-1"
      id="menu-item-add"
    >
      <BaseIcon v-if="icon" class="w-6 h-6 cursor-pointer" :name="icon" />
      {{ label }}
    </a>

    <div
      v-if="disable && tooltipLabel"
      class="mr-3"
    >
      <base-tooltip position="top-right" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <template #default>
          <span class="text-sm text-text-placeholder">
            <div>
              {{ t(tooltipLabel) }}
            </div>
          </span>
        </template>
      </base-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue";
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["clicked"]);

const props = withDefaults(
  defineProps<{
    icon?: string;
    label?: string;
    tooltipLabel?: string;
    disable?: boolean;
    highlight?: boolean;
  }>(),
  {
    icon: () => {
      return "";
    },
    label: () => {
      return "no-label";
    },
    highlight: () => {
      return false;
    },
    disable: () => {
      return false;
    },
  }
);

const clicked = () => {
  if (!props.disable) {
    emit("clicked");
  }
};
</script>
