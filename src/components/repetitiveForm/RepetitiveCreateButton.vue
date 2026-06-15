<template>
  <div class="w-fit" data-testid="repetitive-create-button">
    <BaseButtonNew
      data-testid="repetitive-step-create-new"
      :label="$t(label)"
      :icon="DamsIcons.Plus"
      button-style="accentAccent"
      button-size="small"
      @click.stop="onClick"
    />
    <BaseContextMenu
      v-if="types.length > 1"
      :context-menu="contextMenuHandler.getContextMenu()"
      :direction="ContextMenuDirection.Left"
    >
      <BaseContextMenuItem
        v-for="(type, idx) in types"
        :key="idx"
        data-testid="repetitive-create-type-option"
        :label="$t(type.label)"
        @clicked="select(type)"
      />
    </BaseContextMenu>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  ContextMenuDirection,
  DamsIcons,
  type RepetitiveCreatableType,
} from "@/generated-types/queries";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";

const props = withDefaults(
  defineProps<{
    types: RepetitiveCreatableType[];
    label?: string;
  }>(),
  { label: "repetitiveForm.create-new" },
);

const emit = defineEmits<{
  (e: "select", type: RepetitiveCreatableType): void;
}>();

const contextMenuHandler = ref(new ContextMenuHandler());

// a single creatable type needs no menu — pick it straight away; multiple
// types open a dropdown of buttons (one per type) at the click position
const onClick = (event: MouseEvent) => {
  if (props.types.length <= 1) {
    if (props.types[0]) emit("select", props.types[0]);
    return;
  }
  contextMenuHandler.value.openContextMenu({
    x: event.clientX,
    y: event.clientY,
  });
};

const select = (type: RepetitiveCreatableType) => {
  emit("select", type);
};
</script>
