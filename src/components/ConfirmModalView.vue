<template>
  <div
    v-if="pendingConfirm"
    class="h-full flex flex-col justify-between p-4"
  >
    <div>
      <div class="title">{{ pendingConfirm.options.title }}</div>
      <div v-if="pendingConfirm.options.message" class="pt-4">
        {{ pendingConfirm.options.message }}
      </div>
    </div>
    <div class="flex justify-between pt-8">
      <div :class="[{ 'w-3/4': pendingConfirm.options.secondaryLabel }]">
        <div class="flex items-center gap-4">
          <BaseButton
            :label="pendingConfirm.options.confirmLabel"
            :button-style="pendingConfirm.options.confirmButtonStyle ?? 'danger'"
            :button-size="pendingConfirm.options.confirmButtonSize ?? 'sm'"
            @click="resolveConfirm('confirm')"
          />
          <BaseButton
            v-if="pendingConfirm.options.secondaryLabel"
            :label="pendingConfirm.options.secondaryLabel"
            :button-style="pendingConfirm.options.secondaryButtonStyle ?? 'danger'"
            :button-size="pendingConfirm.options.secondaryButtonSize ?? 'sm'"
            @click="resolveConfirm('secondary')"
          />
        </div>
      </div>
      <div class="flex items-center">
        <BaseButton
          :label="pendingConfirm.options.cancelLabel"
          :button-style="pendingConfirm.options.cancelButtonStyle ?? 'secondary'"
          :button-size="pendingConfirm.options.cancelButtonSize ?? 'sm'"
          @click="resolveConfirm('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

const { pendingConfirm, resolveConfirm } = useConfirmModal();
</script>
