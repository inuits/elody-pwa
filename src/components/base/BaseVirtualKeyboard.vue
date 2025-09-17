<template>
  <div>
    <BaseTooltip position="top-end" :tooltip-offset="8">
      <template #activator="{ on }">
        <div
          v-on="on"
          class="cursor-pointer rounded-md text-[#607d8b]"
          @click="toggleKeyboard"
        >
          <unicon :name="Unicons.Keyboard.name" />
        </div>
      </template>
      <span class="text-sm text-text-placeholder">
        {{ t("metadata.labels.virtual-keyboard") }}
      </span>
    </BaseTooltip>

    <div v-show="isOpen">
      <div :class="`${generalKeyboardClass} simple-keyboard`" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useI18n } from "vue-i18n";
import { useVirtualKeyboard } from "@/composables/useBaseVirtualKeyboard";
import "simple-keyboard/build/css/index.css";

interface SimpleKeyboardLayout {
  default: string[];
  shift: string[];
  [key: string]: string[];
}

interface KeyboardLayouts {
  [langCode: string]: SimpleKeyboardLayout;
}

const emit = defineEmits<{
  (event: "onChange", input: string): void;
  (event: "onKeyPress", button: string): void;
  (event: "isOpen", isOpen: boolean): void;
}>();

const props = defineProps<{
  keyboardClass?: string;
  input: string;
  layouts?: KeyboardLayouts;
}>();

const { t } = useI18n();
const generalKeyboardClass = `${props.keyboardClass}` || "simple-keyboard";

const { isOpen, toggleKeyboard } = useVirtualKeyboard(
  props,
  emit,
  generalKeyboardClass,
);

watch(
  () => isOpen.value,
  (newState) => {
    emit("isOpen", newState);
  },
);
</script>

<style>
.hg-theme-default {
  position: fixed;
  align-content: center;
  bottom: 100px;
  z-index: var(--z-virtual-keyboard);
  max-width: 50%;
  left: 50%;
  transform: translateX(-50%);
}

.hg-theme-default .hg-row:first-of-type {
  justify-content: flex-end;
}

.customButton {
  flex-grow: 0 !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
}
</style>
