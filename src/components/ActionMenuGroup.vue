<template>
  <div class="flex flex-row justify-center items-center">
    <BaseButtonNew
      v-if="primaryOption"
      class="-mr-4"
      button-style="accentNormal"
      :label="t(primaryOption.label)"
      @click="handleEmit(primaryOption)"
    />
    <BaseButtonNew
      v-if="secondaryOptions.length > 0"
      :icon="DamsIcons.EllipsisV"
      class="!w-1/5 !border-l-2 border-white"
      @click.stop="(event: MouseEvent) => {
        console.log(event)
        contextMenuHandler.openContextMenu({x: event.clientX, y: event.clientY})
      }"
    />

    <BaseContextMenu
      :context-menu="contextMenuHandler.getContextMenu()"
      direction="left"
    >
      <div role="none">
        <BaseContextMenuItem
          v-for="(option, idx) in secondaryOptions"
          :key="idx"
          @clicked="handleEmit(option)"
          :label="t(option.label)"
        />
      </div>
    </BaseContextMenu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import { DropdownOption, DamsIcons } from "@/generated-types/queries";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue?: DropdownOption;
  options: DropdownOption[];
}>();
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const { t } = useI18n();

const primaryOption = computed(() => {
  return props.options.find((item: DropdownOption) => item.primary);
});

const secondaryOptions = computed(() => {
  return props.options.filter((item: DropdownOption) => !item?.primary);
});

const handleEmit = (action: DropdownOption) => {
  emit("update:modelValue", action);
};
</script>
