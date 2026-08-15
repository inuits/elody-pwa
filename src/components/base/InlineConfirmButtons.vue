<template>
  <div class="flex justify-between pt-8">
    <BaseButton
      :label="confirmLabel"
      :button-style="confirmButtonStyle ?? 'danger'"
      :button-size="confirmButtonSize ?? 'sm'"
      :loading="confirmLoading"
      @click="emit('confirm')"
    />
    <BaseButton
      :label="cancelLabel"
      :button-style="cancelButtonStyle ?? 'secondary'"
      :button-size="cancelButtonSize ?? 'sm'"
      :disabled="confirmLoading"
      @click="emit('cancel')"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  ButtonSize,
  ButtonStyle,
} from "@/components/base/BaseButton.vue";
import BaseButton from "@/components/base/BaseButton.vue";

defineProps<{
  confirmLabel: string;
  cancelLabel: string;
  confirmButtonStyle?: ButtonStyle;
  cancelButtonStyle?: ButtonStyle;
  confirmButtonSize?: ButtonSize;
  cancelButtonSize?: ButtonSize;
  confirmLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>
