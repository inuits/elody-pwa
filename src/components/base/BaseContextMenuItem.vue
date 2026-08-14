<template>
  <div class="flex justify-between items-center">
    <component
      :is="asButton ? BaseButtonNew : 'a'"
      :label="label"
      @click="clicked()"
      :class="[
        !asButton
          ? 'text-text-body block px-2.5 py-1.5 text-table rounded-md flex items-center gap-2 w-full hover:bg-accent-wash cursor-pointer'
          : '',
        disable ? 'opacity-40 cursor-default' : '',
        highlight ? 'text-text-body bg-accent-wash' : '',
      ]"
      id="menu-item-add"
      v-bind="
        asButton
          ? {
              buttonStyle: 'accentAccent',
              buttonSize: 'small',
              disabled: disable,
            }
          : {
              role: 'menuitem',
              // Disabled items stay focusable so their reason is reachable.
              tabindex: 0,
              'aria-disabled': disable ? 'true' : undefined,
            }
      "
    >
      <BaseIcon v-if="icon" class="w-3.5 h-3.5 cursor-pointer" :name="icon" />
      {{ label }}
    </component>

    <div v-if="disable && tooltipLabel" class="mr-3">
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
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
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
    asButton?: boolean;
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
  },
);

const clicked = () => {
  if (!props.disable) {
    emit("clicked");
  }
};
</script>
