<template>
  <div class="flex justify-between pt-8">
    <BaseButtonNew
      :label="confirmLabel"
      :button-style="confirmButtonStyle ?? 'danger'"
      :button-size="confirmButtonSize ?? 'sm'"
      :loading="confirmLoading"
      @click="emit('confirm')"
    />
    <BaseButtonNew
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
} from "@/components/base/BaseButtonNew.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

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
