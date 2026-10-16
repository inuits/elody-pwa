<template>
  <div class="flex justify-between items-center">
    <component
      :is="asButton ? BaseButtonNew : 'a'"
      :label="label"
      @click="clicked()"
      :class="[
        !asButton
          ? 'flex items-center gap-(--menu-item-gap) w-full p-(--menu-item-padding) rounded-button leading-tight hover:no-underline'
          : '',
        !asButton && disable ? 'text-text-disabled cursor-default' : '',
        !asButton && !disable
          ? 'text-(color:--menu-item-ink) hover:bg-accent-wash cursor-pointer'
          : '',
        highlight ? 'bg-accent-wash' : '',
      ]"
      id="menu-item-add"
      v-bind="
        asButton
          ? {
              buttonStyle: 'primary',
              icon: buttonIcon,
              buttonSize: 'sm',
              disabled: disable,
            }
          : {
              role: 'menuitem',
              tabindex: -1,
              'aria-disabled': disable || undefined,
              onKeydown: activateWithKeyboard,
            }
      "
    >
      <template v-if="!asButton">
        <BaseIcon
          v-if="icon"
          class="size-(--menu-icon-size) shrink-0 fill-current"
          :name="icon"
        />
        {{ label }}
      </template>
    </component>

    <div v-if="disable && tooltipLabel" class="mr-3">
      <base-tooltip position="top-right" :tooltip-offset="8">
        <template #activator="{ on, describedBy }">
          <div v-on="on" :aria-describedby="describedBy">
            <unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <template #default>
          <span>
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
import { computed } from "vue";

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

const buttonIcon = computed(() =>
  Object.keys(Unicons).find(
    (iconKey) => Unicons[iconKey as keyof typeof Unicons].name === props.icon,
  ),
);

// A menuitem is no native button: Enter and Space need wiring.
const activateWithKeyboard = (event: KeyboardEvent) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  clicked();
};

const clicked = () => {
  if (!props.disable) {
    emit("clicked");
  }
};
</script>
